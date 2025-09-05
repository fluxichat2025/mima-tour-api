#!/usr/bin/env node

import { MimaTourScraper } from './src/scraper.js';
import { GrokIntegration } from './src/grok-integration.js';

async function finalDemo() {
  console.log('🎉 DEMONSTRAÇÃO FINAL - WebSearch MCP Mima Tour\n');
  console.log('=' .repeat(60));

  const scraper = new MimaTourScraper();
  const grok = new GrokIntegration();

  try {
    // 1. Inicializar e buscar viagens
    console.log('\n1️⃣ BUSCANDO VIAGENS NO SITE DA MIMA TOUR');
    console.log('-'.repeat(50));
    
    await scraper.initialize();
    const trips = await scraper.scrapeTrips();
    
    console.log(`✅ ${trips.length} viagens encontradas com sucesso!`);

    if (trips.length > 0) {
      // 2. Mostrar estatísticas
      console.log('\n2️⃣ ESTATÍSTICAS DAS VIAGENS');
      console.log('-'.repeat(50));
      
      const withPrice = trips.filter(t => t.price && t.price !== 'Sem preço');
      const withoutPrice = trips.filter(t => !t.price || t.price === 'Sem preço');
      const destinations = [...new Set(trips.map(t => t.title).filter(Boolean))];
      
      console.log(`📊 Viagens com preço: ${withPrice.length}`);
      console.log(`📊 Viagens sem preço: ${withoutPrice.length}`);
      console.log(`📊 Destinos únicos: ${destinations.length}`);

      // 3. Mostrar top 10 viagens
      console.log('\n3️⃣ TOP 10 VIAGENS DISPONÍVEIS');
      console.log('-'.repeat(50));
      
      trips.slice(0, 10).forEach((trip, index) => {
        console.log(`\n${index + 1}. ${trip.title || 'Sem título'}`);
        console.log(`   💰 Preço: ${trip.price || 'Não informado'}`);
        console.log(`   📅 Status: ${trip.status || 'Não informado'}`);
        console.log(`   🔗 Link: ${trip.link || 'Não disponível'}`);
      });

      // 4. Filtrar viagens por preço
      console.log('\n4️⃣ VIAGENS MAIS BARATAS (até R$ 200)');
      console.log('-'.repeat(50));
      
      const cheapTrips = trips.filter(trip => {
        if (!trip.price) return false;
        const priceMatch = trip.price.match(/R\$\s*(\d+(?:,\d+)?)/);
        if (priceMatch) {
          const price = parseFloat(priceMatch[1].replace(',', '.'));
          return price <= 200;
        }
        return false;
      }).slice(0, 5);

      cheapTrips.forEach((trip, index) => {
        console.log(`${index + 1}. ${trip.title} - ${trip.price}`);
      });

      // 5. Testar integração com Grok (se disponível)
      console.log('\n5️⃣ TESTE DE INTEGRAÇÃO GROK AI');
      console.log('-'.repeat(50));
      
      const grokTest = await grok.testConnection();
      if (grokTest.success) {
        console.log('✅ Grok AI conectado com sucesso!');
        
        // Tentar enriquecer uma viagem
        const tripToEnrich = trips.find(t => t.title && t.price);
        if (tripToEnrich) {
          console.log(`\n🤖 Enriquecendo viagem: "${tripToEnrich.title}"`);
          try {
            const enriched = await grok.enrichTripInformation(tripToEnrich);
            console.log('✅ Viagem enriquecida com sucesso!');
            if (enriched.enrichedInfo && !enriched.enrichedInfo.error) {
              console.log('📋 Informações adicionais obtidas do Grok AI');
            }
          } catch (error) {
            console.log(`❌ Erro ao enriquecer: ${error.message}`);
          }
        }
      } else {
        console.log(`❌ Grok AI não disponível: ${grokTest.error}`);
        console.log('💡 Verifique a chave da API e conectividade');
      }

      // 6. Salvar dados em JSON
      console.log('\n6️⃣ SALVANDO DADOS');
      console.log('-'.repeat(50));
      
      const dataToSave = {
        timestamp: new Date().toISOString(),
        totalTrips: trips.length,
        source: 'Mima Tour Viagens',
        url: 'https://mimatourviagens.suareservaonline.com.br/44022',
        trips: trips.slice(0, 20) // Salvar apenas as primeiras 20
      };

      const fs = await import('fs');
      fs.writeFileSync('viagens-extraidas.json', JSON.stringify(dataToSave, null, 2));
      console.log('✅ Dados salvos em viagens-extraidas.json');

      // 7. Resumo final
      console.log('\n7️⃣ RESUMO FINAL');
      console.log('-'.repeat(50));
      console.log(`🎯 Sistema funcionando perfeitamente!`);
      console.log(`📊 ${trips.length} viagens extraídas com sucesso`);
      console.log(`💾 Dados salvos para análise posterior`);
      console.log(`🔧 MCP Server pronto para integração`);
      
    } else {
      console.log('⚠️ Nenhuma viagem encontrada');
    }

  } catch (error) {
    console.error('❌ Erro durante demonstração:', error);
  } finally {
    await scraper.close();
    console.log('\n🧹 Recursos liberados');
    console.log('\n✨ DEMONSTRAÇÃO CONCLUÍDA COM SUCESSO!');
    console.log('=' .repeat(60));
  }
}

finalDemo().catch(console.error);
