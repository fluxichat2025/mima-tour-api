#!/usr/bin/env node

import { MimaTourScraper } from './src/scraper.js';

async function testeInvestimentoRestrito() {
  console.log('🎯 Testando extração RESTRITA do campo investimento...\n');
  console.log('📋 Verificando se apenas valores da seção INVESTIMENTO são extraídos\n');

  const scraper = new MimaTourScraper();

  try {
    await scraper.initialize();
    
    // Buscar viagens de outubro para testar
    console.log('📋 Buscando viagens de outubro...');
    const trips = await scraper.scrapeTrips('outubro', {}, false);
    console.log(`✅ Encontradas ${trips.length} viagens\n`);

    if (trips.length > 0) {
      // Testar algumas viagens específicas
      const testTrips = trips.slice(0, 5); // Testar primeiras 5 viagens
      
      for (let i = 0; i < testTrips.length; i++) {
        const trip = testTrips[i];
        console.log(`🔍 TESTE ${i + 1}/${testTrips.length}: ${trip.titulo}`);
        console.log(`🔗 URL: ${trip.url_reserva}`);
        
        try {
          const details = await scraper.getTripDetails(trip.url_reserva);
          
          console.log('💰 INVESTIMENTO EXTRAÍDO:');
          console.log(`   💵 Valor por pessoa: ${details.investimento.valor_por_pessoa || 'NÃO ENCONTRADO'}`);
          console.log(`   📋 Condições: ${details.investimento.condicoes_pagamento.length} itens`);
          
          if (details.investimento.condicoes_pagamento.length > 0) {
            details.investimento.condicoes_pagamento.forEach((condicao, index) => {
              console.log(`      ${index + 1}. ${condicao}`);
            });
          }
          
          // Verificar se há valor extraído
          if (details.investimento.valor_por_pessoa) {
            console.log('   ✅ VALOR ENCONTRADO na seção INVESTIMENTO');
          } else {
            console.log('   ❌ VALOR NÃO ENCONTRADO - pode não ter seção INVESTIMENTO estruturada');
          }
          
          console.log('   ' + '-'.repeat(60));
          
          // Pequena pausa entre requisições
          await new Promise(resolve => setTimeout(resolve, 1000));
          
        } catch (error) {
          console.log(`   ❌ Erro: ${error.message}`);
        }
        
        console.log(''); // Linha em branco
      }
      
      // Estatísticas finais
      console.log('\n📊 ESTATÍSTICAS DO TESTE:');
      console.log('=' .repeat(50));
      
      let totalComValor = 0;
      let totalComCondicoes = 0;
      
      for (const trip of testTrips) {
        try {
          const details = await scraper.getTripDetails(trip.url_reserva);
          if (details.investimento.valor_por_pessoa) totalComValor++;
          if (details.investimento.condicoes_pagamento.length > 0) totalComCondicoes++;
          await new Promise(resolve => setTimeout(resolve, 500));
        } catch (error) {
          // Ignorar erros para estatísticas
        }
      }
      
      console.log(`📈 Viagens com valor extraído: ${totalComValor}/${testTrips.length} (${Math.round(totalComValor/testTrips.length*100)}%)`);
      console.log(`📋 Viagens com condições extraídas: ${totalComCondicoes}/${testTrips.length} (${Math.round(totalComCondicoes/testTrips.length*100)}%)`);
      
      if (totalComValor > 0) {
        console.log('\n✅ TESTE APROVADO: Sistema está extraindo valores da seção INVESTIMENTO');
      } else {
        console.log('\n⚠️  ATENÇÃO: Nenhum valor foi extraído - verificar se as páginas têm seção INVESTIMENTO');
      }
    }

    console.log('\n✅ Teste concluído!');

  } catch (error) {
    console.error('❌ Erro durante teste:', error);
  } finally {
    await scraper.close();
    console.log('\n🧹 Recursos liberados');
  }
}

testeInvestimentoRestrito().catch(console.error);
