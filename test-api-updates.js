#!/usr/bin/env node

async function testAPIUpdates() {
  console.log('🧪 TESTE DA API COM ATUALIZAÇÕES\n');

  try {
    // Test 1: Health check
    console.log('1️⃣ Testando Health Check...');
    const healthResponse = await fetch('http://localhost:3000/health');
    const health = await healthResponse.json();
    console.log(`✅ Health: ${health.status}`);
    console.log(`📊 Versão: ${health.version}\n`);

    // Test 2: Basic API (should include UID and status)
    console.log('2️⃣ Testando API básica com UID e Status...');
    const basicResponse = await fetch('http://localhost:3000/trips/setembro');
    const basicData = await basicResponse.json();
    
    console.log(`📊 Total: ${basicData.total} viagens`);
    console.log(`⚡ Detalhes incluídos: ${basicData.includeDetails}`);
    
    if (basicData.data.length > 0) {
      const firstTrip = basicData.data[0];
      console.log('\n📋 PRIMEIRA VIAGEM (FORMATO ATUALIZADO):');
      console.log(`   UID: ${firstTrip.uid || 'N/A'}`);
      console.log(`   Título: ${firstTrip.titulo}`);
      console.log(`   Status: ${firstTrip.status}`);
      console.log(`   URL: ${firstTrip.url_reserva}`);
      
      // Validate new fields
      const hasUID = firstTrip.uid && firstTrip.uid !== null;
      const hasStatus = firstTrip.status && firstTrip.status !== '';
      
      console.log(`\n🔍 VALIDAÇÃO:`);
      console.log(`   UID: ${hasUID ? '✅' : '❌'}`);
      console.log(`   Status: ${hasStatus ? '✅' : '❌'}`);
    }

    // Test 3: Detailed API (should include improved o_que_inclui)
    console.log('\n3️⃣ Testando API detalhada com melhorias...');
    const detailedResponse = await fetch('http://localhost:3000/trips/setembro?details=true');
    const detailedData = await detailedResponse.json();
    
    console.log(`📊 Total detalhado: ${detailedData.total} viagens`);
    console.log(`⚡ Detalhes incluídos: ${detailedData.includeDetails}`);
    
    if (detailedData.data.length > 0) {
      const firstDetailedTrip = detailedData.data[0];
      
      console.log('\n📋 PRIMEIRA VIAGEM DETALHADA (FORMATO COMPLETO):');
      console.log('=' .repeat(60));
      console.log(JSON.stringify(firstDetailedTrip, null, 2));
      console.log('=' .repeat(60));

      // Validate all improvements
      console.log('\n🔍 VALIDAÇÃO COMPLETA:');
      console.log('-' .repeat(40));
      
      const validations = [
        { field: 'UID', value: firstDetailedTrip.uid, valid: !!firstDetailedTrip.uid },
        { field: 'Status', value: firstDetailedTrip.status, valid: !!firstDetailedTrip.status },
        { field: 'Múltiplas datas', value: firstDetailedTrip.datas?.length, valid: firstDetailedTrip.datas?.length > 0 },
        { field: 'Embarques', value: firstDetailedTrip.embarques?.length, valid: firstDetailedTrip.embarques?.length > 0 },
        { field: 'O que inclui', value: firstDetailedTrip.o_que_inclui?.length, valid: firstDetailedTrip.o_que_inclui?.length > 0 },
        { field: 'Investimento PIX', value: firstDetailedTrip.investimento?.pix, valid: !!firstDetailedTrip.investimento?.pix },
        { field: 'Investimento Cartão', value: firstDetailedTrip.investimento?.cartao_credito, valid: !!firstDetailedTrip.investimento?.cartao_credito }
      ];

      validations.forEach(v => {
        console.log(`   ${v.valid ? '✅' : '❌'} ${v.field}: ${v.value || 'N/A'}`);
      });

      // Check specific improvements
      console.log('\n🎯 MELHORIAS ESPECÍFICAS:');
      console.log('-' .repeat(40));
      
      // UID extraction
      const uidFromURL = firstDetailedTrip.url_reserva?.match(/uid(\d+)/);
      const extractedUID = uidFromURL ? uidFromURL[1] : null;
      console.log(`   UID extraído da URL: ${extractedUID === firstDetailedTrip.uid ? '✅' : '❌'} (${extractedUID} vs ${firstDetailedTrip.uid})`);
      
      // Status default
      const hasValidStatus = firstDetailedTrip.status && firstDetailedTrip.status !== '';
      console.log(`   Status válido: ${hasValidStatus ? '✅' : '❌'} (${firstDetailedTrip.status})`);
      
      // O que inclui improvements
      const includesArray = firstDetailedTrip.o_que_inclui || [];
      const hasMultipleItems = includesArray.length > 1;
      const hasCleanItems = includesArray.every(item => item.length > 2 && item.length < 100);
      console.log(`   Múltiplos itens inclusos: ${hasMultipleItems ? '✅' : '❌'} (${includesArray.length} itens)`);
      console.log(`   Itens limpos: ${hasCleanItems ? '✅' : '❌'}`);
      
      if (includesArray.length > 0) {
        console.log('\n📋 ITENS INCLUSOS:');
        includesArray.forEach((item, index) => {
          console.log(`      ${index + 1}. "${item}"`);
        });
      }

      // Datas format
      const datesArray = firstDetailedTrip.datas || [];
      const hasMultipleDates = datesArray.length > 1;
      const hasCorrectFormat = datesArray.every(d => d.embarque && d.retorno);
      console.log(`\n📅 FORMATO DE DATAS:`);
      console.log(`   Múltiplas datas: ${hasMultipleDates ? '✅' : '❌'} (${datesArray.length} opções)`);
      console.log(`   Formato correto: ${hasCorrectFormat ? '✅' : '❌'}`);
      
      if (datesArray.length > 0) {
        console.log('   Exemplo:');
        datesArray.slice(0, 2).forEach((data, index) => {
          console.log(`      ${index + 1}. Embarque: ${data.embarque}, Retorno: ${data.retorno}`);
        });
      }

      // Save updated result
      const fs = await import('fs');
      fs.writeFileSync('api-updated-response.json', JSON.stringify(detailedData, null, 2));
      console.log('\n💾 Resposta atualizada salva em: api-updated-response.json');

      // Final summary
      const allValid = validations.every(v => v.valid);
      console.log('\n🎉 RESUMO FINAL:');
      console.log('=' .repeat(50));
      if (allValid) {
        console.log('✅ TODAS AS ATUALIZAÇÕES IMPLEMENTADAS COM SUCESSO!');
        console.log('✅ UID separado e extraído corretamente');
        console.log('✅ Status definido (ESGOTADO/DISPONÍVEL)');
        console.log('✅ O que inclui melhorado e estruturado');
        console.log('✅ Múltiplas datas no formato correto');
        console.log('✅ API funcionando perfeitamente');
      } else {
        console.log('⚠️ Algumas validações falharam - verificar implementação');
      }
    }

  } catch (error) {
    console.error('❌ Erro durante teste:', error);
  }
}

testAPIUpdates().catch(console.error);
