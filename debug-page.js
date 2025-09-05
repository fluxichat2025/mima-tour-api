#!/usr/bin/env node

import puppeteer from 'puppeteer';
import { config } from './src/config.js';

async function debugPage() {
  console.log('🔍 Debug da página...\n');

  const browser = await puppeteer.launch({
    headless: false, // Mostrar navegador
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage();
  
  try {
    const url = config.mimaTour.fullUrl();
    console.log(`🌐 Navegando para: ${url}`);

    await page.goto(url, { waitUntil: 'networkidle2', timeout: 30000 });
    console.log('✅ Página carregada');

    // Wait longer
    console.log('⏳ Aguardando 10 segundos...');
    await new Promise(resolve => setTimeout(resolve, 10000));

    const pageInfo = await page.evaluate(() => {
      return {
        title: document.title,
        url: window.location.href,
        bodyExists: !!document.body,
        packageItems: document.querySelectorAll('.package-item').length,
        allDivs: document.querySelectorAll('div').length,
        hasJavaScript: !!window.jQuery || !!window.$,
        bodyText: document.body ? document.body.textContent.substring(0, 500) : 'No body'
      };
    });

    console.log('\n📄 Informações da página:');
    console.log(`Título: ${pageInfo.title}`);
    console.log(`URL: ${pageInfo.url}`);
    console.log(`Body existe: ${pageInfo.bodyExists}`);
    console.log(`Package items: ${pageInfo.packageItems}`);
    console.log(`Total divs: ${pageInfo.allDivs}`);
    console.log(`JavaScript: ${pageInfo.hasJavaScript}`);
    console.log(`Texto inicial: ${pageInfo.bodyText.substring(0, 200)}...`);

    // Take screenshot
    await page.screenshot({ path: 'debug-page.png', fullPage: true });
    console.log('\n📸 Screenshot salvo como debug-page.png');

    console.log('\n⏳ Aguardando 30 segundos para análise manual...');
    await new Promise(resolve => setTimeout(resolve, 30000));

  } catch (error) {
    console.error('❌ Erro:', error);
  } finally {
    await browser.close();
  }
}

debugPage().catch(console.error);
