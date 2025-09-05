#!/usr/bin/env node

import { MimaTourScraper } from './src/scraper.js';

async function testUpdates() {
  console.log('🧪 TESTE DAS ATUALIZAÇÕES\n');

  const scraper = new MimaTourScraper();

  try {
    await scraper.initialize();
    console.log('✅ Scraper inicializado\n');

    // Test basic scraping to check UID and status updates
    console.log('1️⃣ Testando UID e Status...');
    const basicTrips = await scraper.scrapeTrips('setembro', {}, false);
    
    if (basicTrips.length > 0) {
      const firstTrip = basicTrips[0];
      console.log('📋 PRIMEIRA VIAGEM (BÁSICA):');
      console.log(`   UID: ${firstTrip.uid || 'N/A'}`);
      console.log(`   Título: ${firstTrip.titulo}`);
      console.log(`   Status: ${firstTrip.status}`);
      console.log(`   URL: ${firstTrip.url_reserva}\n`);

      // Validate UID extraction
      if (firstTrip.uid) {
        console.log('✅ UID extraído com sucesso');
      } else {
        console.log('❌ UID não foi extraído');
      }

      // Validate status
      if (firstTrip.status && firstTrip.status !== '') {
        console.log(`✅ Status: ${firstTrip.status}`);
      } else {
        console.log('❌ Status não definido');
      }
    }

    // Test detailed scraping to check improved "o_que_inclui"
    console.log('\n2️⃣ Testando extração melhorada do "O que inclui"...');
    
    // Test with a specific trip that might have the table format
    const testUrl = basicTrips[0]?.url_reserva;
    if (testUrl) {
      console.log(`🔍 Testando: ${basicTrips[0].titulo}`);
      
      const details = await scraper.getTripDetails(testUrl);
      
      console.log('\n📋 RESULTADO DETALHADO:');
      console.log('=' .repeat(60));
      console.log(JSON.stringify({
        uid: details.uid || basicTrips[0].uid,
        titulo: basicTrips[0].titulo,
        status: basicTrips[0].status,
        datas: details.datas,
        embarques: details.embarques,
        o_que_inclui: details.o_que_inclui,
        investimento: details.investimento
      }, null, 2));
      console.log('=' .repeat(60));

      // Validate improvements
      console.log('\n🔍 VALIDAÇÃO DAS MELHORIAS:');
      console.log('-' .repeat(40));
      
      // Check UID
      const hasUID = details.uid || basicTrips[0].uid;
      console.log(`UID: ${hasUID ? '✅' : '❌'} (${hasUID || 'N/A'})`);
      
      // Check status
      const hasStatus = basicTrips[0].status && basicTrips[0].status !== '';
      console.log(`Status: ${hasStatus ? '✅' : '❌'} (${basicTrips[0].status || 'N/A'})`);
      
      // Check o_que_inclui
      const hasIncludes = details.o_que_inclui && details.o_que_inclui.length > 0;
      console.log(`O que inclui: ${hasIncludes ? '✅' : '❌'} (${details.o_que_inclui?.length || 0} itens)`);
      
      if (hasIncludes) {
        console.log('\n📋 ITENS INCLUSOS:');
        details.o_que_inclui.forEach((item, index) => {
          console.log(`   ${index + 1}. "${item}"`);
        });
      }

      // Check for specific items that should be found in tables
      const expectedItems = [
        'Ar condicionado',
        'Kit lanchinho',
        'Seguro transporte',
        'Taxa de preservação ambiental'
      ];
      
      console.log('\n🎯 VERIFICAÇÃO DE ITENS ESPECÍFICOS:');
      expectedItems.forEach(item => {
        const found = details.o_que_inclui?.some(included => 
          included.toLowerCase().includes(item.toLowerCase())
        );
        console.log(`   ${found ? '✅' : '❌'} ${item}`);
      });

      // Summary
      console.log('\n📊 RESUMO DAS ATUALIZAÇÕES:');
      console.log('=' .repeat(50));
      console.log(`✅ UID separado: ${hasUID ? 'IMPLEMENTADO' : 'PENDENTE'}`);
      console.log(`✅ Status DISPONÍVEL: ${hasStatus ? 'IMPLEMENTADO' : 'PENDENTE'}`);
      console.log(`✅ O que inclui melhorado: ${hasIncludes ? 'IMPLEMENTADO' : 'PENDENTE'}`);
      
      if (hasUID && hasStatus && hasIncludes) {
        console.log('\n🎉 TODAS AS ATUALIZAÇÕES IMPLEMENTADAS COM SUCESSO!');
      } else {
        console.log('\n⚠️ Algumas atualizações precisam de ajustes');
      }

      // Save test result
      const fs = await import('fs');
      const testResult = {
        uid: hasUID,
        status: basicTrips[0].status,
        o_que_inclui: details.o_que_inclui,
        timestamp: new Date().toISOString()
      };
      fs.writeFileSync('test-updates-result.json', JSON.stringify(testResult, null, 2));
      console.log('\n💾 Resultado salvo em: test-updates-result.json');
    }

  } catch (error) {
    console.error('❌ Erro durante teste:', error);
  } finally {
    await scraper.close();
    console.log('\n🧹 Recursos liberados');
  }
}

testUpdates().catch(console.error);
