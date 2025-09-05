#!/usr/bin/env node

import { MimaTourScraper } from './src/scraper.js';
import { config } from './src/config.js';

async function debugSite() {
  console.log('🔍 Analisando estrutura do site da Mima Tour...\n');

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

    // Get page title and basic info
    const pageInfo = await scraper.page.evaluate(() => {
      return {
        title: document.title,
        url: window.location.href,
        bodyText: document.body ? document.body.textContent.substring(0, 500) : 'No body',
        htmlLength: document.documentElement.outerHTML.length,
        hasContent: document.body && document.body.textContent.length > 100
      };
    });

    console.log('\n📄 Informações da página:');
    console.log(`Título: ${pageInfo.title}`);
    console.log(`URL: ${pageInfo.url}`);
    console.log(`Tamanho HTML: ${pageInfo.htmlLength} caracteres`);
    console.log(`Tem conteúdo: ${pageInfo.hasContent}`);
    console.log(`Texto inicial: ${pageInfo.bodyText.substring(0, 200)}...`);

    // Analyze page structure
    const structure = await scraper.page.evaluate(() => {
      const elements = {
        divs: document.querySelectorAll('div').length,
        sections: document.querySelectorAll('section').length,
        articles: document.querySelectorAll('article').length,
        cards: document.querySelectorAll('[class*="card"]').length,
        items: document.querySelectorAll('[class*="item"]').length,
        packages: document.querySelectorAll('[class*="package"]').length,
        trips: document.querySelectorAll('[class*="trip"]').length,
        viagens: document.querySelectorAll('[class*="viagem"]').length,
        images: document.querySelectorAll('img').length,
        links: document.querySelectorAll('a').length
      };

      // Get all class names
      const allElements = document.querySelectorAll('*');
      const classNames = new Set();
      allElements.forEach(el => {
        if (el.className && typeof el.className === 'string') {
          el.className.split(' ').forEach(cls => {
            if (cls.trim()) classNames.add(cls.trim());
          });
        }
      });

      return {
        elements,
        classNames: Array.from(classNames).slice(0, 50), // First 50 classes
        totalClasses: classNames.size
      };
    });

    console.log('\n🏗️ Estrutura da página:');
    Object.entries(structure.elements).forEach(([key, count]) => {
      console.log(`${key}: ${count}`);
    });

    console.log(`\n🏷️ Classes CSS encontradas (${structure.totalClasses} total):`);
    structure.classNames.forEach(cls => console.log(`  - ${cls}`));

    // Try to find potential trip containers
    const potentialContainers = await scraper.page.evaluate(() => {
      const containers = [];
      
      // Look for containers with multiple children
      const allDivs = document.querySelectorAll('div, section, article, ul, ol');
      
      allDivs.forEach((container, index) => {
        const childCount = container.children.length;
        if (childCount >= 2 && childCount <= 20) {
          const hasText = container.textContent && container.textContent.trim().length > 50;
          const hasImages = container.querySelectorAll('img').length > 0;
          const hasLinks = container.querySelectorAll('a').length > 0;
          
          if (hasText && (hasImages || hasLinks)) {
            containers.push({
              index,
              tagName: container.tagName,
              className: container.className,
              childCount,
              textLength: container.textContent.trim().length,
              hasImages,
              hasLinks,
              sampleText: container.textContent.trim().substring(0, 100)
            });
          }
        }
      });
      
      return containers.slice(0, 10); // Top 10 candidates
    });

    console.log('\n🎯 Possíveis containers de viagens:');
    potentialContainers.forEach((container, i) => {
      console.log(`\n${i + 1}. ${container.tagName} (${container.childCount} filhos)`);
      console.log(`   Classe: ${container.className || 'sem classe'}`);
      console.log(`   Texto: ${container.textLength} chars`);
      console.log(`   Imagens: ${container.hasImages}, Links: ${container.hasLinks}`);
      console.log(`   Amostra: "${container.sampleText}..."`);
    });

    // Take a screenshot for debugging
    await scraper.page.screenshot({ 
      path: 'debug-screenshot.png',
      fullPage: true 
    });
    console.log('\n📸 Screenshot salvo como debug-screenshot.png');

  } catch (error) {
    console.error('❌ Erro durante análise:', error);
  } finally {
    await scraper.close();
  }
}

debugSite().catch(console.error);
