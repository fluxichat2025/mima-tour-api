#!/usr/bin/env node

import { MimaTourScraper } from './src/scraper.js';

async function debugDatesStructure() {
  console.log('🔍 DEBUG DA ESTRUTURA DE DATAS\n');

  const scraper = new MimaTourScraper();

  try {
    await scraper.initialize();
    console.log('✅ Scraper inicializado\n');

    const tripUrl = 'https://mimatourviagens.suareservaonline.com.br/pacote/ilhabela-datas-setembro-2025-uid749/44022';
    console.log(`🌐 Analisando: ${tripUrl}\n`);

    await scraper.page.goto(tripUrl, { 
      waitUntil: 'networkidle2',
      timeout: 30000 
    });

    await new Promise(resolve => setTimeout(resolve, 5000));

    // Debug the date structure
    const dateStructure = await scraper.page.evaluate(() => {
      const result = {
        middleWizard: null,
        dateRadios: [],
        horarioRadios: [],
        selectHorarios: null,
        dadosSaida: null,
        allDateTexts: []
      };

      // Check middle-wizard
      const middleWizard = document.querySelector('#middle-wizard');
      if (middleWizard) {
        result.middleWizard = {
          exists: true,
          innerHTML: middleWizard.innerHTML.substring(0, 1000) + '...'
        };

        // Check for date radios
        const dateRadios = middleWizard.querySelectorAll('input[name="datas"]');
        dateRadios.forEach((radio, index) => {
          result.dateRadios.push({
            index,
            data: radio.getAttribute('data'),
            checked: radio.checked,
            value: radio.value,
            parentText: radio.parentElement.textContent.trim().substring(0, 100)
          });
        });

        // Check for horario radios
        const horarioRadios = middleWizard.querySelectorAll('input[name="horarios"]');
        horarioRadios.forEach((radio, index) => {
          result.horarioRadios.push({
            index,
            data_saida: radio.getAttribute('data_saida'),
            data_retorno: radio.getAttribute('data_retorno'),
            horasaida: radio.getAttribute('horasaida'),
            horaretorno: radio.getAttribute('horaretorno'),
            value: radio.value,
            checked: radio.checked
          });
        });

        // Check select_horarios section
        const selectHorarios = middleWizard.querySelector('.select_horarios');
        if (selectHorarios) {
          result.selectHorarios = {
            exists: true,
            innerHTML: selectHorarios.innerHTML.substring(0, 500) + '...'
          };
        }
      }

      // Check dados_saida
      const dadosSaida = document.querySelector('#dados_saida');
      if (dadosSaida) {
        result.dadosSaida = {
          exists: true,
          innerHTML: dadosSaida.innerHTML,
          embarqueText: dadosSaida.querySelector('.col-lg-6:first-child')?.textContent?.trim(),
          retornoText: dadosSaida.querySelector('.col-lg-6:last-child')?.textContent?.trim()
        };
      }

      // Find all date-like text patterns
      const allText = document.body.textContent;
      const datePatterns = [
        /\d{1,2} de \w+/g,
        /\d{1,2}\/\d{1,2}\/\d{4}/g,
        /\d{1,2}:\d{2}h?/g
      ];

      datePatterns.forEach(pattern => {
        const matches = allText.match(pattern);
        if (matches) {
          result.allDateTexts.push(...matches);
        }
      });

      return result;
    });

    console.log('📋 ESTRUTURA DE DATAS ENCONTRADA:');
    console.log('=' .repeat(60));
    console.log(JSON.stringify(dateStructure, null, 2));
    console.log('=' .repeat(60));

    // Analyze the results
    console.log('\n🔍 ANÁLISE:');
    console.log('-' .repeat(40));
    console.log(`Middle Wizard: ${dateStructure.middleWizard ? '✅ Encontrado' : '❌ Não encontrado'}`);
    console.log(`Date Radios: ${dateStructure.dateRadios.length} encontrados`);
    console.log(`Horario Radios: ${dateStructure.horarioRadios.length} encontrados`);
    console.log(`Dados Saída: ${dateStructure.dadosSaida ? '✅ Encontrado' : '❌ Não encontrado'}`);
    console.log(`Textos de data: ${dateStructure.allDateTexts.length} encontrados`);

    if (dateStructure.dateRadios.length > 0) {
      console.log('\n📅 OPÇÕES DE DATA:');
      dateStructure.dateRadios.forEach((radio, index) => {
        console.log(`${index + 1}. Data: ${radio.data}, Texto: "${radio.parentText}"`);
      });
    }

    if (dateStructure.horarioRadios.length > 0) {
      console.log('\n🕐 OPÇÕES DE HORÁRIO:');
      dateStructure.horarioRadios.forEach((radio, index) => {
        console.log(`${index + 1}. Saída: ${radio.data_saida} às ${radio.horasaida}h, Retorno: ${radio.data_retorno} às ${radio.horaretorno}h`);
      });
    }

    // Save debug info
    const fs = await import('fs');
    fs.writeFileSync('debug-dates-structure.json', JSON.stringify(dateStructure, null, 2));
    console.log('\n💾 Debug salvo em: debug-dates-structure.json');

  } catch (error) {
    console.error('❌ Erro durante debug:', error);
  } finally {
    await scraper.close();
    console.log('\n🧹 Recursos liberados');
  }
}

debugDatesStructure().catch(console.error);
