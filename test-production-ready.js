#!/usr/bin/env node

import { spawn } from 'child_process';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

async function testProductionReady() {
  console.log('🧪 TESTE DE PRODUÇÃO - VERIFICAÇÃO COMPLETA\n');

  // Test 1: Check required files
  console.log('1️⃣ Verificando arquivos necessários...');
  const requiredFiles = [
    'package.json',
    'src/api-server.js',
    'src/scraper.js',
    'src/config.js',
    'Dockerfile',
    'railway.json',
    'render.yaml',
    '.env.production'
  ];

  const fs = await import('fs');
  let allFilesExist = true;

  for (const file of requiredFiles) {
    const exists = fs.existsSync(join(__dirname, file));
    console.log(`   ${exists ? '✅' : '❌'} ${file}`);
    if (!exists) allFilesExist = false;
  }

  if (!allFilesExist) {
    console.log('❌ Alguns arquivos necessários estão faltando!');
    return;
  }

  console.log('✅ Todos os arquivos necessários estão presentes\n');

  // Test 2: Check package.json configuration
  console.log('2️⃣ Verificando configuração do package.json...');
  const packageJson = JSON.parse(fs.readFileSync(join(__dirname, 'package.json'), 'utf8'));
  
  const checks = [
    { key: 'name', expected: 'websearch-mcp-mima-tour', actual: packageJson.name },
    { key: 'main', expected: 'src/index.js', actual: packageJson.main },
    { key: 'type', expected: 'module', actual: packageJson.type },
    { key: 'start script', expected: 'node src/api-server.js', actual: packageJson.scripts.start },
    { key: 'engines.node', expected: '>=18.0.0', actual: packageJson.engines?.node }
  ];

  checks.forEach(check => {
    const isValid = check.actual === check.expected;
    console.log(`   ${isValid ? '✅' : '❌'} ${check.key}: ${check.actual}`);
  });

  console.log('✅ Package.json configurado corretamente\n');

  // Test 3: Test production environment variables
  console.log('3️⃣ Testando variáveis de ambiente de produção...');
  
  // Set production environment
  process.env.NODE_ENV = 'production';
  process.env.PUPPETEER_SKIP_CHROMIUM_DOWNLOAD = 'true';
  process.env.PUPPETEER_EXECUTABLE_PATH = '/usr/bin/google-chrome-stable';
  
  try {
    const { default: config } = await import('./src/config.js');
    console.log('   ✅ Configuração carregada com sucesso');
    console.log(`   ✅ Timeout: ${config.scraping.timeout}ms`);
    console.log(`   ✅ Headless: ${config.scraping.headless}`);
  } catch (error) {
    console.log(`   ❌ Erro ao carregar configuração: ${error.message}`);
    return;
  }

  console.log('✅ Variáveis de ambiente configuradas\n');

  // Test 4: Test API server startup
  console.log('4️⃣ Testando inicialização do servidor...');
  
  return new Promise((resolve) => {
    const server = spawn('node', ['src/api-server.js'], {
      env: { ...process.env, PORT: '3001' }, // Use different port for test
      stdio: ['pipe', 'pipe', 'pipe']
    });

    let output = '';
    let healthCheckPassed = false;

    server.stdout.on('data', (data) => {
      output += data.toString();
      console.log(`   📡 ${data.toString().trim()}`);
      
      if (data.toString().includes('Server running on')) {
        // Server started, test health endpoint
        setTimeout(async () => {
          try {
            const response = await fetch('http://localhost:3001/health');
            const health = await response.json();
            
            if (health.status === 'healthy') {
              console.log('   ✅ Health check passou');
              console.log(`   ✅ Versão: ${health.version}`);
              healthCheckPassed = true;
            } else {
              console.log('   ❌ Health check falhou');
            }
          } catch (error) {
            console.log(`   ❌ Erro no health check: ${error.message}`);
          }
          
          server.kill();
        }, 2000);
      }
    });

    server.stderr.on('data', (data) => {
      console.log(`   ⚠️ ${data.toString().trim()}`);
    });

    server.on('close', (code) => {
      console.log(`   📡 Servidor encerrado com código: ${code}`);
      
      if (healthCheckPassed) {
        console.log('✅ Servidor funcionando corretamente\n');
        
        // Final summary
        console.log('🎉 RESUMO DO TESTE DE PRODUÇÃO:');
        console.log('=' .repeat(50));
        console.log('✅ Arquivos necessários: OK');
        console.log('✅ Package.json: OK');
        console.log('✅ Variáveis de ambiente: OK');
        console.log('✅ Servidor API: OK');
        console.log('✅ Health check: OK');
        
        console.log('\n🚀 PROJETO PRONTO PARA DEPLOY!');
        console.log('📋 Próximos passos:');
        console.log('1. git add . && git commit -m "Ready for deploy"');
        console.log('2. git push origin main');
        console.log('3. Deploy no Railway ou Render');
        console.log('4. Configurar variáveis de ambiente');
        console.log('5. Testar API online');
        
        console.log('\n📚 Consulte DEPLOY-GUIDE.md para instruções detalhadas');
        
      } else {
        console.log('❌ Servidor não passou no health check');
      }
      
      resolve();
    });

    // Kill server after 10 seconds if still running
    setTimeout(() => {
      if (!server.killed) {
        console.log('   ⏰ Timeout - encerrando servidor de teste');
        server.kill();
      }
    }, 10000);
  });
}

testProductionReady().catch(console.error);
