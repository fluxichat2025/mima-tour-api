#!/usr/bin/env node

import { MimaTourScraper } from './src/scraper.js';

async function testCorrectedExtraction() {
  console.log('🧪 TESTE DE EXTRAÇÃO CORRIGIDA\n');

  const scraper = new MimaTourScraper();

  try {
    await scraper.initialize();
    console.log('✅ Scraper inicializado\n');

    // Test with the specific problematic trip
    const tripUrl = 'https://mimatourviagens.suareservaonline.com.br/pacote/transporte-para-the-town-interlagos-sp-nao-inclui-ingresso-uid737/44022';
    console.log(`🔍 Testando extração corrigida para: The Town Interlagos\n`);

    const details = await scraper.getTripDetails(tripUrl);
    
    console.log('📋 RESULTADO DA EXTRAÇÃO CORRIGIDA:');
    console.log('=' .repeat(60));
    console.log(JSON.stringify(details, null, 2));
    console.log('=' .repeat(60));

    // Validate the extraction
    console.log('\n🔍 VALIDAÇÃO DOS DADOS:');
    console.log('-' .repeat(40));
    console.log(`📅 Datas de saída: ${details.data_saida.length > 0 ? '✅' : '❌'} (${details.data_saida.length})`);
    console.log(`📅 Data de volta: ${details.data_volta ? '✅' : '❌'} (${details.data_volta || 'null'})`);
    console.log(`🚌 Embarques: ${details.embarques.length > 0 ? '✅' : '❌'} (${details.embarques.length})`);
    console.log(`📋 Roteiro: ${details.roteiro && details.roteiro !== 'Roteiro não disponível' ? '✅' : '❌'}`);
    console.log(`✅ O que inclui: ${details.o_que_inclui.length > 0 ? '✅' : '❌'} (${details.o_que_inclui.length})`);
    console.log(`💰 PIX: ${details.investimento.pix ? '✅' : '❌'} (${details.investimento.pix})`);
    console.log(`💳 Cartão: ${details.investimento.cartao_credito ? '✅' : '❌'} (${details.investimento.cartao_credito})`);

    // Check if roteiro is still showing email
    if (details.roteiro.includes('@')) {
      console.log('⚠️ PROBLEMA: Roteiro ainda contém email!');
    } else {
      console.log('✅ Roteiro limpo (sem email)');
    }

    // Check embarques format
    if (details.embarques.length > 0) {
      console.log('\n🚌 EMBARQUES EXTRAÍDOS:');
      details.embarques.forEach((embarque, index) => {
        console.log(`${index + 1}. Ordem: ${embarque.ordem}, Local: "${embarque.local}", Hora: ${embarque.hora || 'N/A'}`);
      });
    }

    // Check o_que_inclui format
    if (details.o_que_inclui.length > 0) {
      console.log('\n✅ O QUE INCLUI:');
      details.o_que_inclui.forEach((item, index) => {
        console.log(`${index + 1}. "${item}"`);
      });
    }

    // Save the corrected result
    const fs = await import('fs');
    fs.writeFileSync('viagem-corrigida-exemplo.json', JSON.stringify(details, null, 2));
    console.log('\n💾 Resultado corrigido salvo em: viagem-corrigida-exemplo.json');

  } catch (error) {
    console.error('❌ Erro durante teste:', error);
  } finally {
    await scraper.close();
    console.log('\n🧹 Recursos liberados');
  }
}

testCorrectedExtraction().catch(console.error);
