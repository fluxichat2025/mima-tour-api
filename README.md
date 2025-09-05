# WebSearch MCP - Mima Tour Travel API

Um sistema completo de web scraping para extrair informações de viagens do site da Mima Tour, disponível como servidor MCP e API REST.

## 🚀 Funcionalidades

- **Web Scraping Avançado**: Extrai automaticamente pacotes de viagem do site da Mima Tour
- **Busca por Mês**: Filtra viagens por mês específico (janeiro a dezembro)
- **Filtros de Preço**: Busca viagens dentro de faixas de preço específicas
- **API REST**: Interface HTTP para integração fácil com qualquer aplicação
- **Servidor MCP**: Compatível com clientes MCP para integração avançada
- **Dados Estruturados**: Retorna informações organizadas em JSON

## 📋 Pré-requisitos

- Node.js 18+
- npm ou yarn

## 🛠️ Instalação

1. Clone ou baixe o projeto
2. Instale as dependências:

```bash
npm install
```

3. Instale o navegador para web scraping:

```bash
npm run install-browser
```

## 🚦 Uso

### Iniciar a API REST

```bash
npm run api
```

A API estará disponível em: **http://localhost:3000**

### Iniciar o servidor MCP

```bash
npm start
```

### Modo de desenvolvimento

```bash
npm run dev-api    # API REST com auto-reload
npm run dev        # Servidor MCP com auto-reload
```

### Executar testes

```bash
npm test
node test-api.js   # Teste específico da API
```

## 🔧 Ferramentas Disponíveis

### `search_trips`
Busca pacotes de viagem no site da Mima Tour.

**Parâmetros:**
- `month` (opcional): Filtrar por mês
- `destination` (opcional): Filtrar por destino
- `category` (opcional): Filtrar por categoria
- `departure` (opcional): Filtrar por local de embarque

### `get_trip_details`
Obtém informações detalhadas de uma viagem específica.

**Parâmetros:**
- `tripLink` (obrigatório): URL da página de detalhes da viagem

### `enrich_trip_with_grok`
Enriquece informações de viagem usando Grok AI.

**Parâmetros:**
- `trip` (obrigatório): Objeto da viagem para enriquecer

### `search_destination_info`
Busca informações detalhadas sobre um destino.

**Parâmetros:**
- `destination` (obrigatório): Nome do destino

### `generate_trip_recommendations`
Gera recomendações personalizadas de viagem.

**Parâmetros:**
- `preferences` (obrigatório): Objeto com preferências do usuário

### `test_grok_connection`
Testa a conexão com a API do Grok.

## 📁 Estrutura do Projeto

```
websearch-mcp-mima-tour/
├── src/
│   ├── index.js              # Servidor MCP principal
│   ├── scraper.js            # Web scraper para Mima Tour
│   ├── grok-integration.js   # Integração com Grok AI
│   └── config.js             # Configurações centralizadas
├── test/
│   └── test.js               # Testes automatizados
├── package.json              # Configuração do projeto
├── mcp-config.json          # Configuração MCP
├── .env.example             # Exemplo de variáveis de ambiente
└── README.md                # Documentação
```

## ⚙️ Configuração

### Variáveis de Ambiente

| Variável | Descrição | Padrão |
|----------|-----------|---------|
| `GROK_API_KEY` | Chave da API Grok | - |
| `GROK_API_URL` | URL da API Grok | `https://api.x.ai/v1` |
| `MIMA_TOUR_BASE_URL` | URL base do site | `https://mimatourviagens.suareservaonline.com.br/44022` |
| `SCRAPING_TIMEOUT` | Timeout para scraping (ms) | `30000` |
| `HEADLESS_MODE` | Modo headless do navegador | `true` |
| `DEBUG` | Modo debug | `false` |

## 🧪 Testes

O projeto inclui testes automatizados para verificar:

- Funcionamento do web scraper
- Conexão com a API Grok
- Workflow completo de scraping + enriquecimento

Execute os testes com:

```bash
npm test
```

## 🔍 Exemplo de Uso

```javascript
// Buscar viagens
const trips = await searchTrips({
  month: 'janeiro',
  destination: 'Europa'
});

// Enriquecer com Grok AI
const enrichedTrip = await enrichTripWithGrok({
  trip: trips[0]
});

// Buscar informações de destino
const destinationInfo = await searchDestinationInfo({
  destination: 'Paris'
});
```

## 🛡️ Tratamento de Erros

O sistema inclui tratamento robusto de erros para:

- Falhas de conexão de rede
- Timeouts de scraping
- Erros da API Grok
- Problemas de parsing HTML

## 📝 Logs

Os logs incluem informações sobre:

- Inicialização do scraper
- Número de viagens encontradas
- Status das requisições Grok
- Erros e warnings

## 🤝 Contribuição

1. Faça um fork do projeto
2. Crie uma branch para sua feature
3. Commit suas mudanças
4. Push para a branch
5. Abra um Pull Request

## 📄 Licença

MIT License - veja o arquivo LICENSE para detalhes.

## 🆘 Suporte

Para problemas ou dúvidas:

1. Verifique os logs de erro
2. Execute os testes para diagnosticar
3. Consulte a documentação da API Grok
4. Abra uma issue no repositório
