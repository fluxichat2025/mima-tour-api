#!/usr/bin/env node

import puppeteer from 'puppeteer';
import { config } from './src/config.js';

async function simpleTest() {
  console.log('🧪 Teste simples do scraper...\n');

  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage();
  
  try {
    const url = config.mimaTour.fullUrl();
    console.log(`🌐 Navegando para: ${url}`);

    await page.goto(url, { waitUntil: 'networkidle2', timeout: 30000 });
    await new Promise(resolve => setTimeout(resolve, 5000));

    const trips = await page.evaluate(() => {
      const packageItems = document.querySelectorAll('.package-item');
      console.log(`Found ${packageItems.length} package items`);
      
      const results = [];
      
      for (let i = 0; i < Math.min(5, packageItems.length); i++) {
        const element = packageItems[i];
        
        const title = element.querySelector('h4')?.textContent?.trim() || '';
        const priceEl = element.querySelector('.class_valor');
        const price = priceEl ? priceEl.textContent.trim() : '';
        const link = element.querySelector('a')?.href || '';
        const image = element.querySelector('img')?.src || '';
        
        results.push({
          id: i + 1,
          title,
          price,
          link,
          image,
          hasContent: title.length > 0
        });
      }
      
      return results;
    });

    console.log(`✅ Encontradas ${trips.length} viagens:`);
    trips.forEach((trip, index) => {
      console.log(`\n${index + 1}. ${trip.title || 'Sem título'}`);
      console.log(`   💰 ${trip.price || 'Sem preço'}`);
      console.log(`   🔗 ${trip.link ? 'Link disponível' : 'Sem link'}`);
      console.log(`   🖼️ ${trip.image ? 'Imagem disponível' : 'Sem imagem'}`);
    });

  } catch (error) {
    console.error('❌ Erro:', error);
  } finally {
    await browser.close();
  }
}

simpleTest().catch(console.error);
