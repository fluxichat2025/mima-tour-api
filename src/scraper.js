import puppeteer from 'puppeteer';
import { config } from './config.js';

export class MimaTourScraper {
  constructor() {
    this.browser = null;
    this.page = null;
  }

  async initialize() {
    try {
      // Configure browser options for production vs development
      const browserOptions = {
        headless: config.scraping.headless,
        args: [
          '--no-sandbox',
          '--disable-setuid-sandbox',
          '--disable-dev-shm-usage',
          '--disable-accelerated-2d-canvas',
          '--no-first-run',
          '--no-zygote',
          '--disable-gpu',
          '--disable-background-timer-throttling',
          '--disable-backgrounding-occluded-windows',
          '--disable-renderer-backgrounding',
          '--disable-features=TranslateUI',
          '--disable-ipc-flooding-protection',
          '--disable-web-security',
          '--disable-features=VizDisplayCompositor'
        ]
      };

      // Only set executablePath in production environment
      if (process.env.NODE_ENV === 'production' && process.env.PUPPETEER_EXECUTABLE_PATH) {
        browserOptions.executablePath = process.env.PUPPETEER_EXECUTABLE_PATH;
      }

      this.browser = await puppeteer.launch(browserOptions);

      this.page = await this.browser.newPage();
      await this.page.setUserAgent(config.scraping.userAgent);
      await this.page.setViewport(config.scraping.viewport);

      // Enable request interception for speed optimization
      await this.page.setRequestInterception(true);
      this.page.on('request', (req) => {
        const resourceType = req.resourceType();
        // Block images, stylesheets, and fonts to speed up loading
        if (resourceType === 'image' || resourceType === 'stylesheet' || resourceType === 'font') {
          req.abort();
        } else {
          req.continue();
        }
      });

      console.log('Scraper initialized successfully with optimizations');
      return true;
    } catch (error) {
      console.error('Error initializing scraper:', error);
      return false;
    }
  }

  async navigateWithRetry(url, maxRetries = 3) {
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        console.log(`Navigation attempt ${attempt}/${maxRetries}`);

        await this.page.goto(url, {
          waitUntil: 'domcontentloaded', // Faster than networkidle2
          timeout: 45000 // Increased timeout
        });

        // Wait for essential content to be present
        await this.page.waitForSelector('body', { timeout: 10000 });

        console.log(`✅ Navigation successful on attempt ${attempt}`);
        return;

      } catch (error) {
        console.log(`❌ Navigation attempt ${attempt} failed: ${error.message}`);

        if (attempt === maxRetries) {
          throw new Error(`Failed to navigate after ${maxRetries} attempts: ${error.message}`);
        }

        // Wait before retry
        await new Promise(resolve => setTimeout(resolve, 2000));
      }
    }
  }

  async scrapeTrips(month = 'all', filters = {}, includeDetails = false) {
    try {
      if (!this.page) {
        await this.initialize();
      }

      const url = this.buildUrl(month, filters);
      console.log(`Navigating to: ${url}`);

      // Navigate with retry logic and optimized waiting
      await this.navigateWithRetry(url);

      // Reduced wait time since we're using faster loading
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Extract trip data
      const trips = await this.page.evaluate(() => {
        // Define helper functions directly in the page context
        function extractText(element, selector) {
          const target = selector ? element.querySelector(selector) : element;
          return target ? target.textContent.trim() : '';
        }

        function extractImage(element) {
          const img = element.querySelector('img');
          return img ? img.src : '';
        }

        function extractLink(element) {
          const link = element.querySelector('a');
          return link ? link.href : '';
        }

        function extractFeatures(element) {
          const features = [];
          const featureElements = element.querySelectorAll('.pacote-date.mt-1.pt-1');
          featureElements.forEach(el => {
            const text = el.textContent.trim();
            if (text && text.length > 2) {
              features.push(text);
            }
          });
          return features;
        }

        // Try multiple selectors to find trip elements (based on debug analysis)
        const selectors = [
          '.package-item',
          '[class*="package"]',
          '.package-item.bg-white',
          '.card, .item, .produto, .oferta',
          '[class*="card"], [class*="item"], [class*="produto"]',
          'article, .post, .entry',
          '.row .col, .grid-item, .list-item'
        ];

        let tripElements = [];
        for (const selector of selectors) {
          tripElements = document.querySelectorAll(selector);
          if (tripElements.length > 0) {
            console.log(`Found ${tripElements.length} elements with selector: ${selector}`);
            break;
          }
        }

        // If no specific elements found, try to find any container with multiple children
        if (tripElements.length === 0) {
          const containers = document.querySelectorAll('div, section, ul, ol');
          for (const container of containers) {
            if (container.children.length >= 3 && container.children.length <= 50) {
              tripElements = container.children;
              console.log(`Found ${tripElements.length} elements in container`);
              break;
            }
          }
        }

        const trips = [];

        Array.from(tripElements).forEach((element, index) => {
          try {
            const title = extractText(element, 'h4, h1, h2, h3, h5, h6, .title, .nome, .package-title, [class*="title"], [class*="nome"], strong, b');
            const price = extractText(element, '.class_valor, .price, .preco, .valor, [class*="price"], [class*="preco"], [class*="valor"], [class*="R$"]');
            const image = extractImage(element);
            const link = extractLink(element);
            const status = extractText(element, '.blog-date small, .status, .disponibilidade');

            // Extract UID from URL (e.g., uid749 from the URL)
            const uidMatch = link.match(/uid(\d+)/);
            const uid = uidMatch ? uidMatch[1] : null;

            // Basic trip info for listing
            const trip = {
              uid: uid,
              titulo: title.replace('▶️ ', '').trim(),
              url_img: image,
              url_reserva: link,
              status: status || "DISPONÍVEL", // Default to DISPONÍVEL if no status
              preco_listagem: price,
              // These will be filled by detailed extraction
              datas: [],
              embarques: [],
              roteiro: "",
              o_que_inclui: [],
              investimento: {
                pix: "",
                cartao_credito: ""
              },
              informacoes_importantes: {}
            };

            // Only add if we have at least a title or some meaningful content
            if (trip.titulo || trip.preco_listagem || (element.textContent && element.textContent.trim().length > 20)) {
              trips.push(trip);
            }
          } catch (error) {
            console.warn(`Error extracting trip ${index}:`, error);
          }
        });

        return trips;
      });

      console.log(`Found ${trips.length} trips`);

      // Extract detailed information only if requested
      if (includeDetails) {
        console.log('Extracting detailed information for each trip...');
        for (let i = 0; i < trips.length; i++) {
          const trip = trips[i];
          if (trip.url_reserva) {
            try {
              console.log(`Extracting details for trip ${i + 1}/${trips.length}: ${trip.titulo}`);
              const details = await this.getTripDetails(trip.url_reserva);
              trips[i] = { ...trip, ...details };

              // Reduced delay for faster processing
              await new Promise(resolve => setTimeout(resolve, 300));
            } catch (error) {
              console.warn(`Failed to extract details for trip ${i + 1}:`, error.message);
            }
          }
        }
      }

      return trips;

    } catch (error) {
      console.error('Error scraping trips:', error);
      throw error;
    }
  }

  buildUrl(month = 'all', filters = {}) {
    // Convert month name to number if needed
    const monthCode = config.mimaTour.months[month.toLowerCase()] || month;

    // Build base URL with month
    const baseUrl = config.mimaTour.baseUrl;
    const params = new URLSearchParams();

    params.set('mes', monthCode);
    params.set('destino', filters.destination || '');
    params.set('category', filters.category || '');
    params.set('embarque', filters.departure || '');

    return `${baseUrl}?${params.toString()}`;
  }

  async getTripDetails(tripLink) {
    try {
      if (!this.page) {
        await this.initialize();
      }

      // Use the optimized navigation method
      await this.navigateWithRetry(tripLink);

      // Reduced wait time
      await new Promise(resolve => setTimeout(resolve, 500));

      const details = await this.page.evaluate(() => {
        function extractText(element, selector) {
          const target = selector ? element.querySelector(selector) : element;
          return target ? target.textContent.trim() : '';
        }

        function extractMultipleDates() {
          const datas = [];

          // Look for the middle-wizard section with multiple date options
          const middleWizard = document.querySelector('#middle-wizard');
          if (middleWizard) {

            // First, try to extract from the date selection radio buttons
            const dateRadios = middleWizard.querySelectorAll('input[name="datas"]');

            if (dateRadios.length > 1) {
              // Multiple date options found
              console.log(`Found ${dateRadios.length} date options`);

              // Get all horario radios first (they might be outside div_horarios)
              const allHorarioRadios = middleWizard.querySelectorAll('input[name="horarios"]');

              dateRadios.forEach((dateRadio, index) => {
                const dateValue = dateRadio.getAttribute('data'); // e.g., "2025-09-06"
                if (dateValue) {
                  // Convert to DD/MM/YYYY format
                  const [year, month, day] = dateValue.split('-');
                  const formattedDate = `${day}/${month}/${year}`;

                  // Try to find matching horario for this date
                  let foundHorario = false;
                  allHorarioRadios.forEach(horarioRadio => {
                    const dataSaida = horarioRadio.getAttribute('data_saida');
                    const dataRetorno = horarioRadio.getAttribute('data_retorno');
                    const horaSaida = horarioRadio.getAttribute('horasaida');
                    const horaRetorno = horarioRadio.getAttribute('horaretorno');

                    if (dataSaida && dataSaida === formattedDate) {
                      datas.push({
                        embarque: `${dataSaida}, ${horaSaida}h`,
                        retorno: `${dataRetorno}, ${horaRetorno}h`
                      });
                      foundHorario = true;
                    }
                  });

                  // If no specific horario found for this date, create with default pattern
                  if (!foundHorario) {
                    // Calculate next day for return (assuming overnight trip)
                    const dateObj = new Date(year, month - 1, parseInt(day));
                    dateObj.setDate(dateObj.getDate() + 1);
                    const nextDay = String(dateObj.getDate()).padStart(2, '0');
                    const nextMonth = String(dateObj.getMonth() + 1).padStart(2, '0');
                    const nextYear = dateObj.getFullYear();
                    const retornoDate = `${nextDay}/${nextMonth}/${nextYear}`;

                    datas.push({
                      embarque: `${formattedDate}, 23:30h`,
                      retorno: `${retornoDate}, 18:00h`
                    });
                  }
                }
              });
            }

            // If no multiple date radios found, try to extract from dados_saida (single date)
            if (datas.length === 0) {
              const dadosSaida = document.querySelector('#dados_saida');
              if (dadosSaida) {
                const embarqueDiv = dadosSaida.querySelector('.col-lg-6:first-child .cart_destaque div');
                const retornoDiv = dadosSaida.querySelector('.col-lg-6:last-child .cart_destaque div');

                if (embarqueDiv && retornoDiv) {
                  const embarqueText = embarqueDiv.textContent.trim();
                  const retornoText = retornoDiv.textContent.trim();

                  // Extract date and time from format "20/09/2025 \n 23:30h"
                  const embarqueMatch = embarqueText.match(/(\d{1,2}\/\d{1,2}\/\d{4})[^0-9]*(\d{1,2}:\d{2}h?)/);
                  const retornoMatch = retornoText.match(/(\d{1,2}\/\d{1,2}\/\d{4})[^0-9]*(\d{1,2}:\d{2}h?)/);

                  if (embarqueMatch && retornoMatch) {
                    datas.push({
                      embarque: `${embarqueMatch[1]}, ${embarqueMatch[2]}`,
                      retorno: `${retornoMatch[1]}, ${retornoMatch[2]}`
                    });
                  }
                }
              }
            }

            // Additional fallback: look for date patterns in the text content
            if (datas.length === 0) {
              const allText = middleWizard.textContent;
              const dateMatches = allText.match(/(\d{1,2} de \w+)/g);
              if (dateMatches && dateMatches.length > 1) {
                dateMatches.forEach(dateText => {
                  // Convert "06 de setembro" to "06/09/2025" format
                  const monthMap = {
                    'janeiro': '01', 'fevereiro': '02', 'março': '03', 'abril': '04',
                    'maio': '05', 'junho': '06', 'julho': '07', 'agosto': '08',
                    'setembro': '09', 'outubro': '10', 'novembro': '11', 'dezembro': '12'
                  };

                  const match = dateText.match(/(\d{1,2}) de (\w+)/);
                  if (match) {
                    const day = match[1].padStart(2, '0');
                    const month = monthMap[match[2].toLowerCase()];
                    if (month) {
                      const formattedDate = `${day}/${month}/2025`;
                      datas.push({
                        embarque: `${formattedDate}, 23:30h`,
                        retorno: `${formattedDate}, 18:00h`
                      });
                    }
                  }
                });
              }
            }
          }

          return datas;
        }

        function extractEmbarques() {
          const embarques = [];

          // Look for the specific embarques section with the exact HTML structure
          const embarqueSection = document.querySelector('.col-12.cart_destaque');
          if (embarqueSection && embarqueSection.textContent.includes('EMBARQUES')) {

            // Find all embarque items with count-boarding class
            const embarqueItems = embarqueSection.querySelectorAll('.count-boarding');

            embarqueItems.forEach((item, index) => {
              const parent = item.parentElement;
              if (parent) {
                // Extract the embarque number from count-boarding (e.g., "1° ", "2° ")
                const ordem = parseInt(item.textContent.replace(/[°\s]/g, '')) || (index + 1);

                // Extract the location from the strong tag in traco_route
                const strongElement = parent.querySelector('.traco_route strong');
                const local = strongElement ? strongElement.textContent.trim() : '';

                // Extract the time from the small tag
                const timeElement = parent.querySelector('.traco_route small');
                let hora = null;
                if (timeElement) {
                  const timeMatch = timeElement.textContent.match(/(\d{1,2}h\d{2})/);
                  if (timeMatch) {
                    // Convert "12h40" to "12:40"
                    hora = timeMatch[1].replace('h', ':');
                  }
                }

                if (local) {
                  embarques.push({
                    ordem: ordem,
                    local: local,
                    hora: hora
                  });
                }
              }
            });
          }

          return embarques;
        }

        function extractInvestimento() {
          const investimento = { pix: "", cartao_credito: "" };
          const allText = document.body.textContent;

          // Look for PIX price pattern based on debug output
          const pixMatch = allText.match(/R\$\s*149,99\s*pix|pix[^R]*R\$\s*(\d+,?\d*)/i);
          if (pixMatch) {
            if (pixMatch[1]) {
              investimento.pix = `R$ ${pixMatch[1]}`;
            } else {
              investimento.pix = "R$ 149,99";
            }
          }

          // Look for credit card price pattern
          const cartaoMatch = allText.match(/R\$\s*169,00\s*cartão|cartão[^R]*R\$\s*(\d+,?\d*)/i);
          if (cartaoMatch) {
            if (cartaoMatch[1]) {
              investimento.cartao_credito = `R$ ${cartaoMatch[1]}`;
            } else {
              investimento.cartao_credito = "R$ 169,00";
            }
          }

          // Look for general investment text
          const investimentoMatch = allText.match(/INVESTIMENTO[^R]*R\$\s*(\d+,?\d*)[^R]*R\$\s*(\d+,?\d*)/i);
          if (investimentoMatch && !investimento.pix && !investimento.cartao_credito) {
            investimento.pix = `R$ ${investimentoMatch[1]}`;
            investimento.cartao_credito = `R$ ${investimentoMatch[2]}`;
          }

          // Fallback to main price if found
          if (!investimento.pix && !investimento.cartao_credito) {
            const mainPriceMatch = allText.match(/R\$\s*(\d+,?\d*)/);
            if (mainPriceMatch) {
              investimento.pix = `R$ ${mainPriceMatch[1]}`;
              investimento.cartao_credito = `R$ ${mainPriceMatch[1]}`;
            }
          }

          return investimento;
        }

        function extractRoteiro() {
          // Look for <summary>ROTEIRO</summary> element
          const summaryElements = document.querySelectorAll('summary');
          for (const summary of summaryElements) {
            if (summary.textContent.trim().toUpperCase().includes('ROTEIRO')) {
              // Get the content after the summary (usually in a details element)
              const details = summary.parentElement;
              if (details && details.tagName === 'DETAILS') {
                const content = details.textContent.replace(summary.textContent, '').trim();
                if (content.length > 10) {
                  return content;
                }
              }
              // If not in details, look for next sibling
              const nextElement = summary.nextElementSibling;
              if (nextElement) {
                const content = nextElement.textContent.trim();
                if (content.length > 10) {
                  return content;
                }
              }
            }
          }
          return "Roteiro não disponível";
        }

        function extractIncludes() {
          const includes = [];

          // Method 1: Look for <summary>O QUE INCLUI</summary> element
          const summaryElements = document.querySelectorAll('summary');
          for (const summary of summaryElements) {
            if (summary.textContent.trim().toUpperCase().includes('O QUE INCLUI') ||
                summary.textContent.trim().toUpperCase().includes('INCLUI')) {

              // Get the content after the summary
              const details = summary.parentElement;
              if (details && details.tagName === 'DETAILS') {
                const content = details.textContent.replace(summary.textContent, '').trim();

                // Better parsing - split by common patterns and clean up
                let items = [];

                // First try to split by capital letters (new words)
                const capitalSplit = content.split(/(?=[A-Z][a-z])/);
                capitalSplit.forEach(item => {
                  const clean = item.trim().replace(/^Incluso:/, '').trim();
                  if (clean.length > 2 && clean.length < 80) {
                    items.push(clean);
                  }
                });

                // If that doesn't work well, try other separators
                if (items.length <= 1) {
                  items = content.replace(/Incluso:/g, '').split(/\n|;|•|-|\*|(?=[A-Z][a-z]{3,})/).filter(item => {
                    const clean = item.trim();
                    return clean.length > 2 && clean.length < 100 &&
                           !clean.match(/^\d+$/) &&
                           !clean.match(/^[A-Z\s]{1,5}$/);
                  });
                }

                includes.push(...items.map(item => item.trim()));
                break;
              }

              // If not in details, look for next sibling
              const nextElement = summary.nextElementSibling;
              if (nextElement) {
                const content = nextElement.textContent.trim();
                const items = content.split(/\n|;|•|-|\*/).filter(item => {
                  const clean = item.trim();
                  return clean.length > 2 && clean.length < 100;
                });
                includes.push(...items.map(item => item.trim()));
                break;
              }
            }
          }

          // Method 2: Look for table with icons (new method for the table structure)
          if (includes.length === 0) {
            const tables = document.querySelectorAll('table');
            for (const table of tables) {
              const rows = table.querySelectorAll('tr');
              if (rows.length > 0) {
                rows.forEach(row => {
                  const cells = row.querySelectorAll('td');
                  if (cells.length >= 2) {
                    // First cell usually has SVG icon, second cell has the text
                    const iconCell = cells[0];
                    const textCell = cells[1];

                    // Check if first cell has SVG (icon)
                    if (iconCell.querySelector('svg') && textCell) {
                      const boldText = textCell.querySelector('b');
                      if (boldText) {
                        const itemText = boldText.textContent.trim();
                        if (itemText.length > 2 && itemText.length < 100) {
                          includes.push(itemText);
                        }
                      }
                    }
                  }
                });
              }
            }
          }

          // Method 3: Fallback - look for common travel inclusion patterns
          if (includes.length === 0) {
            const allText = document.body.textContent;
            const commonInclusions = [
              'Transporte',
              'Kit lanche',
              'Kit lanchinho',
              'Guia acompanhante',
              'Monitor',
              'Taxa de entrada',
              'Seguro viagem',
              'Ar condicionado',
              'Taxa de preservação ambiental',
              'Seguro transporte'
            ];

            commonInclusions.forEach(inclusion => {
              if (allText.toLowerCase().includes(inclusion.toLowerCase())) {
                includes.push(inclusion);
              }
            });
          }

          return [...new Set(includes)].slice(0, 10); // Remove duplicates and limit
        }

        // Extract multiple dates information
        const multipleDates = extractMultipleDates();

        return {
          datas: multipleDates,
          embarques: extractEmbarques(),
          roteiro: extractRoteiro(),
          o_que_inclui: extractIncludes(),
          investimento: extractInvestimento(),
          informacoes_importantes: {
            seguro_viagem: "Consulte condições na página da viagem",
            politica_minimo_passageiros: "Consulte condições na página da viagem",
            tolerancia_embarque: "Consulte condições na página da viagem",
            cancelamento: "Consulte condições na página da viagem",
            documento_obrigatorio: "RG ou CNH com foto obrigatórios para embarque"
          }
        };
      });

      return details;
    } catch (error) {
      console.error('Error getting trip details:', error);
      // Return default structure on error
      return {
        data_saida: [],
        data_volta: null,
        embarques: [],
        roteiro: "Informações não disponíveis",
        o_que_inclui: [],
        investimento: { pix: "", cartao_credito: "" },
        informacoes_importantes: {
          seguro_viagem: "Consulte condições",
          politica_minimo_passageiros: "Consulte condições",
          tolerancia_embarque: "Consulte condições",
          cancelamento: "Consulte condições",
          documento_obrigatorio: "RG ou CNH obrigatórios"
        }
      };
    }
  }

  async close() {
    try {
      if (this.browser) {
        await this.browser.close();
        this.browser = null;
        this.page = null;
        console.log('Scraper closed successfully');
      }
    } catch (error) {
      console.error('Error closing scraper:', error);
    }
  }
}

// Helper functions for page evaluation
if (typeof window !== 'undefined') {
  window.extractText = function(element, selector) {
    const target = selector ? element.querySelector(selector) : element;
    return target ? target.textContent.trim() : '';
  };

  window.extractImage = function(element) {
    const img = element.querySelector('img');
    return img ? img.src : '';
  };

  window.extractLink = function(element) {
    const link = element.querySelector('a');
    return link ? link.href : '';
  };

  window.extractImages = function(element, selector) {
    const images = element.querySelectorAll(selector);
    return Array.from(images).map(img => img.src);
  };

  window.extractFeatures = function(element) {
    const features = [];
    const featureElements = element.querySelectorAll('.pacote-date.mt-1.pt-1');
    featureElements.forEach(el => {
      const text = el.textContent.trim();
      if (text && text.length > 2) {
        features.push(text);
      }
    });
    return features;
  };
}

export default MimaTourScraper;
