#!/usr/bin/env node

import { MimaTourScraper } from './src/scraper.js';

async function testInvestimentoUpdate() {
  console.log('🧪 Testando atualização do campo investimento...\n');

  const scraper = new MimaTourScraper();

  try {
    await scraper.initialize();
    
    // Buscar viagens básicas primeiro
    console.log('📋 Buscando viagens básicas...');
    const trips = await scraper.scrapeTrips('setembro', {}, false);
    console.log(`✅ Encontradas ${trips.length} viagens\n`);

    if (trips.length > 0) {
      // Testar extração detalhada de uma viagem
      const firstTrip = trips[0];
      console.log(`🔍 Testando extração detalhada para: ${firstTrip.titulo}`);
      console.log(`🔗 URL: ${firstTrip.url_reserva}\n`);

      const details = await scraper.getTripDetails(firstTrip.url_reserva);
      
      console.log('💰 INFORMAÇÕES DE INVESTIMENTO EXTRAÍDAS:');
      console.log('=' .repeat(60));
      console.log(JSON.stringify(details.investimento, null, 2));
      console.log('=' .repeat(60));

      // Verificar se os campos estão preenchidos
      console.log('\n📊 ANÁLISE DOS CAMPOS:');
      console.log('-' .repeat(40));
      console.log(`💵 Valor por pessoa: ${details.investimento.valor_por_pessoa ? '✅ Preenchido' : '❌ Vazio'}`);
      console.log(`📋 Condições de pagamento: ${details.investimento.condicoes_pagamento.length} itens`);
      console.log(`💳 PIX (compatibilidade): ${details.investimento.pix ? '✅ Preenchido' : '❌ Vazio'}`);
      console.log(`💳 Cartão (compatibilidade): ${details.investimento.cartao_credito ? '✅ Preenchido' : '❌ Vazio'}`);

      if (details.investimento.condicoes_pagamento.length > 0) {
        console.log('\n📝 CONDIÇÕES DE PAGAMENTO ENCONTRADAS:');
        details.investimento.condicoes_pagamento.forEach((condicao, index) => {
          console.log(`${index + 1}. ${condicao}`);
        });
      }

      // Testar com mais algumas viagens para verificar consistência
      console.log('\n🔄 Testando mais viagens para verificar consistência...');
      const testCount = Math.min(3, trips.length);
      
      for (let i = 1; i < testCount; i++) {
        const trip = trips[i];
        console.log(`\n📋 Viagem ${i + 1}: ${trip.titulo}`);
        
        try {
          const tripDetails = await scraper.getTripDetails(trip.url_reserva);
          console.log(`   💵 Valor: ${tripDetails.investimento.valor_por_pessoa || 'N/A'}`);
          console.log(`   📋 Condições: ${tripDetails.investimento.condicoes_pagamento.length} itens`);
          
          // Pequena pausa entre requisições
          await new Promise(resolve => setTimeout(resolve, 500));
        } catch (error) {
          console.log(`   ❌ Erro: ${error.message}`);
        }
      }
    }

    console.log('\n✅ Teste concluído com sucesso!');

  } catch (error) {
    console.error('❌ Erro durante teste:', error);
  } finally {
    await scraper.close();
    console.log('\n🧹 Recursos liberados');
  }
}

testInvestimentoUpdate().catch(console.error);
