#!/usr/bin/env node

import { MimaTourScraper } from './src/scraper.js';

async function testDetailedScraping() {
  console.log('🧪 TESTE DE EXTRAÇÃO DETALHADA\n');
  console.log('=' .repeat(60));

  const scraper = new MimaTourScraper();

  try {
    await scraper.initialize();
    console.log('✅ Scraper inicializado\n');

    // Test with just a few trips to avoid overwhelming the server
    console.log('🔍 Buscando viagens de setembro (com detalhes completos)...');
    console.log('⚠️ Isso pode demorar alguns minutos pois extrai detalhes de cada viagem\n');
    
    const trips = await scraper.scrapeTrips('setembro');
    
    console.log(`✅ Encontradas ${trips.length} viagens com detalhes completos!\n`);

    if (trips.length > 0) {
      // Show detailed info for first trip
      const firstTrip = trips[0];
      console.log('📋 EXEMPLO DE VIAGEM DETALHADA:');
      console.log('=' .repeat(60));
      console.log(JSON.stringify(firstTrip, null, 2));
      console.log('=' .repeat(60));

      // Show summary of all trips
      console.log('\n📊 RESUMO DE TODAS AS VIAGENS:');
      console.log('-' .repeat(60));
      trips.forEach((trip, index) => {
        console.log(`\n${index + 1}. ${trip.titulo}`);
        console.log(`   💰 PIX: ${trip.investimento.pix || 'N/A'}`);
        console.log(`   💳 Cartão: ${trip.investimento.cartao_credito || 'N/A'}`);
        console.log(`   📅 Datas: ${trip.data_saida.join(', ') || 'N/A'}`);
        console.log(`   🚌 Embarques: ${trip.embarques.length} locais`);
        console.log(`   ✅ Inclui: ${trip.o_que_inclui.length} itens`);
        console.log(`   🔗 URL: ${trip.url_reserva ? 'Disponível' : 'N/A'}`);
      });

      // Statistics
      console.log('\n📈 ESTATÍSTICAS:');
      console.log('-' .repeat(60));
      const withPix = trips.filter(t => t.investimento.pix);
      const withDates = trips.filter(t => t.data_saida.length > 0);
      const withEmbarques = trips.filter(t => t.embarques.length > 0);
      const withIncludes = trips.filter(t => t.o_que_inclui.length > 0);
      const withRoteiro = trips.filter(t => t.roteiro && t.roteiro !== 'Informações não disponíveis');

      console.log(`📊 Total de viagens: ${trips.length}`);
      console.log(`💰 Com preço PIX: ${withPix.length} (${Math.round(withPix.length/trips.length*100)}%)`);
      console.log(`📅 Com datas: ${withDates.length} (${Math.round(withDates.length/trips.length*100)}%)`);
      console.log(`🚌 Com embarques: ${withEmbarques.length} (${Math.round(withEmbarques.length/trips.length*100)}%)`);
      console.log(`✅ Com itens inclusos: ${withIncludes.length} (${Math.round(withIncludes.length/trips.length*100)}%)`);
      console.log(`📋 Com roteiro: ${withRoteiro.length} (${Math.round(withRoteiro.length/trips.length*100)}%)`);

      // Save detailed data
      const fs = await import('fs');
      fs.writeFileSync('viagens-detalhadas-setembro.json', JSON.stringify(trips, null, 2));
      console.log('\n💾 Dados detalhados salvos em: viagens-detalhadas-setembro.json');

    } else {
      console.log('⚠️ Nenhuma viagem encontrada para setembro');
    }

  } catch (error) {
    console.error('❌ Erro durante teste:', error);
  } finally {
    await scraper.close();
    console.log('\n🧹 Recursos liberados');
    console.log('✨ Teste concluído!');
  }
}

testDetailedScraping().catch(console.error);
