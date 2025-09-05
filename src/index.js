#!/usr/bin/env node

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from '@modelcontextprotocol/sdk/types.js';
import { z } from 'zod';

import { config } from './config.js';
import { MimaTourScraper } from './scraper.js';

class WebSearchMCPServer {
  constructor() {
    this.server = new Server(
      {
        name: config.mcp.serverName,
        version: config.mcp.serverVersion,
      },
      {
        capabilities: {
          tools: {},
        },
      }
    );

    this.scraper = new MimaTourScraper();
    this.setupHandlers();
  }

  setupHandlers() {
    // List available tools
    this.server.setRequestHandler(ListToolsRequestSchema, async () => {
      return {
        tools: [
          {
            name: 'search_trips',
            description: 'Search for travel packages on Mima Tour website by month',
            inputSchema: {
              type: 'object',
              properties: {
                month: {
                  type: 'string',
                  description: 'Month to search (e.g., "setembro", "outubro", "all" for all months, or "09", "10" for numeric)',
                  enum: ['all', 'janeiro', 'fevereiro', 'março', 'abril', 'maio', 'junho', 'julho', 'agosto', 'setembro', 'outubro', 'novembro', 'dezembro', '01', '02', '03', '04', '05', '06', '07', '08', '09', '10', '11', '12']
                },
                destination: {
                  type: 'string',
                  description: 'Filter by destination (optional)',
                },
                category: {
                  type: 'string',
                  description: 'Filter by travel category (optional)',
                },
                departure: {
                  type: 'string',
                  description: 'Filter by departure location (optional)',
                },
              },
            },
          },
          {
            name: 'get_trip_details',
            description: 'Get detailed information about a specific trip',
            inputSchema: {
              type: 'object',
              properties: {
                tripLink: {
                  type: 'string',
                  description: 'URL link to the trip details page',
                },
              },
              required: ['tripLink'],
            },
          },
          {
            name: 'get_available_months',
            description: 'Get list of available months for searching trips',
            inputSchema: {
              type: 'object',
              properties: {},
            },
          },
          {
            name: 'search_trips_by_price_range',
            description: 'Search trips within a specific price range',
            inputSchema: {
              type: 'object',
              properties: {
                month: {
                  type: 'string',
                  description: 'Month to search (optional, defaults to "all")',
                },
                minPrice: {
                  type: 'number',
                  description: 'Minimum price in BRL (optional)',
                },
                maxPrice: {
                  type: 'number',
                  description: 'Maximum price in BRL (optional)',
                },
              },
            },
          },
        ],
      };
    });

    // Handle tool calls
    this.server.setRequestHandler(CallToolRequestSchema, async (request) => {
      const { name, arguments: args } = request.params;

      try {
        switch (name) {
          case 'search_trips':
            return await this.handleSearchTrips(args);

          case 'get_trip_details':
            return await this.handleGetTripDetails(args);

          case 'get_available_months':
            return await this.handleGetAvailableMonths();

          case 'search_trips_by_price_range':
            return await this.handleSearchTripsByPriceRange(args);

          default:
            throw new Error(`Unknown tool: ${name}`);
        }
      } catch (error) {
        return {
          content: [
            {
              type: 'text',
              text: `Error: ${error.message}`,
            },
          ],
        };
      }
    });
  }

  async handleSearchTrips(args) {
    const { month = 'all', ...filters } = args;
    const trips = await this.scraper.scrapeTrips(month, filters);

    return {
      content: [
        {
          type: 'text',
          text: `Found ${trips.length} trips for month "${month}":\n\n${JSON.stringify(trips, null, 2)}`,
        },
      ],
    };
  }

  async handleGetTripDetails(args) {
    const { tripLink } = args;
    const details = await this.scraper.getTripDetails(tripLink);
    
    return {
      content: [
        {
          type: 'text',
          text: `Trip details:\n\n${JSON.stringify(details, null, 2)}`,
        },
      ],
    };
  }

  async handleGetAvailableMonths() {
    const months = config.mimaTour.months;
    const monthList = Object.keys(months).map(name => ({
      name,
      code: months[name],
      url: config.mimaTour.buildUrl(months[name])
    }));

    return {
      content: [
        {
          type: 'text',
          text: `Available months for searching:\n\n${JSON.stringify(monthList, null, 2)}`,
        },
      ],
    };
  }

  async handleSearchTripsByPriceRange(args) {
    const { month = 'all', minPrice, maxPrice } = args;
    const trips = await this.scraper.scrapeTrips(month);

    // Filter trips by price range
    const filteredTrips = trips.filter(trip => {
      if (!trip.price) return false;

      const priceMatch = trip.price.match(/R\$\s*(\d+(?:,\d+)?)/);
      if (!priceMatch) return false;

      const price = parseFloat(priceMatch[1].replace(',', '.'));

      if (minPrice && price < minPrice) return false;
      if (maxPrice && price > maxPrice) return false;

      return true;
    });

    return {
      content: [
        {
          type: 'text',
          text: `Found ${filteredTrips.length} trips in price range R$${minPrice || 0} - R$${maxPrice || '∞'}:\n\n${JSON.stringify(filteredTrips, null, 2)}`,
        },
      ],
    };
  }

  async run() {
    const transport = new StdioServerTransport();
    await this.server.connect(transport);
    console.error('Mima Tour WebSearch MCP server running on stdio');
  }

  async cleanup() {
    await this.scraper.close();
  }
}

// Handle process termination
process.on('SIGINT', async () => {
  console.error('Received SIGINT, shutting down gracefully...');
  if (global.mcpServer) {
    await global.mcpServer.cleanup();
  }
  process.exit(0);
});

process.on('SIGTERM', async () => {
  console.error('Received SIGTERM, shutting down gracefully...');
  if (global.mcpServer) {
    await global.mcpServer.cleanup();
  }
  process.exit(0);
});

// Start the server
const mcpServer = new WebSearchMCPServer();
global.mcpServer = mcpServer;
mcpServer.run().catch(console.error);
