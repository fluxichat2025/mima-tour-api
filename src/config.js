import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

export const config = {
  // API Configuration
  api: {
    name: 'Mima Tour Travel API',
    version: '1.0.0',
    description: 'API para buscar viagens e pacotes turísticos da Mima Tour'
  },

  // Mima Tour Website Configuration
  mimaTour: {
    baseUrl: process.env.MIMA_TOUR_BASE_URL || 'https://mimatourviagens.suareservaonline.com.br/44022',
    searchParams: process.env.MIMA_TOUR_SEARCH_PARAMS || 'destino=&category=&embarque=',
    buildUrl: function(month = 'all') {
      return `${this.baseUrl}?mes=${month}&${this.searchParams}`;
    },
    months: {
      'all': 'all',
      'janeiro': '01',
      'fevereiro': '02',
      'março': '03',
      'abril': '04',
      'maio': '05',
      'junho': '06',
      'julho': '07',
      'agosto': '08',
      'setembro': '09',
      'outubro': '10',
      'novembro': '11',
      'dezembro': '12'
    }
  },

  // Scraping Configuration
  scraping: {
    timeout: parseInt(process.env.SCRAPING_TIMEOUT) || 30000,
    waitTime: parseInt(process.env.SCRAPING_WAIT_TIME) || 2000,
    headless: process.env.HEADLESS_MODE !== 'false',
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    viewport: {
      width: 1920,
      height: 1080
    }
  },

  // MCP Server Configuration
  mcp: {
    serverName: process.env.MCP_SERVER_NAME || 'websearch-mcp-mima-tour',
    serverVersion: process.env.MCP_SERVER_VERSION || '1.0.0'
  },

  // Debug Configuration
  debug: {
    enabled: process.env.DEBUG === 'true',
    logLevel: process.env.LOG_LEVEL || 'info'
  }
};

export default config;
