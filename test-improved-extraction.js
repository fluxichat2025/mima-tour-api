#!/usr/bin/env node

import { MimaTourScraper } from './src/scraper.js';

async function testImprovedExtraction() {
  console.log('🧪 TESTE DE EXTRAÇÃO MELHORADA\n');

  const scraper = new MimaTourScraper();

  try {
    await scraper.initialize();
    console.log('✅ Scraper inicializado\n');

    // Test with specific Ilhabela trip
    const tripUrl = 'https://mimatourviagens.suareservaonline.com.br/pacote/ilhabela-datas-setembro-2025-uid749/44022';
    console.log(`🔍 Testando extração detalhada para: ${tripUrl}\n`);

    const details = await scraper.getTripDetails(tripUrl);
    
    console.log('📋 RESULTADO DA EXTRAÇÃO:');
    console.log('=' .repeat(60));
    console.log(JSON.stringify(details, null, 2));
    console.log('=' .repeat(60));

    // Create the final formatted object
    const formattedTrip = {
      titulo: "Ilhabela Datas Setembro 2025",
      data_saida: details.data_saida,
      data_volta: details.data_volta,
      embarques: details.embarques,
      roteiro: details.roteiro,
      o_que_inclui: details.o_que_inclui,
      investimento: details.investimento,
      informacoes_importantes: details.informacoes_importantes,
      url_img: "https://img.suareservaonline.com.br/mimatourviagens/shop/products/featured/f1ff40bee7c4707b6d9ad5f184f86390.jpeg",
      url_reserva: tripUrl
    };

    console.log('\n🎯 FORMATO FINAL DESEJADO:');
    console.log('=' .repeat(60));
    console.log(JSON.stringify(formattedTrip, null, 2));
    console.log('=' .repeat(60));

    // Save the result
    const fs = await import('fs');
    fs.writeFileSync('viagem-formatada-exemplo.json', JSON.stringify(formattedTrip, null, 2));
    console.log('\n💾 Exemplo salvo em: viagem-formatada-exemplo.json');

    // Test statistics
    console.log('\n📊 ESTATÍSTICAS DA EXTRAÇÃO:');
    console.log('-' .repeat(40));
    console.log(`📅 Datas encontradas: ${details.data_saida.length}`);
    console.log(`🚌 Embarques encontrados: ${details.embarques.length}`);
    console.log(`✅ Itens inclusos: ${details.o_que_inclui.length}`);
    console.log(`💰 PIX: ${details.investimento.pix ? 'Sim' : 'Não'}`);
    console.log(`💳 Cartão: ${details.investimento.cartao_credito ? 'Sim' : 'Não'}`);
    console.log(`📋 Roteiro: ${details.roteiro.length > 20 ? 'Sim' : 'Não'}`);

  } catch (error) {
    console.error('❌ Erro durante teste:', error);
  } finally {
    await scraper.close();
    console.log('\n🧹 Recursos liberados');
  }
}

testImprovedExtraction().catch(console.error);
