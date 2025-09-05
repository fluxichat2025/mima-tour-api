#!/usr/bin/env node

import { MimaTourScraper } from './src/scraper.js';

async function testTableExtraction() {
  console.log('🧪 TESTE DE EXTRAÇÃO DE TABELA COM ÍCONES\n');

  const scraper = new MimaTourScraper();

  try {
    await scraper.initialize();
    console.log('✅ Scraper inicializado\n');

    // Get all trips to find one that might have the table format
    console.log('🔍 Buscando viagens de setembro...');
    const trips = await scraper.scrapeTrips('setembro', {}, false);
    
    console.log(`📊 Encontradas ${trips.length} viagens\n`);

    // Test multiple trips to find one with good "o_que_inclui" data
    for (let i = 0; i < Math.min(3, trips.length); i++) {
      const trip = trips[i];
      console.log(`\n${i + 1}️⃣ Testando: ${trip.titulo}`);
      console.log(`   UID: ${trip.uid}`);
      console.log(`   Status: ${trip.status}`);
      
      try {
        const details = await scraper.getTripDetails(trip.url_reserva);
        
        console.log(`   📋 O que inclui: ${details.o_que_inclui?.length || 0} itens`);
        
        if (details.o_que_inclui && details.o_que_inclui.length > 0) {
          console.log('   ✅ Itens encontrados:');
          details.o_que_inclui.forEach((item, index) => {
            console.log(`      ${index + 1}. "${item}"`);
          });
          
          // Check if we found table-style items
          const hasTableItems = details.o_que_inclui.some(item => 
            item.includes('Ar condicionado') || 
            item.includes('Taxa de preservação') ||
            item.includes('Seguro transporte')
          );
          
          if (hasTableItems) {
            console.log('   🎯 ENCONTROU ITENS DA TABELA!');
            
            // Save this good example
            const fs = await import('fs');
            const goodExample = {
              uid: trip.uid,
              titulo: trip.titulo,
              status: trip.status,
              url: trip.url_reserva,
              datas: details.datas,
              embarques: details.embarques,
              o_que_inclui: details.o_que_inclui,
              investimento: details.investimento,
              timestamp: new Date().toISOString()
            };
            fs.writeFileSync('good-extraction-example.json', JSON.stringify(goodExample, null, 2));
            console.log('   💾 Exemplo salvo em: good-extraction-example.json');
            break;
          }
        } else {
          console.log('   ❌ Nenhum item encontrado');
        }
        
        // Small delay between requests
        await new Promise(resolve => setTimeout(resolve, 1000));
        
      } catch (error) {
        console.log(`   ❌ Erro: ${error.message}`);
      }
    }

    // Test the format with all updates
    console.log('\n🎯 FORMATO FINAL COM TODAS AS ATUALIZAÇÕES:');
    console.log('=' .repeat(60));
    
    const exampleTrip = trips[0];
    const exampleDetails = await scraper.getTripDetails(exampleTrip.url_reserva);
    
    const finalFormat = {
      uid: exampleTrip.uid,
      titulo: exampleTrip.titulo,
      status: exampleTrip.status,
      datas: exampleDetails.datas,
      embarques: exampleDetails.embarques,
      roteiro: exampleDetails.roteiro,
      o_que_inclui: exampleDetails.o_que_inclui,
      investimento: exampleDetails.investimento,
      informacoes_importantes: exampleDetails.informacoes_importantes,
      url_img: exampleTrip.url_img,
      url_reserva: exampleTrip.url_reserva
    };
    
    console.log(JSON.stringify(finalFormat, null, 2));
    console.log('=' .repeat(60));

    // Validation summary
    console.log('\n📊 VALIDAÇÃO FINAL:');
    console.log('-' .repeat(40));
    console.log(`✅ UID: ${finalFormat.uid ? 'OK' : 'FALTANDO'}`);
    console.log(`✅ Status: ${finalFormat.status ? 'OK' : 'FALTANDO'}`);
    console.log(`✅ Múltiplas datas: ${finalFormat.datas?.length > 1 ? 'OK' : 'ÚNICA DATA'}`);
    console.log(`✅ Embarques: ${finalFormat.embarques?.length > 0 ? 'OK' : 'FALTANDO'}`);
    console.log(`✅ O que inclui: ${finalFormat.o_que_inclui?.length > 0 ? 'OK' : 'FALTANDO'}`);
    console.log(`✅ Investimento: ${finalFormat.investimento?.pix ? 'OK' : 'FALTANDO'}`);

    console.log('\n🎉 TESTE DE ATUALIZAÇÕES CONCLUÍDO!');

  } catch (error) {
    console.error('❌ Erro durante teste:', error);
  } finally {
    await scraper.close();
    console.log('\n🧹 Recursos liberados');
  }
}

testTableExtraction().catch(console.error);
