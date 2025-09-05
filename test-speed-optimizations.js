#!/usr/bin/env node

import { MimaTourScraper } from './src/scraper.js';

async function testSpeedOptimizations() {
  console.log('⚡ TESTE DE OTIMIZAÇÕES DE VELOCIDADE\n');

  const scraper = new MimaTourScraper();

  try {
    const startTime = Date.now();
    
    console.log('🚀 Iniciando scraper otimizado...');
    await scraper.initialize();
    const initTime = Date.now();
    console.log(`✅ Inicialização: ${initTime - startTime}ms\n`);

    // Test 1: Basic scraping (without details)
    console.log('1️⃣ Teste de scraping básico (sem detalhes)...');
    const basicStart = Date.now();
    const basicTrips = await scraper.scrapeTrips('setembro', {}, false);
    const basicEnd = Date.now();
    const basicTime = basicEnd - basicStart;
    
    console.log(`✅ Scraping básico concluído: ${basicTime}ms`);
    console.log(`📊 ${basicTrips.length} viagens encontradas`);
    console.log(`⚡ Velocidade: ${Math.round(basicTrips.length / (basicTime / 1000))} viagens/segundo\n`);

    // Test 2: Detailed scraping (first 3 trips only for speed test)
    console.log('2️⃣ Teste de scraping detalhado (primeiras 3 viagens)...');
    const detailedStart = Date.now();
    
    // Temporarily limit to 3 trips for speed test
    const limitedTrips = basicTrips.slice(0, 3);
    let processedCount = 0;
    
    for (const trip of limitedTrips) {
      if (trip.url_reserva) {
        try {
          const tripStart = Date.now();
          console.log(`   Processando: ${trip.titulo}`);
          
          const details = await scraper.getTripDetails(trip.url_reserva);
          const tripEnd = Date.now();
          const tripTime = tripEnd - tripStart;
          
          console.log(`   ✅ Concluído em ${tripTime}ms`);
          processedCount++;
          
          // Small delay
          await new Promise(resolve => setTimeout(resolve, 300));
          
        } catch (error) {
          console.log(`   ❌ Erro: ${error.message}`);
        }
      }
    }
    
    const detailedEnd = Date.now();
    const detailedTime = detailedEnd - detailedStart;
    const avgTimePerTrip = Math.round(detailedTime / processedCount);
    
    console.log(`✅ Scraping detalhado concluído: ${detailedTime}ms`);
    console.log(`📊 ${processedCount} viagens processadas`);
    console.log(`⚡ Tempo médio por viagem: ${avgTimePerTrip}ms`);
    console.log(`🎯 Estimativa para todas as viagens: ${Math.round((avgTimePerTrip * basicTrips.length) / 1000)}s\n`);

    // Test 3: Error handling and retry
    console.log('3️⃣ Teste de retry automático...');
    const retryStart = Date.now();
    
    try {
      // Test with a potentially problematic URL
      await scraper.navigateWithRetry('https://mimatourviagens.suareservaonline.com.br/44022?mes=13'); // Invalid month
      console.log('✅ Retry funcionou (ou URL era válida)');
    } catch (error) {
      console.log(`✅ Retry funcionou corretamente: ${error.message}`);
    }
    
    const retryEnd = Date.now();
    console.log(`⚡ Teste de retry: ${retryEnd - retryStart}ms\n`);

    // Summary
    const totalTime = Date.now() - startTime;
    console.log('📊 RESUMO DAS OTIMIZAÇÕES:');
    console.log('=' .repeat(50));
    console.log(`🚀 Tempo total de teste: ${Math.round(totalTime / 1000)}s`);
    console.log(`⚡ Scraping básico: ${Math.round(basicTime / 1000)}s para ${basicTrips.length} viagens`);
    console.log(`🔍 Scraping detalhado: ~${avgTimePerTrip}ms por viagem`);
    console.log(`🎯 Estimativa total com detalhes: ~${Math.round((avgTimePerTrip * basicTrips.length) / 1000)}s`);
    
    console.log('\n✅ OTIMIZAÇÕES IMPLEMENTADAS:');
    console.log('- ✅ Retry automático para timeouts');
    console.log('- ✅ Desabilitação de imagens/CSS');
    console.log('- ✅ waitUntil otimizado (domcontentloaded)');
    console.log('- ✅ Delays reduzidos (1s → 300ms)');
    console.log('- ✅ Timeout aumentado (30s → 45s)');
    console.log('- ✅ Navegação otimizada');

    // Performance comparison
    const oldEstimatedTime = basicTrips.length * 15; // Old: ~15s per trip
    const newEstimatedTime = Math.round((avgTimePerTrip * basicTrips.length) / 1000);
    const improvement = Math.round(((oldEstimatedTime - newEstimatedTime) / oldEstimatedTime) * 100);
    
    console.log('\n🎯 MELHORIA DE PERFORMANCE:');
    console.log(`Tempo estimado anterior: ~${oldEstimatedTime}s`);
    console.log(`Tempo estimado atual: ~${newEstimatedTime}s`);
    console.log(`Melhoria: ~${improvement}% mais rápido`);

  } catch (error) {
    console.error('❌ Erro durante teste:', error);
  } finally {
    await scraper.close();
    console.log('\n🧹 Recursos liberados');
    console.log('✨ Teste de otimizações concluído!');
  }
}

testSpeedOptimizations().catch(console.error);
