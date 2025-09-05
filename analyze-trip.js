#!/usr/bin/env node

import { MimaTourScraper } from './src/scraper.js';
import { config } from './src/config.js';

async function analyzeTripStructure() {
  console.log('🔬 Analisando estrutura detalhada de uma viagem...\n');

  const scraper = new MimaTourScraper();

  try {
    await scraper.initialize();
    await scraper.page.goto(config.mimaTour.fullUrl(), { 
      waitUntil: 'networkidle2',
      timeout: config.scraping.timeout 
    });

    await new Promise(resolve => setTimeout(resolve, 5000));

    // Get detailed structure of first few trips
    const analysis = await scraper.page.evaluate(() => {
      const packageItems = document.querySelectorAll('.package-item');
      const results = [];
      
      // Analyze first 3 trips in detail
      for (let i = 0; i < Math.min(3, packageItems.length); i++) {
        const element = packageItems[i];
        
        // Get all text nodes and their parent elements
        const textNodes = [];
        const walker = document.createTreeWalker(
          element,
          NodeFilter.SHOW_TEXT,
          null,
          false
        );
        
        let node;
        while (node = walker.nextNode()) {
          const text = node.textContent.trim();
          if (text && text.length > 2) {
            textNodes.push({
              text: text,
              parentTag: node.parentElement.tagName,
              parentClass: node.parentElement.className,
              parentId: node.parentElement.id
            });
          }
        }
        
        // Get all elements with classes
        const elementsWithClasses = [];
        const allElements = element.querySelectorAll('*');
        allElements.forEach(el => {
          if (el.className) {
            elementsWithClasses.push({
              tag: el.tagName,
              className: el.className,
              text: el.textContent.trim().substring(0, 100),
              hasPrice: /R\$|reais|real|\d+[,\.]\d+/.test(el.textContent)
            });
          }
        });
        
        results.push({
          index: i,
          textNodes: textNodes.slice(0, 20), // First 20 text nodes
          elementsWithClasses: elementsWithClasses.slice(0, 30), // First 30 elements
          fullHTML: element.innerHTML.substring(0, 1000)
        });
      }
      
      return results;
    });

    analysis.forEach((trip, index) => {
      console.log(`\n🎯 VIAGEM ${index + 1}:`);
      console.log('─'.repeat(50));
      
      console.log('\n📝 Nós de texto encontrados:');
      trip.textNodes.forEach((node, i) => {
        console.log(`${i + 1}. "${node.text}" (${node.parentTag}.${node.parentClass})`);
      });
      
      console.log('\n🏷️ Elementos com classes (potenciais preços marcados com 💰):');
      trip.elementsWithClasses.forEach((el, i) => {
        const priceIndicator = el.hasPrice ? '💰 ' : '   ';
        console.log(`${priceIndicator}${i + 1}. ${el.tag}.${el.className}: "${el.text}"`);
      });
      
      console.log('\n🔍 HTML (primeiros 500 chars):');
      console.log(trip.fullHTML.substring(0, 500) + '...');
    });

  } catch (error) {
    console.error('❌ Erro durante análise:', error);
  } finally {
    await scraper.close();
  }
}

analyzeTripStructure().catch(console.error);
