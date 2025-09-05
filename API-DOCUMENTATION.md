# 📚 Mima Tour Travel API - Documentação Completa

## 🎯 Visão Geral

A **Mima Tour Travel API** é uma API REST que permite buscar e filtrar viagens e pacotes turísticos do site da Mima Tour através de web scraping em tempo real.

### ✨ Características
- 🔍 **Busca por mês específico** (janeiro a dezembro)
- 💰 **Filtros por faixa de preço**
- 📊 **Dados estruturados em JSON**
- 🚀 **Respostas em tempo real**
- 📱 **CORS habilitado** para uso em frontend

---

## 🚀 Início Rápido

### Instalação
```bash
git clone <repository>
cd websearch-mcp-mima-tour
npm install
npm run install-browser
```

### Executar API
```bash
npm run api
```

A API estará disponível em: **http://localhost:3000**

---

## 📋 Endpoints Disponíveis

### 1. **GET /** - Documentação da API
Retorna informações sobre a API e endpoints disponíveis.

**URL:** `http://localhost:3000/`

**Resposta:**
```json
{
  "name": "Mima Tour Travel API",
  "version": "1.0.0",
  "description": "API para buscar viagens e pacotes turísticos da Mima Tour",
  "endpoints": {
    "GET /": "API documentation",
    "GET /trips": "Get all trips",
    "GET /trips/:month": "Get trips for specific month",
    "GET /trips/price/:min/:max": "Get trips within price range",
    "GET /months": "Get available months",
    "GET /health": "Health check"
  }
}
```

---

### 2. **GET /health** - Status da API
Verifica se a API está funcionando.

**URL:** `http://localhost:3000/health`

**Resposta:**
```json
{
  "status": "OK",
  "timestamp": "2025-09-05T15:30:00.000Z",
  "uptime": 120.5
}
```

---

### 3. **GET /months** - Meses Disponíveis
Lista todos os meses disponíveis para busca.

**URL:** `http://localhost:3000/months`

**Resposta:**
```json
{
  "success": true,
  "data": [
    {
      "name": "all",
      "code": "all",
      "url": "https://mimatourviagens.suareservaonline.com.br/44022?mes=all&destino=&category=&embarque="
    },
    {
      "name": "janeiro",
      "code": "01",
      "url": "https://mimatourviagens.suareservaonline.com.br/44022?mes=01&destino=&category=&embarque="
    },
    {
      "name": "setembro",
      "code": "09",
      "url": "https://mimatourviagens.suareservaonline.com.br/44022?mes=09&destino=&category=&embarque="
    }
  ],
  "total": 13
}
```

---

### 4. **GET /trips** - Todas as Viagens
Busca todas as viagens disponíveis (padrão: todos os meses).

**URL:** `http://localhost:3000/trips`

**Query Parameters:**
- `month` (opcional): Filtrar por mês específico

**Exemplos:**
- `http://localhost:3000/trips` - Todas as viagens
- `http://localhost:3000/trips?month=setembro` - Viagens de setembro

**Resposta:**
```json
{
  "success": true,
  "month": "all",
  "data": [
    {
      "id": 1,
      "title": "▶️ ILHABELA DATAS SETEMBRO 2025",
      "price": "R$159,00",
      "originalPrice": "R$170,00",
      "destination": "",
      "date": "ÚLTIMAS VAGAS",
      "status": "ÚLTIMAS VAGAS",
      "description": "",
      "features": [
        "kit Lanchinho a bordo",
        "Taxa de preservação ambiental",
        "Ar Condicionado"
      ],
      "image": "https://img.suareservaonline.com.br/mimatourviagens/shop/products/featured/f1ff40bee7c4707b6d9ad5f184f86390.jpeg",
      "link": "https://mimatourviagens.suareservaonline.com.br/pacote/ilhabela-datas-setembro-2025-uid749/44022",
      "duration": "",
      "category": "Pacote turístico"
    }
  ],
  "total": 37,
  "timestamp": "2025-09-05T15:30:00.000Z"
}
```

---

### 5. **GET /trips/:month** - Viagens por Mês
Busca viagens de um mês específico.

**URL:** `http://localhost:3000/trips/{month}`

**Parâmetros:**
- `month`: Nome do mês ou código numérico

**Exemplos:**
- `http://localhost:3000/trips/setembro` - Viagens de setembro
- `http://localhost:3000/trips/09` - Viagens de setembro (numérico)
- `http://localhost:3000/trips/outubro` - Viagens de outubro
- `http://localhost:3000/trips/10` - Viagens de outubro (numérico)

**Meses Aceitos:**
- **Nomes:** janeiro, fevereiro, março, abril, maio, junho, julho, agosto, setembro, outubro, novembro, dezembro
- **Códigos:** 01, 02, 03, 04, 05, 06, 07, 08, 09, 10, 11, 12
- **Especial:** all (todas as viagens)

---

### 6. **GET /trips/price/:min/:max** - Viagens por Faixa de Preço
Busca viagens dentro de uma faixa de preço específica.

**URL:** `http://localhost:3000/trips/price/{min}/{max}`

**Parâmetros:**
- `min`: Preço mínimo (em reais)
- `max`: Preço máximo (em reais)

**Query Parameters:**
- `month` (opcional): Filtrar por mês específico

**Exemplos:**
- `http://localhost:3000/trips/price/50/200` - Viagens entre R$ 50 e R$ 200
- `http://localhost:3000/trips/price/100/500?month=setembro` - Viagens de setembro entre R$ 100 e R$ 500

**Resposta:**
```json
{
  "success": true,
  "month": "all",
  "priceRange": {
    "min": 50,
    "max": 200
  },
  "data": [
    {
      "id": 2,
      "title": "▶️ ILHABELA DATAS SETEMBRO 2025",
      "price": "R$159,00",
      "originalPrice": "R$170,00"
    }
  ],
  "total": 24,
  "totalScraped": 37,
  "timestamp": "2025-09-05T15:30:00.000Z"
}
```

---

## 📊 Estrutura dos Dados de Viagem

Cada viagem retornada contém os seguintes campos:

```json
{
  "id": 1,                    // ID único da viagem
  "title": "Nome da viagem",  // Título completo
  "price": "R$159,00",        // Preço atual
  "originalPrice": "R$170,00", // Preço original (se houver desconto)
  "destination": "",          // Destino (quando disponível)
  "date": "06 de set",        // Data de saída
  "status": "ÚLTIMAS VAGAS",  // Status (ESGOTADO, ÚLTIMAS VAGAS, etc.)
  "description": "",          // Descrição da viagem
  "features": [               // Características incluídas
    "Ar Condicionado",
    "Kit Lanchinho a bordo"
  ],
  "image": "https://...",     // URL da imagem
  "link": "https://...",      // Link para página de detalhes
  "duration": "",             // Duração da viagem
  "category": "Pacote turístico", // Categoria
  "rawText": "..."            // Texto bruto extraído
}
```

---

## 🔧 Códigos de Status HTTP

| Código | Descrição |
|--------|-----------|
| 200 | Sucesso |
| 404 | Endpoint não encontrado |
| 500 | Erro interno do servidor |

---

## 📝 Exemplos de Uso

### JavaScript/Fetch
```javascript
// Buscar todas as viagens
const response = await fetch('http://localhost:3000/trips');
const data = await response.json();
console.log(`Encontradas ${data.total} viagens`);

// Buscar viagens de setembro
const septemberTrips = await fetch('http://localhost:3000/trips/setembro');
const septemberData = await septemberTrips.json();

// Buscar viagens baratas
const cheapTrips = await fetch('http://localhost:3000/trips/price/50/200');
const cheapData = await cheapTrips.json();
```

### cURL
```bash
# Todas as viagens
curl http://localhost:3000/trips

# Viagens de setembro
curl http://localhost:3000/trips/setembro

# Viagens entre R$ 50 e R$ 200
curl http://localhost:3000/trips/price/50/200

# Meses disponíveis
curl http://localhost:3000/months

# Status da API
curl http://localhost:3000/health
```

### Python
```python
import requests

# Buscar todas as viagens
response = requests.get('http://localhost:3000/trips')
data = response.json()
print(f"Encontradas {data['total']} viagens")

# Buscar viagens de outubro
october_response = requests.get('http://localhost:3000/trips/outubro')
october_data = october_response.json()

# Filtrar por preço
price_response = requests.get('http://localhost:3000/trips/price/100/300')
price_data = price_response.json()
```

---

## ⚡ Performance e Limitações

### Performance
- **Tempo de resposta:** 10-20 segundos (web scraping em tempo real)
- **Cache:** Não implementado (dados sempre atualizados)
- **Concurrent requests:** Suportado

### Limitações
- Dependente da estrutura HTML do site da Mima Tour
- Sem autenticação (API pública)
- Sem rate limiting implementado

---

## 🛠️ Desenvolvimento

### Executar em modo desenvolvimento
```bash
npm run dev-api
```

### Executar testes
```bash
node test-api.js
```

### Estrutura do projeto
```
src/
├── api-server.js    # Servidor Express da API
├── scraper.js       # Web scraper
├── config.js        # Configurações
└── index.js         # Servidor MCP
```

---

## 🚀 Deploy

### Variáveis de ambiente
```bash
PORT=3000
NODE_ENV=production
MIMA_TOUR_BASE_URL=https://mimatourviagens.suareservaonline.com.br/44022
```

### Docker (exemplo)
```dockerfile
FROM node:18
WORKDIR /app
COPY package*.json ./
RUN npm install
RUN npx puppeteer browsers install chrome
COPY . .
EXPOSE 3000
CMD ["npm", "run", "api"]
```

---

## 📞 Suporte

Para dúvidas ou problemas:
1. Verifique os logs do servidor
2. Teste os endpoints com cURL
3. Verifique se o site da Mima Tour está acessível

**API pronta para uso em produção!** 🎉
