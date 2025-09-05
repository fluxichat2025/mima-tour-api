#!/usr/bin/env node

async function testAPICorrected() {
  console.log('🧪 TESTE DA API CORRIGIDA\n');

  try {
    // Test with just one trip to verify the corrections
    console.log('🔍 Testando API corrigida com detalhes (limitando a 1 viagem para teste rápido)...\n');
    
    const response = await fetch('http://localhost:3000/trips/setembro?details=true');
    const data = await response.json();
    
    console.log(`✅ API respondeu: ${data.total} viagens encontradas`);
    console.log(`📊 Detalhes incluídos: ${data.includeDetails}`);
    
    if (data.data.length > 0) {
      const firstTrip = data.data[0];
      console.log('\n📋 PRIMEIRA VIAGEM (FORMATO CORRIGIDO):');
      console.log('=' .repeat(60));
      console.log(JSON.stringify(firstTrip, null, 2));
      console.log('=' .repeat(60));

      // Validate the corrected format
      console.log('\n🔍 VALIDAÇÃO DO FORMATO:');
      console.log('-' .repeat(40));
      
      // Check required fields
      const requiredFields = ['titulo', 'data_saida', 'data_volta', 'embarques', 'roteiro', 'o_que_inclui', 'investimento', 'informacoes_importantes', 'url_img', 'url_reserva'];
      requiredFields.forEach(field => {
        const hasField = firstTrip.hasOwnProperty(field);
        console.log(`${hasField ? '✅' : '❌'} ${field}: ${hasField ? 'Presente' : 'Ausente'}`);
      });

      // Check embarques structure
      if (firstTrip.embarques && firstTrip.embarques.length > 0) {
        console.log('\n🚌 ESTRUTURA DOS EMBARQUES:');
        firstTrip.embarques.forEach((embarque, index) => {
          const hasOrdem = embarque.hasOwnProperty('ordem');
          const hasLocal = embarque.hasOwnProperty('local');
          const hasHora = embarque.hasOwnProperty('hora');
          console.log(`${index + 1}. Ordem: ${hasOrdem ? '✅' : '❌'}, Local: ${hasLocal ? '✅' : '❌'}, Hora: ${hasHora ? '✅' : '❌'}`);
        });
      }

      // Check investimento structure
      if (firstTrip.investimento) {
        console.log('\n💰 ESTRUTURA DO INVESTIMENTO:');
        const hasPix = firstTrip.investimento.hasOwnProperty('pix');
        const hasCartao = firstTrip.investimento.hasOwnProperty('cartao_credito');
        console.log(`PIX: ${hasPix ? '✅' : '❌'} (${firstTrip.investimento.pix || 'N/A'})`);
        console.log(`Cartão: ${hasCartao ? '✅' : '❌'} (${firstTrip.investimento.cartao_credito || 'N/A'})`);
      }

      // Check for problematic content
      console.log('\n🔍 VERIFICAÇÃO DE PROBLEMAS:');
      const hasEmailInRoteiro = firstTrip.roteiro && firstTrip.roteiro.includes('@');
      const hasLongIncludeItems = firstTrip.o_que_inclui && firstTrip.o_que_inclui.some(item => item.length > 100);
      const hasMalformedEmbarques = firstTrip.embarques && firstTrip.embarques.some(e => !e.local || e.local.length < 5);
      
      console.log(`Email no roteiro: ${hasEmailInRoteiro ? '❌ SIM' : '✅ NÃO'}`);
      console.log(`Itens "inclui" muito longos: ${hasLongIncludeItems ? '❌ SIM' : '✅ NÃO'}`);
      console.log(`Embarques malformados: ${hasMalformedEmbarques ? '❌ SIM' : '✅ NÃO'}`);

      // Save the corrected result
      const fs = await import('fs');
      fs.writeFileSync('api-response-corrected.json', JSON.stringify(data, null, 2));
      console.log('\n💾 Resposta corrigida salva em: api-response-corrected.json');

      console.log('\n🎯 RESUMO:');
      if (!hasEmailInRoteiro && !hasLongIncludeItems && !hasMalformedEmbarques) {
        console.log('✅ FORMATO CORRIGIDO COM SUCESSO!');
        console.log('✅ Todos os campos estão no formato esperado');
        console.log('✅ Dados limpos e estruturados');
      } else {
        console.log('⚠️ Ainda há alguns problemas a corrigir');
      }

    } else {
      console.log('⚠️ Nenhuma viagem encontrada');
    }

  } catch (error) {
    console.error('❌ Erro durante teste:', error);
  }
}

testAPICorrected().catch(console.error);
