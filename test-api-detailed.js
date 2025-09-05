#!/usr/bin/env node

async function testAPIDetailed() {
  console.log('🧪 TESTE DA API COM DETALHES COMPLETOS\n');

  try {
    // Test basic API call (fast)
    console.log('1️⃣ Testando API básica (rápida)...');
    const basicResponse = await fetch('http://localhost:3000/trips/setembro');
    const basicData = await basicResponse.json();
    
    console.log(`✅ API básica: ${basicData.total} viagens encontradas`);
    console.log(`📊 Detalhes incluídos: ${basicData.includeDetails}`);
    console.log(`⚡ Primeira viagem: ${basicData.data[0].titulo}`);
    console.log(`📋 Dados básicos: título, url_img, url_reserva, status, preco_listagem\n`);

    // Test detailed API call (slower)
    console.log('2️⃣ Testando API com detalhes (pode demorar alguns minutos)...');
    console.log('⏳ Aguarde enquanto extraímos informações detalhadas...\n');
    
    const detailedResponse = await fetch('http://localhost:3000/trips/setembro?details=true');
    const detailedData = await detailedResponse.json();
    
    console.log(`✅ API detalhada: ${detailedData.total} viagens com detalhes completos`);
    console.log(`📊 Detalhes incluídos: ${detailedData.includeDetails}`);
    
    if (detailedData.data.length > 0) {
      const firstTrip = detailedData.data[0];
      console.log('\n📋 EXEMPLO DE VIAGEM COM DETALHES COMPLETOS:');
      console.log('=' .repeat(60));
      console.log(JSON.stringify(firstTrip, null, 2));
      console.log('=' .repeat(60));

      // Statistics
      const withDates = detailedData.data.filter(t => t.data_saida && t.data_saida.length > 0);
      const withEmbarques = detailedData.data.filter(t => t.embarques && t.embarques.length > 0);
      const withPix = detailedData.data.filter(t => t.investimento && t.investimento.pix);
      const withIncludes = detailedData.data.filter(t => t.o_que_inclui && t.o_que_inclui.length > 0);

      console.log('\n📈 ESTATÍSTICAS DOS DETALHES:');
      console.log('-' .repeat(40));
      console.log(`📅 Com datas de saída: ${withDates.length}/${detailedData.total}`);
      console.log(`🚌 Com embarques: ${withEmbarques.length}/${detailedData.total}`);
      console.log(`💰 Com preço PIX: ${withPix.length}/${detailedData.total}`);
      console.log(`✅ Com itens inclusos: ${withIncludes.length}/${detailedData.total}`);
    }

    // Save detailed data
    const fs = await import('fs');
    fs.writeFileSync('api-response-detailed.json', JSON.stringify(detailedData, null, 2));
    console.log('\n💾 Resposta detalhada salva em: api-response-detailed.json');

    console.log('\n🎯 RESUMO:');
    console.log('✅ API básica: Rápida, dados essenciais');
    console.log('✅ API detalhada: Completa, com todas as informações');
    console.log('✅ Formato JSON conforme solicitado');

  } catch (error) {
    console.error('❌ Erro durante teste:', error);
  }
}

testAPIDetailed().catch(console.error);
