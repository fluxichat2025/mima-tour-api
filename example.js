#!/usr/bin/env node

import { MimaTourScraper } from './src/scraper.js';
import { GrokIntegration } from './src/grok-integration.js';

async function demonstrateWebSearch() {
  console.log('🚀 Demonstração do WebSearch MCP - Mima Tour\n');

  const scraper = new MimaTourScraper();
  const grok = new GrokIntegration();

  try {
    // 1. Testar conexão com Grok
    console.log('1️⃣ Testando conexão com Grok AI...');
    const grokTest = await grok.testConnection();
    
    if (grokTest.success) {
      console.log('✅ Conexão com Grok AI estabelecida com sucesso!\n');
    } else {
      console.log('❌ Falha na conexão com Grok AI:', grokTest.error);
      console.log('⚠️ Continuando apenas com web scraping...\n');
    }

    // 2. Inicializar scraper
    console.log('2️⃣ Inicializando web scraper...');
    await scraper.initialize();
    console.log('✅ Web scraper inicializado com sucesso!\n');

    // 3. Buscar viagens
    console.log('3️⃣ Buscando viagens no site da Mima Tour...');
    const trips = await scraper.scrapeTrips();
    console.log(`✅ Encontradas ${trips.length} viagens!\n`);

    if (trips.length > 0) {
      console.log('📋 Exemplo de viagem encontrada:');
      console.log('─'.repeat(50));
      const firstTrip = trips[0];
      console.log(`Título: ${firstTrip.title || 'N/A'}`);
      console.log(`Destino: ${firstTrip.destination || 'N/A'}`);
      console.log(`Preço: ${firstTrip.price || 'N/A'}`);
      console.log(`Descrição: ${firstTrip.description ? firstTrip.description.substring(0, 100) + '...' : 'N/A'}`);
      console.log('─'.repeat(50));
      console.log();

      // 4. Enriquecer com Grok AI (se disponível)
      if (grokTest.success) {
        console.log('4️⃣ Enriquecendo informações com Grok AI...');
        try {
          const enrichedTrip = await grok.enrichTripInformation(firstTrip);
          console.log('✅ Informações enriquecidas com sucesso!');
          
          if (enrichedTrip.enrichedInfo && !enrichedTrip.enrichedInfo.error) {
            console.log('\n🎯 Informações adicionais do Grok AI:');
            console.log('─'.repeat(50));
            console.log(JSON.stringify(enrichedTrip.enrichedInfo, null, 2));
            console.log('─'.repeat(50));
          }
        } catch (error) {
          console.log('❌ Erro ao enriquecer com Grok AI:', error.message);
        }
      }

      // 5. Buscar informações de destino
      if (grokTest.success && firstTrip.destination) {
        console.log('\n5️⃣ Buscando informações detalhadas do destino...');
        try {
          const destinationInfo = await grok.searchDestinationInfo(firstTrip.destination);
          console.log('✅ Informações do destino obtidas com sucesso!');
          console.log('\n🌍 Informações do destino:');
          console.log('─'.repeat(50));
          console.log(JSON.stringify(destinationInfo, null, 2));
          console.log('─'.repeat(50));
        } catch (error) {
          console.log('❌ Erro ao buscar informações do destino:', error.message);
        }
      }
    } else {
      console.log('⚠️ Nenhuma viagem foi encontrada. Isso pode indicar:');
      console.log('   - O site pode ter mudado sua estrutura');
      console.log('   - Problemas de conectividade');
      console.log('   - Necessidade de ajustar os seletores CSS');
    }

    // 6. Demonstrar recomendações personalizadas
    if (grokTest.success) {
      console.log('\n6️⃣ Gerando recomendações personalizadas...');
      try {
        const preferences = {
          budget: 'R$ 2000-5000',
          type: 'Aventura e cultura',
          duration: '7-10 dias',
          interests: 'História, gastronomia, natureza',
          season: 'Inverno'
        };

        const recommendations = await grok.generateTripRecommendations(preferences);
        console.log('✅ Recomendações geradas com sucesso!');
        console.log('\n💡 Recomendações personalizadas:');
        console.log('─'.repeat(50));
        console.log(JSON.stringify(recommendations, null, 2));
        console.log('─'.repeat(50));
      } catch (error) {
        console.log('❌ Erro ao gerar recomendações:', error.message);
      }
    }

  } catch (error) {
    console.error('❌ Erro durante a demonstração:', error);
  } finally {
    // Cleanup
    await scraper.close();
    console.log('\n🧹 Limpeza concluída');
    console.log('✨ Demonstração finalizada!');
  }
}

// Executar demonstração
demonstrateWebSearch().catch(console.error);
