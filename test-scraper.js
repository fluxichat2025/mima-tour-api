#!/usr/bin/env node

import { MimaTourScraper } from './src/scraper.js';
import { config } from './src/config.js';

async function testSpecificSelector() {
  console.log('🧪 Testando seletor específico .package-item...\n');

  const scraper = new MimaTourScraper();

  try {
    await scraper.initialize();
    console.log('✅ Scraper inicializado');

    const url = config.mimaTour.fullUrl();
    console.log(`🌐 Navegando para: ${url}`);

    await scraper.page.goto(url, { 
      waitUntil: 'networkidle2',
      timeout: config.scraping.timeout 
    });

    console.log('✅ Página carregada');

    // Wait for content to load
    await new Promise(resolve => setTimeout(resolve, 5000));

    // Test specific selector
    const testResults = await scraper.page.evaluate(() => {
      // Define helper functions in page context
      window.extractText = function(element, selector) {
        const target = selector ? element.querySelector(selector) : element;
        return target ? target.textContent.trim() : '';
      };

      window.extractImage = function(element) {
        const img = element.querySelector('img');
        return img ? img.src : '';
      };

      window.extractLink = function(element) {
        const link = element.querySelector('a');
        return link ? link.href : '';
      };

      const packageItems = document.querySelectorAll('.package-item');
      console.log(`Found ${packageItems.length} .package-item elements`);

      const results = [];
      
      packageItems.forEach((element, index) => {
        const trip = {
          id: index + 1,
          title: window.extractText(element, 'h1, h2, h3, h4, h5, h6, .title, .nome, .package-title, [class*="title"], [class*="nome"], strong, b'),
          price: window.extractText(element, '.price, .preco, .valor, [class*="price"], [class*="preco"], [class*="valor"], [class*="R$"]'),
          destination: window.extractText(element, '.destination, .destino, .local, [class*="destination"], [class*="destino"], [class*="local"]'),
          date: window.extractText(element, '.date, .data, .periodo, [class*="date"], [class*="data"], [class*="periodo"]'),
          description: window.extractText(element, '.description, .descricao, .resumo, p, .text, [class*="desc"]'),
          image: window.extractImage(element),
          link: window.extractLink(element),
          duration: window.extractText(element, '.duration, .duracao, .dias, [class*="duration"], [class*="dias"]'),
          category: window.extractText(element, '.category, .categoria, .tipo, [class*="category"], [class*="tipo"]'),
          rawText: element.textContent ? element.textContent.trim().substring(0, 300) : '',
          className: element.className,
          innerHTML: element.innerHTML.substring(0, 500)
        };

        results.push(trip);
      });

      return {
        count: packageItems.length,
        trips: results
      };
    });

    console.log(`\n📊 Resultados do teste:`);
    console.log(`Elementos .package-item encontrados: ${testResults.count}`);

    if (testResults.count > 0) {
      console.log('\n🎯 Primeira viagem extraída:');
      const firstTrip = testResults.trips[0];
      console.log(`ID: ${firstTrip.id}`);
      console.log(`Classe: ${firstTrip.className}`);
      console.log(`Título: ${firstTrip.title || 'NÃO ENCONTRADO'}`);
      console.log(`Preço: ${firstTrip.price || 'NÃO ENCONTRADO'}`);
      console.log(`Destino: ${firstTrip.destination || 'NÃO ENCONTRADO'}`);
      console.log(`Data: ${firstTrip.date || 'NÃO ENCONTRADO'}`);
      console.log(`Descrição: ${firstTrip.description ? firstTrip.description.substring(0, 100) + '...' : 'NÃO ENCONTRADO'}`);
      console.log(`Imagem: ${firstTrip.image || 'NÃO ENCONTRADO'}`);
      console.log(`Link: ${firstTrip.link || 'NÃO ENCONTRADO'}`);
      console.log(`Texto bruto: ${firstTrip.rawText.substring(0, 200)}...`);
      console.log(`HTML (primeiros 300 chars): ${firstTrip.innerHTML.substring(0, 300)}...`);

      if (testResults.trips.length > 1) {
        console.log(`\n📋 Total de ${testResults.trips.length} viagens encontradas`);
        testResults.trips.forEach((trip, index) => {
          console.log(`${index + 1}. ${trip.title || 'Sem título'} - ${trip.price || 'Sem preço'}`);
        });
      }
    } else {
      console.log('❌ Nenhum elemento .package-item encontrado');
      
      // Try alternative selectors
      const alternatives = await scraper.page.evaluate(() => {
        const selectors = [
          '[class*="package"]',
          '.bg-white.mb-2',
          '.p-4',
          'div[class*="package"]'
        ];
        
        const results = {};
        selectors.forEach(selector => {
          const elements = document.querySelectorAll(selector);
          results[selector] = elements.length;
        });
        
        return results;
      });
      
      console.log('\n🔍 Testando seletores alternativos:');
      Object.entries(alternatives).forEach(([selector, count]) => {
        console.log(`${selector}: ${count} elementos`);
      });
    }

  } catch (error) {
    console.error('❌ Erro durante teste:', error);
  } finally {
    await scraper.close();
  }
}

testSpecificSelector().catch(console.error);
