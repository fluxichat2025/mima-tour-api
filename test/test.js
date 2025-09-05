import { MimaTourScraper } from '../src/scraper.js';
import { GrokIntegration } from '../src/grok-integration.js';
import { config } from '../src/config.js';

async function testScraper() {
  console.log('🧪 Testing Mima Tour Scraper...');
  
  const scraper = new MimaTourScraper();
  
  try {
    await scraper.initialize();
    console.log('✅ Scraper initialized successfully');
    
    const trips = await scraper.scrapeTrips();
    console.log(`✅ Found ${trips.length} trips`);
    
    if (trips.length > 0) {
      console.log('📋 First trip sample:');
      console.log(JSON.stringify(trips[0], null, 2));
    }
    
    await scraper.close();
    console.log('✅ Scraper closed successfully');
    
  } catch (error) {
    console.error('❌ Scraper test failed:', error);
  }
}

async function testGrokIntegration() {
  console.log('\n🧪 Testing Grok Integration...');
  
  const grok = new GrokIntegration();
  
  try {
    const connectionTest = await grok.testConnection();
    
    if (connectionTest.success) {
      console.log('✅ Grok connection successful');
      
      // Test destination search
      const destinationInfo = await grok.searchDestinationInfo('Paris');
      console.log('✅ Destination search successful');
      console.log('📋 Paris info sample:', JSON.stringify(destinationInfo, null, 2));
      
    } else {
      console.error('❌ Grok connection failed:', connectionTest.error);
    }
    
  } catch (error) {
    console.error('❌ Grok test failed:', error);
  }
}

async function testFullWorkflow() {
  console.log('\n🧪 Testing Full Workflow...');
  
  const scraper = new MimaTourScraper();
  const grok = new GrokIntegration();
  
  try {
    // Scrape trips
    await scraper.initialize();
    const trips = await scraper.scrapeTrips();
    
    if (trips.length > 0) {
      console.log(`✅ Scraped ${trips.length} trips`);
      
      // Enrich first trip with Grok
      const enrichedTrip = await grok.enrichTripInformation(trips[0]);
      console.log('✅ Trip enriched with Grok AI');
      console.log('📋 Enriched trip sample:');
      console.log(JSON.stringify(enrichedTrip, null, 2));
    }
    
    await scraper.close();
    
  } catch (error) {
    console.error('❌ Full workflow test failed:', error);
  }
}

async function runTests() {
  console.log('🚀 Starting WebSearch MCP Tests\n');
  console.log('Configuration:');
  console.log(`- Mima Tour URL: ${config.mimaTour.fullUrl()}`);
  console.log(`- Grok API URL: ${config.grok.apiUrl}`);
  console.log(`- Headless mode: ${config.scraping.headless}\n`);
  
  await testScraper();
  await testGrokIntegration();
  await testFullWorkflow();
  
  console.log('\n✨ Tests completed!');
}

// Run tests if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  runTests().catch(console.error);
}

export { testScraper, testGrokIntegration, testFullWorkflow };
