#!/usr/bin/env node

import { MimaTourScraper } from './src/scraper.js';

async function debugSingleTrip() {
  console.log('🔍 DEBUG DE UMA VIAGEM ESPECÍFICA\n');

  const scraper = new MimaTourScraper();

  try {
    await scraper.initialize();
    console.log('✅ Scraper inicializado\n');

    // Test with a specific trip URL
    const tripUrl = 'https://mimatourviagens.suareservaonline.com.br/pacote/ilhabela-datas-setembro-2025-uid749/44022';
    console.log(`🌐 Analisando viagem: ${tripUrl}\n`);

    await scraper.page.goto(tripUrl, { 
      waitUntil: 'networkidle2',
      timeout: 30000 
    });

    await new Promise(resolve => setTimeout(resolve, 5000));

    // Get page content for analysis
    const pageAnalysis = await scraper.page.evaluate(() => {
      // Get all text content
      const allText = document.body.textContent;
      
      // Find price patterns
      const pricePatterns = allText.match(/R\$\s*\d+[,.]?\d*/g) || [];
      
      // Find date patterns
      const datePatterns = allText.match(/\d{1,2}\/\d{1,2}\/\d{4}|\d{1,2} de \w+/g) || [];
      
      // Find time patterns
      const timePatterns = allText.match(/\d{1,2}:\d{2}/g) || [];
      
      // Get specific elements
      const titles = Array.from(document.querySelectorAll('h1, h2, h3, h4')).map(el => el.textContent.trim());
      const paragraphs = Array.from(document.querySelectorAll('p')).map(el => el.textContent.trim()).filter(text => text.length > 20);
      
      // Look for specific keywords
      const embarqueText = allText.match(/embarque[^.]*?(?=\.|$)/gi) || [];
      const incluiText = allText.match(/inclui[^.]*?(?=\.|$)/gi) || [];
      const investimentoText = allText.match(/investimento[^.]*?(?=\.|$)/gi) || [];
      
      return {
        url: window.location.href,
        title: document.title,
        pricePatterns,
        datePatterns,
        timePatterns,
        titles,
        paragraphs: paragraphs.slice(0, 10), // First 10 paragraphs
        embarqueText,
        incluiText,
        investimentoText,
        bodyLength: allText.length
      };
    });

    console.log('📄 ANÁLISE DA PÁGINA:');
    console.log('=' .repeat(60));
    console.log(`Título: ${pageAnalysis.title}`);
    console.log(`URL: ${pageAnalysis.url}`);
    console.log(`Tamanho do conteúdo: ${pageAnalysis.bodyLength} caracteres\n`);

    console.log('💰 PREÇOS ENCONTRADOS:');
    pageAnalysis.pricePatterns.forEach((price, i) => {
      console.log(`${i + 1}. ${price}`);
    });

    console.log('\n📅 DATAS ENCONTRADAS:');
    pageAnalysis.datePatterns.forEach((date, i) => {
      console.log(`${i + 1}. ${date}`);
    });

    console.log('\n🕐 HORÁRIOS ENCONTRADOS:');
    pageAnalysis.timePatterns.forEach((time, i) => {
      console.log(`${i + 1}. ${time}`);
    });

    console.log('\n📋 TÍTULOS ENCONTRADOS:');
    pageAnalysis.titles.forEach((title, i) => {
      console.log(`${i + 1}. ${title}`);
    });

    console.log('\n🚌 TEXTO SOBRE EMBARQUE:');
    pageAnalysis.embarqueText.forEach((text, i) => {
      console.log(`${i + 1}. ${text.substring(0, 100)}...`);
    });

    console.log('\n✅ TEXTO SOBRE O QUE INCLUI:');
    pageAnalysis.incluiText.forEach((text, i) => {
      console.log(`${i + 1}. ${text.substring(0, 100)}...`);
    });

    console.log('\n💰 TEXTO SOBRE INVESTIMENTO:');
    pageAnalysis.investimentoText.forEach((text, i) => {
      console.log(`${i + 1}. ${text.substring(0, 100)}...`);
    });

    console.log('\n📝 PARÁGRAFOS PRINCIPAIS:');
    pageAnalysis.paragraphs.forEach((paragraph, i) => {
      console.log(`${i + 1}. ${paragraph.substring(0, 150)}...`);
    });

    // Take screenshot for visual analysis
    await scraper.page.screenshot({ 
      path: 'debug-single-trip.png',
      fullPage: true 
    });
    console.log('\n📸 Screenshot salvo como: debug-single-trip.png');

    // Save raw HTML for analysis
    const html = await scraper.page.content();
    const fs = await import('fs');
    fs.writeFileSync('debug-single-trip.html', html);
    console.log('💾 HTML salvo como: debug-single-trip.html');

  } catch (error) {
    console.error('❌ Erro durante debug:', error);
  } finally {
    await scraper.close();
    console.log('\n🧹 Recursos liberados');
  }
}

debugSingleTrip().catch(console.error);
