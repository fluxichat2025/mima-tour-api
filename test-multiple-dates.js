#!/usr/bin/env node

import { MimaTourScraper } from './src/scraper.js';

async function testMultipleDates() {
  console.log('🧪 TESTE DE MÚLTIPLAS DATAS\n');

  const scraper = new MimaTourScraper();

  try {
    await scraper.initialize();
    console.log('✅ Scraper inicializado\n');

    // Test with Ilhabela trip that has multiple dates
    const tripUrl = 'https://mimatourviagens.suareservaonline.com.br/pacote/ilhabela-datas-setembro-2025-uid749/44022';
    console.log(`🔍 Testando extração de múltiplas datas: Ilhabela\n`);

    const details = await scraper.getTripDetails(tripUrl);
    
    console.log('📋 RESULTADO DA EXTRAÇÃO DE DATAS:');
    console.log('=' .repeat(60));
    console.log(JSON.stringify(details, null, 2));
    console.log('=' .repeat(60));

    // Validate the new dates format
    console.log('\n🔍 VALIDAÇÃO DO NOVO FORMATO:');
    console.log('-' .repeat(40));
    
    if (details.datas && Array.isArray(details.datas)) {
      console.log(`✅ Campo 'datas' é um array: ${details.datas.length} opções`);
      
      details.datas.forEach((data, index) => {
        console.log(`\n📅 Opção ${index + 1}:`);
        console.log(`   Embarque: ${data.embarque || 'N/A'}`);
        console.log(`   Retorno: ${data.retorno || 'N/A'}`);
        
        // Validate format
        const embarqueFormat = data.embarque && data.embarque.match(/\d{2}\/\d{2}\/\d{4}, \d{2}:\d{2}h?/);
        const retornoFormat = data.retorno && data.retorno.match(/\d{2}\/\d{2}\/\d{4}, \d{2}:\d{2}h?/);
        
        console.log(`   Formato embarque: ${embarqueFormat ? '✅' : '❌'}`);
        console.log(`   Formato retorno: ${retornoFormat ? '✅' : '❌'}`);
      });
      
      if (details.datas.length > 1) {
        console.log('\n🎯 MÚLTIPLAS DATAS DETECTADAS!');
        console.log('✅ Sistema funcionando conforme esperado');
      } else if (details.datas.length === 1) {
        console.log('\n📅 UMA DATA DETECTADA');
        console.log('✅ Formato correto para viagem com data única');
      } else {
        console.log('\n⚠️ NENHUMA DATA DETECTADA');
        console.log('❌ Pode haver problema na extração');
      }
      
    } else {
      console.log('❌ Campo "datas" não é um array ou não existe');
    }

    // Create example of expected format
    const expectedFormat = {
      titulo: "Ilhabela Datas Setembro 2025",
      datas: [
        {
          embarque: "06/09/2025, 23:30h",
          retorno: "07/09/2025, 18:00h"
        },
        {
          embarque: "20/09/2025, 23:30h", 
          retorno: "21/09/2025, 18:00h"
        }
      ],
      embarques: details.embarques,
      roteiro: details.roteiro,
      o_que_inclui: details.o_que_inclui,
      investimento: details.investimento,
      informacoes_importantes: details.informacoes_importantes,
      url_img: "https://img.suareservaonline.com.br/mimatourviagens/...",
      url_reserva: tripUrl
    };

    console.log('\n🎯 FORMATO ESPERADO:');
    console.log('=' .repeat(60));
    console.log(JSON.stringify(expectedFormat, null, 2));
    console.log('=' .repeat(60));

    // Save the result
    const fs = await import('fs');
    fs.writeFileSync('viagem-multiplas-datas.json', JSON.stringify(details, null, 2));
    console.log('\n💾 Resultado salvo em: viagem-multiplas-datas.json');

  } catch (error) {
    console.error('❌ Erro durante teste:', error);
  } finally {
    await scraper.close();
    console.log('\n🧹 Recursos liberados');
  }
}

testMultipleDates().catch(console.error);
