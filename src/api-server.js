#!/usr/bin/env node

import express from 'express';
import cors from 'cors';
import { MimaTourScraper } from './scraper.js';
import { config } from './config.js';

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Initialize scraper
const scraper = new MimaTourScraper();

// Routes

/**
 * @route GET /
 * @desc API documentation and available endpoints
 */
app.get('/', (req, res) => {
  res.json({
    name: config.api.name,
    version: config.api.version,
    description: config.api.description,
    endpoints: {
      'GET /': 'API documentation',
      'GET /trips': 'Get all trips (default: current month)',
      'GET /trips/:month': 'Get trips for specific month',
      'GET /trips/price/:min/:max': 'Get trips within price range',
      'GET /months': 'Get available months',
      'GET /health': 'Health check'
    },
    examples: {
      'All trips (basic)': '/trips',
      'All trips (detailed)': '/trips?details=true',
      'September trips': '/trips/setembro or /trips/09',
      'September trips (detailed)': '/trips/setembro?details=true',
      'October trips': '/trips/outubro or /trips/10',
      'Price range': '/trips/price/50/200',
      'Available months': '/months'
    }
  });
});

/**
 * @route GET /health
 * @desc Health check endpoint
 */
app.get('/health', (req, res) => {
  res.json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

/**
 * @route GET /months
 * @desc Get available months for searching
 */
app.get('/months', (req, res) => {
  const months = config.mimaTour.months;
  const monthList = Object.keys(months).map(name => ({
    name,
    code: months[name],
    url: config.mimaTour.buildUrl(months[name])
  }));

  res.json({
    success: true,
    data: monthList,
    total: monthList.length
  });
});

/**
 * @route GET /trips
 * @desc Get all trips (default month: all)
 * @query details=true - Include detailed information for each trip
 */
app.get('/trips', async (req, res) => {
  try {
    const month = req.query.month || 'all';
    const includeDetails = req.query.details === 'true';
    const trips = await scraper.scrapeTrips(month, {}, includeDetails);

    res.json({
      success: true,
      month: month,
      includeDetails: includeDetails,
      data: trips,
      total: trips.length,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

/**
 * @route GET /trips/:month
 * @desc Get trips for specific month
 * @query details=true - Include detailed information for each trip
 */
app.get('/trips/:month', async (req, res) => {
  try {
    const { month } = req.params;
    const includeDetails = req.query.details === 'true';
    const trips = await scraper.scrapeTrips(month, {}, includeDetails);

    res.json({
      success: true,
      month: month,
      includeDetails: includeDetails,
      data: trips,
      total: trips.length,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
      month: req.params.month,
      timestamp: new Date().toISOString()
    });
  }
});

/**
 * @route GET /trips/price/:min/:max
 * @desc Get trips within price range
 */
app.get('/trips/price/:min/:max', async (req, res) => {
  try {
    const { min, max } = req.params;
    const month = req.query.month || 'all';
    const minPrice = parseFloat(min);
    const maxPrice = parseFloat(max);

    const trips = await scraper.scrapeTrips(month);
    
    // Filter trips by price range
    const filteredTrips = trips.filter(trip => {
      if (!trip.price) return false;
      
      const priceMatch = trip.price.match(/R\$\s*(\d+(?:,\d+)?)/);
      if (!priceMatch) return false;
      
      const price = parseFloat(priceMatch[1].replace(',', '.'));
      
      return price >= minPrice && price <= maxPrice;
    });

    res.json({
      success: true,
      month: month,
      priceRange: { min: minPrice, max: maxPrice },
      data: filteredTrips,
      total: filteredTrips.length,
      totalScraped: trips.length,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    success: false,
    error: 'Internal Server Error',
    timestamp: new Date().toISOString()
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: 'Endpoint not found',
    availableEndpoints: [
      'GET /',
      'GET /trips',
      'GET /trips/:month',
      'GET /trips/price/:min/:max',
      'GET /months',
      'GET /health'
    ],
    timestamp: new Date().toISOString()
  });
});

// Start server
async function startServer() {
  try {
    // Initialize scraper
    await scraper.initialize();
    console.log('✅ Scraper initialized');

    app.listen(PORT, () => {
      console.log(`🚀 ${config.api.name} v${config.api.version}`);
      console.log(`📡 Server running on http://localhost:${PORT}`);
      console.log(`📚 API Documentation: http://localhost:${PORT}`);
      console.log(`🏥 Health Check: http://localhost:${PORT}/health`);
      console.log(`🗓️ Available Months: http://localhost:${PORT}/months`);
      console.log(`✈️ All Trips: http://localhost:${PORT}/trips`);
      console.log(`📅 September Trips: http://localhost:${PORT}/trips/setembro`);
      console.log(`💰 Price Range: http://localhost:${PORT}/trips/price/50/200`);
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
}

// Graceful shutdown
process.on('SIGINT', async () => {
  console.log('\n🛑 Shutting down server...');
  await scraper.close();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  console.log('\n🛑 Shutting down server...');
  await scraper.close();
  process.exit(0);
});

// Start the server
startServer().catch(console.error);
