// scripts/fetch-docs.js
import axios from 'axios';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function fetchGoogleDoc(docId) {
  console.log('📥 Baixando documento...');
  
  try {
    const url = `https://docs.google.com/document/d/${docId}/export?format=html`;
    const response = await axios.get(url);
    
    if (response.status !== 200) {
      throw new Error('Documento não encontrado. Verifique se está público.');
    }
    
    let rawHtml = response.data.trim();
    
    const data = parseHTMLFormat(rawHtml);
    
    if (!data.title) {
      console.warn('⚠️  Aviso: O campo "title" não foi encontrado nos metadados do topo. O sistema irá procurar por um componente `type: header` nos parágrafos.');
    }
    
    if (!data.slug) {
      data.slug = (data.title || `doc-${Date.now()}`)
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-z0-9\s-]/g, '')
        .replace(/\s+/g, '-')
        .substring(0, 50);
    }
    
    const outputDir = path.join(__dirname, '../static/data');
    await fs.mkdir(outputDir, { recursive: true });
    
    const filename = `${data.slug}.json`;
    const filepath = path.join(outputDir, filename);
    
    await fs.writeFile(filepath, JSON.stringify(data, null, 2));
    
    console.log(`\n✅ Sucesso! Arquivo salvo: ${filename}`);
    console.log(`📝 Título: ${data.title}`);
    console.log(`📊 Intro: ${data.intro ? 'OK' : 'Vazio'}`);
    console.log(`📊 Paragraphs: ${data.paragraphs ? data.paragraphs.length : 0} itens`);
    console.log(`📝 Créditos: ${data.credits ? 'OK' : 'Vazio'}`);

    // ScrollyTelling tradicional
    const scrollyComponents = data.paragraphs?.filter(p => 
      ['scrollytelling', 'scrolly'].includes(p.type?.toLowerCase())
    ) || [];
    
    if (scrollyComponents.length > 0) {
      console.log(`📜 ScrollyTelling encontrados: ${scrollyComponents.length}`);
      scrollyComponents.forEach((comp, index) => {
        const stepsCount = comp.steps?.length || 0;
        console.log(`  ${index + 1}. Steps: ${stepsCount} | FullWidth: ${comp.fullWidth || 'false'}`);
        if (stepsCount === 0) {
          console.warn(`⚠️ ScrollyTelling sem steps: ${comp.text?.substring(0, 50)}...`);
        } else {
          comp.steps.forEach((step, stepIndex) => {
            console.log(`     Step ${stepIndex + 1}: "${step.title?.substring(0, 30)}..." | Imagem: ${!!step.image} | Vídeo: ${!!step.video}`);
          });
        }
      });
    }

    // 🆕 ScrollyFrames (novo)
    const scrollyFramesComponents = data.paragraphs?.filter(p => 
      p.type?.toLowerCase() === 'scrollyframes'
    ) || [];
    
    if (scrollyFramesComponents.length > 0) {
      console.log(`🎬 ScrollyFrames encontrados: ${scrollyFramesComponents.length}`);
      scrollyFramesComponents.forEach((comp, index) => {
        const stepsCount = comp.steps?.length || 0;
        console.log(`  ${index + 1}. Frames: ${comp.frameStart || 1}-${comp.frameStop || 'N/A'} | Steps: ${stepsCount}`);
        console.log(`     Prefix: ${comp.imagePrefix ? '✅' : '❌'} | Mobile: ${comp.imagePrefixMobile ? '✅' : '❌'}`);
        console.log(`     Progress: ${comp.showProgress !== false} | Time: ${comp.showTime !== false}`);
        if (stepsCount > 0) {
          comp.steps.forEach((step, stepIndex) => {
            console.log(`     Step ${stepIndex + 1}: "${step.title?.substring(0, 30)}..." | Frames: ${step.startFrame}-${step.endFrame}`);
          });
        }
      });
    }

    // VideoScrollyTelling 
    const videoScrollyComponents = data.paragraphs?.filter(p => 
      ['videoscrollytelling', 'video-scrollytelling', 'videoscrolly', 'video-scrolly'].includes(p.type?.toLowerCase())
    ) || [];
    
    if (videoScrollyComponents.length > 0) {
      console.log(`🎥 VideoScrollyTelling encontrados: ${videoScrollyComponents.length}`);
      videoScrollyComponents.forEach((comp, index) => {
        const stepsCount = comp.steps?.length || 0;
        console.log(`  ${index + 1}. Steps: ${stepsCount} | VideoSrc: ${!!comp.videoSrc || !!comp.src} | Mobile: ${!!comp.videoSrcMobile || !!comp.srcMobile}`);
        if (stepsCount === 0) {
          console.warn(`⚠️ VideoScrollyTelling sem steps: ${comp.text?.substring(0, 50)}...`);
        } else {
          comp.steps.forEach((step, stepIndex) => {
            console.log(`     Step ${stepIndex + 1}: "${step.title?.substring(0, 30)}..." | Time: ${step.time}s`);
          });
        }
      });
    }

    // 🎬 NOVO: Apresentação de Personagens
    const characterComponents = data.paragraphs?.filter(p => 
      ['personagens', 'characters', 'character-presentation', 'apresentacao-personagens'].includes(p.type?.toLowerCase())
    ) || [];
    
    if (characterComponents.length > 0) {
      console.log(`🎭 Apresentação de Personagens encontrados: ${characterComponents.length}`);
      characterComponents.forEach((comp, index) => {
        const charCount = comp.personagens?.length || comp.characters?.length || comp.lista?.length || 0;
        console.log(`  ${index + 1}. Personagens: ${charCount} | ShapeColor: ${comp.shapeColor || '#DC2626'}`);
        if (charCount > 0) {
          const chars = comp.personagens || comp.characters || comp.lista || [];
          chars.forEach((char, charIndex) => {
            console.log(`     Personagem ${charIndex + 1}: "${char.nome || char.name}" | Foto: ${!!char.foto || !!char.photo} | Descrição: ${(char.descricao || char.description || '').substring(0, 50)}...`);
          });
        }
      });
    }

    // 🎯 NOVO: Curiosidades
    const curiosidadesComponents = data.paragraphs?.filter(p => 
      ['curiosidades', 'trivia', 'facts', 'apresentacao-curiosidades'].includes(p.type?.toLowerCase())
    ) || [];
    
    if (curiosidadesComponents.length > 0) {
      console.log(`🎯 Curiosidades encontrados: ${curiosidadesComponents.length}`);
      curiosidadesComponents.forEach((comp, index) => {
        const charCount = comp.personagens?.length || comp.characters?.length || comp.lista?.length || 0;
        console.log(`  ${index + 1}. Curiosidades: ${charCount} | ShapeColor: ${comp.shapeColor || '#b51207'} | QuoteColor: ${comp.quoteColor || '#ffd700'}`);
        if (charCount > 0) {
          const chars = comp.personagens || comp.characters || comp.lista || [];
          chars.forEach((char, charIndex) => {
            const temFrase = !!(char.frase || char.quote || char.phrase);
            console.log(`     Curiosidade ${charIndex + 1}: "${char.nome || char.name}" | Foto: ${!!char.foto || !!char.photo} | Frase: ${temFrase ? '✅' : '❌'} | Descrição: ${(char.descricao || char.description || '').substring(0, 50)}...`);
          });
        }
      });
    }

    // 🆕 NOVO: Itens Recomendados
    const recommendedComponents = data.paragraphs?.filter(p => 
      ['recomendados', 'recommended', 'recommended-items', 'itens-recomendados', 'relacionados', 'conteudos-relacionados'].includes(p.type?.toLowerCase())
    ) || [];

    if (recommendedComponents.length > 0) {
      console.log(`🎯 Itens Recomendados encontrados: ${recommendedComponents.length}`);
      recommendedComponents.forEach((comp, index) => {
        const itemsCount = comp.items?.length || comp.itens?.length || 0;
        const layout = comp.layout || 'grid';
        const columns = comp.columns || comp.colunas || 5;
        const title = comp.title || comp.titulo || 'conteúdos relacionados';
        const backgroundColor = comp.backgroundColor || comp.corFundo || '#000000';
        const titleColor = comp.titleColor || comp.corTitulo || '#ff0000';
        
        console.log(`  ${index + 1}. Items: ${itemsCount} | Layout: ${layout} | Columns: ${columns} | Title: "${title}"`);
        console.log(`     Colors: BG=${backgroundColor} | Title=${titleColor}`);
        
        if (itemsCount === 0) {
          console.warn(`⚠️ Itens Recomendados sem items: ${comp.text?.substring(0, 50)}...`);
        } else {
          const items = comp.items || comp.itens || [];
          items.forEach((item, itemIndex) => {
            const itemTitle = item.title || item.titulo || item.nome || 'Sem título';
            const hasImage = !!(item.image || item.imagem || item.img || item.foto);
            const hasLink = !!(item.link || item.url);
            const category = item.category || item.categoria || '';
            const isNew = item.isNew || item.novo || item.new || false;
            
            console.log(`     Item ${itemIndex + 1}: "${itemTitle.substring(0, 30)}..." | Image: ${hasImage} | Link: ${hasLink} | Category: ${category} | New: ${isNew}`);
          });
        }
      });
    }

    return data;
    
  } catch (error) {
    console.error(`❌ Erro: ${error.message}`);
    process.exit(1);
  }
}

function parseHTMLFormat(html) {
  html = html.replace(/<style[^>]*>.*?<\/style>/gs, '');
  html = html.replace(/<script[^>]*>.*?<\/script>/gs, '');
  html = html.replace(/<head[^>]*>.*?<\/head>/gs, '');

  const data = {};
  let allBlocks = [];

  // 1. Pega todo o conteúdo do body para análise
  let bodyContentMatch = html.match(/<body[^>]*>([\s\S]*?)<\/body>/s); // <<< const -> let
  if (!bodyContentMatch) {
    console.warn("⚠️ Tag <body> não encontrada. Analisando o HTML completo.");
    bodyContentMatch = [null, html];
  }
  let bodyContent = bodyContentMatch[1];

  // 2. Separa os blocos estruturados ([+...]) do conteúdo solto
  const blockRegex = /\[(?:\+)?(paragraphs|intro|credits)\]([\s\S]*?)\[\1\]/gs;
  
  const potentialMetaContent = bodyContent.replace(blockRegex, '').trim();
  const blocks = [...bodyContent.matchAll(blockRegex)];
  
  // 3. Adiciona o conteúdo solto (que deve ser seu header principal) à lista para ser parseado
  if (potentialMetaContent) {
      allBlocks.push(...parseParagraphsHTML(potentialMetaContent));
  }

  // 4. Adiciona o conteúdo dos blocos estruturados na ordem em que aparecem
  blocks.forEach(blockMatch => {
      const blockType = blockMatch[1];
      const blockContent = blockMatch[2];

      if (blockType === 'paragraphs') {
          allBlocks.push(...parseParagraphsHTML(blockContent));
      } else if (blockType === 'intro') {
          const introData = parseIntroHTML(blockContent);
          if (introData.text) {
              allBlocks.push({ type: 'intro', ...introData });
          }
      } else if (blockType === 'credits') {
          data.credits = parseCreditsHTML(blockContent);
      }
  });

  // 5. Encontra o PRIMEIRO 'type: header' na lista de todos os blocos
  const mainHeaderIndex = allBlocks.findIndex(block => block.type && block.type.toLowerCase() === 'header');

  if (mainHeaderIndex !== -1) {
    // 6. Tira ele da lista e usa para os metadados principais (data.title, etc.)
    const [mainHeader] = allBlocks.splice(mainHeaderIndex, 1);
    Object.assign(data, mainHeader);
  } else {
    // Se não achar um header, usa a lógica antiga como fallback para pegar pelo menos o título
    console.warn('⚠️ Nenhum bloco `type: header` encontrado. Usando fallback para metadados.');
    const titleMatch = html.match(/title:\s*([^<\n]+)/i);
    if (titleMatch) data.title = decodeHTMLEntities(titleMatch[1].trim());
  }

  // 7. O que sobrou na lista vira o `paragraphs` do JSON
  data.paragraphs = allBlocks;

  const introIndex = data.paragraphs.findIndex(p => p.type === 'intro');
  if (introIndex !== -1) {
      const [introBlock] = data.paragraphs.splice(introIndex, 1);
      data.intro = { text: introBlock.text };
  }

  return data;
}

function parseIntroHTML(html) {
  const intro = {};
  const introTextMatch = html.match(/text:\s*([\s\S]*?)(?=\[intro\]|$)/);
  if (introTextMatch) {
    intro.text = cleanAndFormatHTML(introTextMatch[1]);
  }
  return intro;
}

function decodeHTMLEntities(text) {
  if (!text) return '';
  const entities = { 
    '&amp;': '&', '&lt;': '<', '&gt;': '>', '&quot;': '"', '&#39;': "'", '&nbsp;': ' ',
    '&lsquo;': "'", '&rsquo;': "'", '&ldquo;': '"', '&rdquo;': '"',
    '&laquo;': '«', '&raquo;': '»', '&sbquo;': '‚', '&bdquo;': '„',
    '&#8216;': "'", '&#8217;': "'", '&#8218;': '‚', '&#8220;': '"', 
    '&#8221;': '"', '&#8222;': '„', '&#8249;': '‹', '&#8250;': '›',
    '&aacute;': 'á', '&agrave;': 'à', '&acirc;': 'â', '&atilde;': 'ã', '&auml;': 'ä', '&aring': 'å',
    '&eacute;': 'é', '&egrave;': 'è', '&ecirc;': 'ê', '&euml;': 'ë',
    '&iacute;': 'í', '&igrave;': 'ì', '&icirc;': 'î', '&iuml;': 'ï',
    '&oacute;': 'ó', '&ograve;': 'ò', '&ocirc;': 'ô', '&otilde;': 'õ', '&ouml;': 'ö',
    '&uacute;': 'ú', '&ugrave;': 'ù', '&ucirc;': 'û', '&uuml;': 'ü',
    '&ccedil;': 'ç', '&ntilde;': 'ñ',
    '&Aacute;': 'Á', '&Agrave;': 'À', '&Acirc;': 'Â', '&Atilde;': 'Ã', '&Auml;': 'Ä',
    '&Eacute;': 'É', '&Egrave;': 'È', '&Ecirc;': 'Ê', '&Euml;': 'Ë',
    '&Iacute;': 'Í', '&Igrave;': 'Ì', '&Icirc;': 'Î', '&Iuml;': 'Ï',
    '&Oacute;': 'Ó', '&Ograve;': 'Ò', '&Ocirc;': 'Ô', '&Otilde;': 'Õ', '&Ouml;': 'Ö',
    '&Uacute;': 'Ú', '&Ugrave;': 'Ù', '&Ucirc;': 'Û', '&Uuml;': 'Ü',
    '&Ccedil;': 'Ç', '&Ntilde;': 'Ñ',
    '&mdash;': '—', '&ndash;': '–', '&hellip;': '…', '&middot;': '·',
    '&bull;': '•', '&dagger;': '†', '&Dagger;': '‡', '&permil;': '‰',
    '&prime;': '′', '&Prime;': '″', '&lsaquo;': '‹', '&rsaquo;': '›',
    '&copy;': '©', '&reg;': '®', '&trade': '™', '&deg;': '°'
  };
  let decoded = text.replace(/&[a-zA-Z0-9#]+;/g, (entity) => entities[entity] || entity);
  decoded = decoded.replace(/&#(\d+);/g, (m, num) => {
    try { return String.fromCharCode(parseInt(num, 10)); } catch { return m; }
  });
  decoded = decoded.replace(/&#x([0-9a-fA-F]+);/g, (m, hex) => {
    try { return String.fromCharCode(parseInt(hex, 16)); } catch { return m; }
  });
  return decoded;
}

function parseJSONField(jsonString, fieldName) {
  if (!jsonString) return null;
  try {
    let cleanJson = jsonString
      .replace(/<[^>]*>/g, '') 
      .replace(/&quot;/g, '"')
      .replace(/&amp;/g, '&')
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&#39;/g, "'")
      .replace(/&nbsp;/g, ' ')
      .replace(/&lsquo;/g, "'")
      .replace(/&rsquo;/g, "'")
      .replace(/&ldquo;/g, '"')
      .replace(/&rdquo;/g, '"')
      .replace(/&#8216;/g, "'")
      .replace(/&#8217;/g, "'")
      .replace(/&#8220;/g, '"')
      .replace(/&#8221;/g, '"')
      .replace(/\n/g, ' ')
      .replace(/\r/g, ' ')
      .replace(/\s+/g, ' ')
      .replace(/\.{2,}/g, '.')
      .replace(/\.\s*\.\s*$/g, '.')
      .replace(/\s+\.\s*$/g, '.')
      .replace(/,\s*\]/g, ']')
      .replace(/,\s*}/g, '}')
      .replace(/["""„‟«»"‶‷"″‟‹›]/g, '"') 
      .replace(/\[/g, '[')
      .replace(/\]/g, ']')
      .replace(/['''‚‛‹›]/g, "'") 
      .replace(/\s*:\s*/g, ': ')
      .replace(/,(?!\s)/g, ', ')
      .replace(/https:\s+\/\//g, 'https://')
      .replace(/http:\s+\/\//g, 'http://')
      .replace(/:\s+\/\//g, '://')
      .trim();
    
    let parsed = JSON.parse(cleanJson);
    
    if (Array.isArray(parsed)) {
      parsed = parsed.map(item => {
        if (typeof item === 'object' && item !== null) {
          Object.keys(item).forEach(key => {
            if (typeof item[key] === 'string') {
              item[key] = decodeHTMLEntities(item[key]);
              if (['text', 'caption', 'content', 'title', 'nome', 'name', 'descricao', 'description'].includes(key)) {
                item[key] = cleanAndFormatHTML(item[key]);
              }
            }
          });
        }
        return item;
      });
    }
    
    console.log(`✅ JSON parseado com sucesso para ${fieldName}: ${Array.isArray(parsed) ? parsed.length : 1} item(s)`);
    return parsed;
    
  } catch (error) {
    console.warn(`⚠️ Erro ao parsear ${fieldName}:`, error.message);
    console.log('JSON problemático:', jsonString.substring(0, 200));
    
    try {
      let fallbackJson = jsonString
        .replace(/[^\[\]{}":,\w\s\-\.\/\?=&]/g, ' ')
        .replace(/\s+/g, ' ')
        .trim();
      
      let fallbackParsed = JSON.parse(fallbackJson);
      console.log(`🔄 Fallback parse funcionou para ${fieldName}`);
      return fallbackParsed;
      
    } catch (fallbackError) {
      console.error(`❌ Fallback também falhou para ${fieldName}:`, fallbackError.message);
      return [];
    }
  }
}

function parseParagraphsHTML(html) {
  const paragraphs = [];
  let currentSection = null;
  let sectionChildren = [];
  
  // Detectar blocos de section com sintaxe [+section]...[section]
  const sectionBlockRegex = /\[\+section\]([\s\S]*?)\[section\]/gs;
  const sectionBlocks = [...html.matchAll(sectionBlockRegex)];
  
  if (sectionBlocks.length > 0) {
    console.log(`📦 ${sectionBlocks.length} section(s) com sintaxe de bloco detectada(s)`);
    
    let processedHtml = html;
    
    for (const [fullMatch, sectionContent] of sectionBlocks) {
      const sectionData = parseSectionBlock(sectionContent);
      paragraphs.push(sectionData);
      processedHtml = processedHtml.replace(fullMatch, '');
    }
    
    if (processedHtml.trim()) {
      const remainingParagraphs = parseRegularParagraphs(processedHtml);
      paragraphs.push(...remainingParagraphs);
    }
    
    return paragraphs;
  }
  
  // Sintaxe antiga - processar normalmente mas detectar sections inline
  const typeBlocks = html.split(/(?=type:\s*)/);
  
  for (const block of typeBlocks) {
    if (!block.trim() || !block.includes('type:')) continue;
    
    const paragraph = {};
    
    const typeMatch = block.match(/type:\s*([^\n<]+)/);
    if (typeMatch) {
      paragraph.type = decodeHTMLEntities(typeMatch[1].trim());
    }
    
    if (['section', 'secao', 'container'].includes(paragraph.type?.toLowerCase())) {
      if (currentSection) {
        currentSection.children = sectionChildren;
        paragraphs.push(currentSection);
        sectionChildren = [];
      }
      currentSection = processSectionInline(block);
      continue;
    }
    
    if (['section-end', 'secao-end', '/section', 'end-section'].includes(paragraph.type?.toLowerCase())) {
      if (currentSection) {
        currentSection.children = sectionChildren;
        paragraphs.push(currentSection);
        currentSection = null;
        sectionChildren = [];
      }
      continue;
    }
    
    const processedParagraph = processRegularComponent(block);
    if (processedParagraph.type) {
      if (currentSection) {
        sectionChildren.push(processedParagraph);
      } else {
        paragraphs.push(processedParagraph);
      }
    }
  }
  
  if (currentSection) {
    currentSection.children = sectionChildren;
    paragraphs.push(currentSection);
  }
  
  return paragraphs;
}

function parseSectionBlock(sectionContent) {
  console.log('📦 Processando section com bloco...');
  
  const section = {
    type: 'section',
    children: []
  };
  
  const lines = sectionContent.split('\n');
  let sectionProps = '';
  let childrenContent = '';
  let foundFirstType = false;
  
  for (const line of lines) {
    if (line.trim().startsWith('type:') && !foundFirstType) {
      foundFirstType = true;
      childrenContent += line + '\n';
    } else if (foundFirstType) {
      childrenContent += line + '\n';
    } else {
      sectionProps += line + '\n';
    }
  }
  
  const sectionFields = {
    backgroundColor: /backgroundColor:\s*([^\n<]+)/i,
    background: /background:\s*([^\n<]+)/i,
    backgroundImage: /backgroundImage:\s*([^\n<]+)/i,
    backgroundVideo: /backgroundVideo:\s*([^\n<]+)/i,
    overlay: /overlay:\s*([^\n<]+)/i,
    overlayOpacity: /overlayOpacity:\s*([^\n<]+)/i,
    padding: /padding:\s*([^\n<]+)/i,
    margin: /margin:\s*([^\n<]+)/i,
    textColor: /textColor:\s*([^\n<]+)/i,
    color: /color:\s*([^\n<]+)/i,
    textAlign: /textAlign:\s*([^\n<]+)/i,
    align: /align:\s*([^\n<]+)/i,
    minHeight: /minHeight:\s*([^\n<]+)/i,
    height: /height:\s*([^\n<]+)/i,
    maxWidth: /maxWidth:\s*([^\n<]+)/i,
    display: /display:\s*([^\n<]+)/i,
    justifyContent: /justifyContent:\s*([^\n<]+)/i,
    alignItems: /alignItems:\s*([^\n<]+)/i,
    flexDirection: /flexDirection:\s*([^\n<]+)/i,
    id: /id:\s*([^\n<]+)/i,
    className: /className:\s*([^\n<]+)/i,
    as: /as:\s*([^\n<]+)/i
  };
  
  for (const [field, regex] of Object.entries(sectionFields)) {
    const match = sectionProps.match(regex);
    if (match) {
      section[field] = decodeHTMLEntities(match[1].trim());
    }
  }
  
  if (childrenContent.trim()) {
    section.children = parseRegularParagraphs(childrenContent);
  }
  
  console.log(`   ✅ Section processada com ${section.children.length} filho(s)`);
  return section;
}

function processSectionInline(block) {
  console.log('📦 Processando section inline...');
  
  const section = {
    type: 'section',
    children: []
  };
  
  const sectionFields = {
    backgroundColor: /backgroundColor:\s*([^\n<]+)/i,
    background: /background:\s*([^\n<]+)/i,
    backgroundImage: /backgroundImage:\s*([^\n<]+)/i,
    backgroundVideo: /backgroundVideo:\s*([^\n<]+)/i,
    overlay: /overlay:\s*([^\n<]+)/i,
    overlayOpacity: /overlayOpacity:\s*([^\n<]+)/i,
    padding: /padding:\s*([^\n<]+)/i,
    margin: /margin:\s*([^\n<]+)/i,
    textColor: /textColor:\s*([^\n<]+)/i,
    color: /color:\s*([^\n<]+)/i,
    textAlign: /textAlign:\s*([^\n<]+)/i,
    align: /align:\s*([^\n<]+)/i,
    minHeight: /minHeight:\s*([^\n<]+)/i,
    height: /height:\s*([^\n<]+)/i,
    maxWidth: /maxWidth:\s*([^\n<]+)/i,
    display: /display:\s*([^\n<]+)/i,
    justifyContent: /justifyContent:\s*([^\n<]+)/i,
    alignItems: /alignItems:\s*([^\n<]+)/i,
    flexDirection: /flexDirection:\s*([^\n<]+)/i,
    id: /id:\s*([^\n<]+)/i,
    className: /className:\s*([^\n<]+)/i,
    as: /as:\s*([^\n<]+)/i
  };
  
  for (const [field, regex] of Object.entries(sectionFields)) {
    const match = block.match(regex);
    if (match) {
      section[field] = decodeHTMLEntities(match[1].trim());
    }
  }
  
  return section;
}

function parseRegularParagraphs(html) {
  const paragraphs = [];
  const typeBlocks = html.split(/(?=type:\s*)/);
  
  for (const block of typeBlocks) {
    if (!block.trim() || !block.includes('type:')) continue;
    
    const processed = processRegularComponent(block);
    if (processed.type) {
      paragraphs.push(processed);
    }
  }
  
  return paragraphs;
}

// ✅ CORRIGIDO: SEM 'continue;' e SEM 'paragraphs.push(...)' aqui dentro.
// A função só retorna o objeto do parágrafo.
function processRegularComponent(block) {
  const paragraph = {};
  
  const typeMatch = block.match(/type:\s*([^\n<]+)/);
  if (typeMatch) {
    paragraph.type = decodeHTMLEntities(typeMatch[1].trim());
  }

  // 🎬 Personagens
  if (['personagens', 'characters', 'character-presentation', 'apresentacao-personagens'].includes(paragraph.type?.toLowerCase())) {
    console.log('🎭 Processando Apresentação de Personagens...');
    const characterFields = {
      personagens: /personagens:\s*(\[[\s\S]*?\])/i,
      characters: /characters:\s*(\[[\s\S]*?\])/i,
      lista: /lista:\s*(\[[\s\S]*?\])/i,
      shapeColor: /shapeColor:\s*([^\n<]+)/i,
      nameColor: /nameColor:\s*([^\n<]+)/i,
      textColor: /textColor:\s*([^\n<]+)/i,
      backgroundColor: /backgroundColor:\s*([^\n<]+)/i,
      animationSpeed: /animationSpeed:\s*([^\n<]+)/i,
      sectionHeight: /sectionHeight:\s*([^\n<]+)/i,
      sectionHeightMobile: /sectionHeightMobile:\s*([^\n<]+)/i
    };
    for (const field of ['personagens', 'characters', 'lista']) {
      const regex = characterFields[field];
      const match = block.match(regex);
      if (match) {
        paragraph[field] = parseJSONField(match[1], `character ${field}`);
        console.log(`   ✅ ${paragraph[field]?.length || 0} personagens processados em ${field}`);
        break;
      }
    }
    for (const [field, regex] of Object.entries(characterFields)) {
      if (['personagens', 'characters', 'lista'].includes(field)) continue;
      const match = block.match(regex);
      if (match) paragraph[field] = decodeHTMLEntities(match[1].trim());
    }
    const textMatch = block.match(/text:\s*(.*?)(?=\s*(?:personagens|characters|lista|shapeColor|nameColor|textColor|backgroundColor|animationSpeed|sectionHeight|sectionHeightMobile):|type:|$)/si);
    if (textMatch) paragraph.text = cleanAndFormatHTML(textMatch[1].trim());
    return paragraph;
  }

  // 🎯 Curiosidades
  if (['curiosidades', 'trivia', 'facts', 'apresentacao-curiosidades'].includes(paragraph.type?.toLowerCase())) {
    console.log('🎯 Processando Curiosidades...');
    const curiosidadesFields = {
      personagens: /personagens:\s*(\[[\s\S]*?\])/i,
      characters: /characters:\s*(\[[\s\S]*?\])/i,
      lista: /lista:\s*(\[[\s\S]*?\])/i,
      shapeColor: /shapeColor:\s*([^\n<]+)/i,
      nameColor: /nameColor:\s*([^\n<]+)/i,
      textColor: /textColor:\s*([^\n<]+)/i,
      backgroundColor: /backgroundColor:\s*([^\n<]+)/i,
      quoteColor: /quoteColor:\s*([^\n<]+)/i
    };
    for (const field of ['personagens', 'characters', 'lista']) {
      const regex = curiosidadesFields[field];
      const match = block.match(regex);
      if (match) {
        paragraph[field] = parseJSONField(match[1], `curiosidades ${field}`);
        console.log(`   ✅ ${paragraph[field]?.length || 0} curiosidades processadas em ${field}`);
        break;
      }
    }
    for (const [field, regex] of Object.entries(curiosidadesFields)) {
      if (['personagens', 'characters', 'lista'].includes(field)) continue;
      const match = block.match(regex);
      if (match) paragraph[field] = decodeHTMLEntities(match[1].trim());
    }
    const textMatch = block.match(/text:\s*(.*?)(?=\s*(?:personagens|characters|lista|shapeColor|nameColor|textColor|backgroundColor|quoteColor):|type:|$)/si);
    if (textMatch) paragraph.text = cleanAndFormatHTML(textMatch[1].trim());
    return paragraph;
  }

  // 🧩 Itens Recomendados
  if (['recomendados', 'recommended', 'recommended-items', 'itens-recomendados', 'relacionados', 'conteudos-relacionados'].includes(paragraph.type?.toLowerCase())) {
    console.log('🎯 Processando Itens Recomendados...');
    const recommendedFields = {
      items: /items:\s*(\[[\s\S]*?\])/i,
      itens: /itens:\s*(\[[\s\S]*?\])/i,
      title: /title:\s*([^\n<]+)/i,
      titulo: /titulo:\s*([^\n<]+)/i,
      layout: /layout:\s*([^\n<]+)/i,
      columns: /columns:\s*([^\n<]+)/i,
      colunas: /colunas:\s*([^\n<]+)/i,
      showTitle: /showTitle:\s*([^\n<]+)/i,
      mostrarTitulo: /mostrarTitulo:\s*([^\n<]+)/i,
      backgroundColor: /backgroundColor:\s*([^\n<]+)/i,
      corFundo: /corFundo:\s*([^\n<]+)/i,
      titleColor: /titleColor:\s*([^\n<]+)/i,
      corTitulo: /corTitulo:\s*([^\n<]+)/i,
      textColor: /textColor:\s*([^\n<]+)/i,
      corTexto: /corTexto:\s*([^\n<]+)/i
    };
    for (const field of ['items', 'itens']) {
      const regex = recommendedFields[field];
      const match = block.match(regex);
      if (match) {
        paragraph[field] = parseJSONField(match[1], `recommended ${field}`);
        console.log(`   ✅ ${paragraph[field]?.length || 0} itens processados em ${field}`);
        break;
      }
    }
    for (const [field, regex] of Object.entries(recommendedFields)) {
      if (['items', 'itens'].includes(field)) continue;
      const match = block.match(regex);
      if (match) paragraph[field] = decodeHTMLEntities(match[1].trim());
    }
    const textMatch = block.match(/text:\s*(.*?)(?=\s*(?:items|itens|title|titulo|layout|columns|colunas|showTitle|mostrarTitulo|backgroundColor|corFundo|titleColor|corTitulo|textColor|corTexto):|type:|$)/si);
    if (textMatch) paragraph.text = cleanAndFormatHTML(textMatch[1].trim());
    return paragraph;
  }

  // 🎞️ ScrollyFrames
  if (paragraph.type?.toLowerCase() === 'scrollyframes') {
    console.log('🎬 Processando ScrollyFrames...');
    const scrollyFramesFields = {
      frameStart: /frameStart:\s*([^\n<]+)/i,
      frameStop: /frameStop:\s*([^\n<]+)/i,
      imagePrefix: /imagePrefix:\s*([^\n<]+)/i,
      imageSuffix: /imageSuffix:\s*([^\n<]+)/i,
      imagePrefixMobile: /imagePrefixMobile:\s*([^\n<]+)/i,
      imageSuffixMobile: /imageSuffixMobile:\s*([^\n<]+)/i,
      height: /height:\s*([^\n<]+)/i,
      showProgress: /showProgress:\s*([^\n<]+)/i,
      showTime: /showTime:\s*([^\n<]+)/i,
      preloadFrames: /preloadFrames:\s*([^\n<]+)/i,
      memoryLimit: /memoryLimit:\s*([^\n<]+)/i,
      animationSpeed: /animationSpeed:\s*([^\n<]+)/i,
      smoothing: /smoothing:\s*([^\n<]+)/i,
      debug: /debug:\s*([^\n<]+)/i,
      fullWidth: /fullWidth:\s*([^\n<]+)/i
    };
    for (const [field, regex] of Object.entries(scrollyFramesFields)) {
      const match = block.match(regex);
      if (match) {
        let value = decodeHTMLEntities(match[1].trim());
        if (['frameStart', 'frameStop', 'preloadFrames', 'memoryLimit'].includes(field)) {
          paragraph[field] = parseInt(value) || (field === 'frameStart' ? 1 : field === 'preloadFrames' ? 8 : field === 'memoryLimit' ? 30 : 100);
        } else if (field === 'animationSpeed') {
          paragraph[field] = parseFloat(value) || 0.1;
        } else if (['showProgress', 'showTime', 'smoothing', 'fullWidth'].includes(field)) {
          paragraph[field] = value.toLowerCase() !== 'false';
        } else if (field === 'debug') {
          paragraph[field] = value.toLowerCase() === 'true';
        } else {
          paragraph[field] = value;
        }
      }
    }
    const stepsMatch = block.match(/steps:\s*(\[[\s\S]*?\])/i);
    if (stepsMatch) {
      paragraph.steps = parseJSONField(stepsMatch[1], 'scrollyframes steps');
      console.log(`   ✅ ${paragraph.steps?.length || 0} steps processados`);
    }
    const textMatch = block.match(/text:\s*(.*?)(?=\s*(?:frameStart|frameStop|imagePrefix|imageSuffix|imagePrefixMobile|imageSuffixMobile|height|showProgress|showTime|preloadFrames|memoryLimit|animationSpeed|smoothing|debug|fullWidth|steps):|type:|$)/si);
    if (textMatch) paragraph.text = cleanAndFormatHTML(textMatch[1].trim());
    return paragraph;
  }

  // Flourish / especiais
  if (['flourish', 'flourish-scrolly', 'grafico', 'mapa'].includes(paragraph.type)) {
    const srcMatch = block.match(/src:\s*([^\n<]+)/);
    if (srcMatch) paragraph.src = srcMatch[1].trim();
    const stepsMatch = block.match(/steps:\s*(\[[\s\S]*?\])/);
    if (stepsMatch) paragraph.steps = parseJSONField(stepsMatch[1], 'flourish steps');
    return paragraph;
  }

  // Section “genérica” como componente (fora dos modos especiais)
  if (['section', 'secao', 'container', 'wrapper', 'div'].includes(paragraph.type?.toLowerCase())) {
    console.log('🎨 Processando Section...');
    const sectionFields = {
      backgroundColor: /backgroundColor:\s*([^\n<]+)/i,
      background: /background:\s*([^\n<]+)/i,
      bg: /bg:\s*([^\n<]+)/i,
      backgroundImage: /backgroundImage:\s*([^\n<]+)/i,
      backgroundVideo: /backgroundVideo:\s*([^\n<]+)/i,
      padding: /padding:\s*([^\n<]+)/i,
      margin: /margin:\s*([^\n<]+)/i,
      textColor: /textColor:\s*([^\n<]+)/i,
      color: /color:\s*([^\n<]+)/i,
      textAlign: /textAlign:\s*([^\n<]+)/i,
      align: /align:\s*([^\n<]+)/i,
      minHeight: /minHeight:\s*([^\n<]+)/i,
      height: /height:\s*([^\n<]+)/i,
      display: /display:\s*([^\n<]+)/i,
      justifyContent: /justifyContent:\s*([^\n<]+)/i,
      alignItems: /alignItems:\s*([^\n<]+)/i,
      overlay: /overlay:\s*([^\n<]+)/i,
      content: /content:\s*(.*?)(?=\s*(?:backgroundColor|background|bg|backgroundImage|backgroundVideo|padding|margin|textColor|color|textAlign|align|minHeight|height|display|justifyContent|alignItems|overlay):|type:|$)/si
    };
    for (const [field, regex] of Object.entries(sectionFields)) {
      const match = block.match(regex);
      if (match) paragraph[field] = decodeHTMLEntities(match[1].trim());
    }
    if (!paragraph.content) {
      const textMatch = block.match(/text:\s*(.*?)(?=\s*(?:backgroundColor|background|bg|backgroundImage|backgroundVideo|padding|margin|textColor|color|textAlign|align|minHeight|height|display|justifyContent|alignItems|overlay):|type:|$)/si);
      if (textMatch) paragraph.text = cleanAndFormatHTML(textMatch[1].trim());
    }
    return paragraph;
  }

  // Texto e campos gerais
  const textMatch = block.match(/text:\s*(.*?)(?=\s*(?:backgroundImage|backgroundImageMobile|backgroundVideo|backgroundVideoMobile|backgroundPosition|backgroundPositionMobile|author|role|src|videoSrc|videoSrcMobile|caption|credit|alt|fullWidth|variant|size|orientation|autoplay|controls|poster|images|items|steps|beforeImage|afterImage|beforeLabel|afterLabel|image|height|heightMobile|speed|content|overlay|layout|columns|interval|showDots|showArrows|stickyHeight|videoId|videosIDs|id|skipDFP|skipdfp|autoPlay|startMuted|maxQuality|quality|chromeless|isLive|live|allowRestrictedContent|preventBlackBars|globoId|token|adAccountId|adCmsId|siteName|width|textPosition|textPositionMobile|textAlign|textAlignMobile|title|subtitle|date|theme|videoAspectRatio|showProgress|showTime|showControls):|type:|$)/si);
  if (textMatch) {
    let rawText = textMatch[1].trim();
    rawText = rawText.replace(/\.\s*\.\s*$/, '.');
    rawText = rawText.replace(/\s+\.\s*$/, '.');
    paragraph.text = cleanAndFormatHTML(rawText);
  }

  const jsonFields = ['images', 'items', 'steps'];
  for (const field of jsonFields) {
    const regex = new RegExp(`${field}:\\s*(\\[[\\s\\S]*?\\])`, 'i');
    const match = block.match(regex);
    if (match) paragraph[field] = parseJSONField(match[1], field);
  }

  const fieldMappings = {
    title: 'title', subtitle: 'subtitle', date: 'date', theme: 'theme',
    backgroundImage: 'backgroundImage', backgroundImageMobile: 'backgroundImageMobile', backgroundVideo: 'backgroundVideo',
    backgroundVideoMobile: 'backgroundVideoMobile', backgroundPosition: 'backgroundPosition', backgroundPositionMobile: 'backgroundPositionMobile',
    textPosition: 'textPosition', textPositionMobile: 'textPositionMobile', textAlign: 'textAlign', textAlignMobile: 'textAlignMobile',
    author: 'author', role: 'role', src: 'src', videoSrc: 'videoSrc', videoSrcMobile: 'videoSrcMobile', srcMobile: 'srcMobile', caption: 'caption', credit: 'credit', alt: 'alt', fullWidth: 'fullWidth', variant: 'variant',
    size: 'size', orientation: 'orientation', autoplay: 'autoplay', controls: 'controls', poster: 'poster', overlay: 'overlay',
    layout: 'layout', columns: 'columns', interval: 'interval', showDots: 'showDots', showArrows: 'showArrows',
    stickyHeight: 'stickyHeight', beforeImage: 'beforeImage', afterImage: 'afterImage', beforeLabel: 'beforeLabel',
    afterLabel: 'afterLabel', image: 'image', speed: 'speed', content: 'content', videoId: 'videoId', videosIDs: 'videosIDs', id: 'id',
    skipDFP: 'skipDFP', skipdfp: 'skipdfp', autoPlay: 'autoPlay', startMuted: 'startMuted', maxQuality: 'maxQuality', quality: 'quality',
    chromeless: 'chromeless', isLive: 'isLive', live: 'live', allowRestrictedContent: 'allowRestrictedContent',
    preventBlackBars: 'preventBlackBars', globoId: 'globoId', token: 'token', adAccountId: 'adAccountId', adCmsId: 'adCmsId',
    siteName: 'siteName', width: 'width', height: 'height', heightMobile: 'heightMobile', showCaption: 'showCaption',
    alignment: 'alignment', loop: 'loop', videoAspectRatio: 'videoAspectRatio', aspectRatio: 'aspectRatio', showProgress: 'showProgress', showTime: 'showTime', showControls: 'showControls'
  };
    
  for (const [field, prop] of Object.entries(fieldMappings)) {
    const regex = new RegExp(`\\b${field}:\\s*([^\\n<]*)`, 'i');
    const match = block.match(regex);
    if (match) {
      const cleanedValue = (match[1] || '')
        .replace(/&nbsp;/g, ' ')
        .replace(/<[^>]*>/g, '')
        .trim();
      paragraph[prop] = decodeHTMLEntities(cleanedValue);
    }
  }

  return paragraph;
}

function parseCreditsHTML(html) {
  const credits = {};

  const notesMatch = html.match(/notes:\s*([\s\S]*?)(?=sources:|additionalGraphics:|editedBy:|authors:|$)/s);
  if (notesMatch) {
    credits.notes = cleanAndFormatHTML(notesMatch[1].trim());
  }

  const arrayFields = ['sources', 'additionalGraphics', 'editedBy', 'authors'];
  for (const field of arrayFields) {
    const regex = new RegExp(`${field}:\\s*([\\s\\S]*?)(?=(?:notes:|sources:|additionalGraphics:|editedBy:|authors:|\\[credits\\])|$)`, 'i');
    const match = html.match(regex);

    if (match && match[1]) {
      let rawContent = match[1];
      rawContent = rawContent.replace(/<\/?ul[^>]*>/g, '');
      rawContent = rawContent.replace(/<\/?li[^>]*>/g, '');
      rawContent = rawContent.replace(/&nbsp;/g, ' ');
      
      credits[field] = rawContent.split('- ').map(item => {
        return cleanAndFormatHTML(item.trim());
      }).filter(Boolean);
    }
  }
  return credits;
}

function cleanAndFormatHTML(html) {
  if (!html) return '';
  let cleanedHtml = decodeHTMLEntities(html);
  cleanedHtml = cleanedHtml.replace(/`/g, "'");
  cleanedHtml = cleanedHtml.replace(/<([^>]+)style="[^"]*font-weight:\s*(?:bold|[7-9]\d\d|700|800|900)[^"]*"[^>]*>(.*?)<\/\1>/gi, '<strong>$2</strong>');
  cleanedHtml = cleanedHtml.replace(/<([^>]+)style="[^"]*font-style:\s*italic[^"]*"[^>]*>(.*?)<\/\1>/gi, '<em>$2</em>');
  cleanedHtml = cleanedHtml.replace(/<([^>]+)style="[^"]*text-decoration[^"]*underline[^"]*"[^>]*>(.*?)<\/\1>/gi, '<u>$2</u>');
  cleanedHtml = cleanedHtml.replace(/<a\s+href="([^"]*)"[^>]*>(.*?)<\/a>/gi, '<a href="$1">$2</a>');
  const listRegex = /((?:[•*-]\s.*)(?:<br\s*\/?>\s*[•*-]\s.*)*)/g;
  cleanedHtml = cleanedHtml.replace(listRegex, (listBlock) => {
    const items = listBlock.split(/<br\s*\/?>/gi)
      .map(item => item.trim())
      .filter(item => item.length > 0)
      .map(item => `<li>${item.replace(/^[•*-]\s/, '').trim()}</li>`)
      .join('');
    return items ? `<ul>${items}</ul>` : '';
  });
  cleanedHtml = cleanedHtml.replace(/<\/?(span|p|div)[^>]*>/gi, '');
  cleanedHtml = cleanedHtml
    .replace(/\.{2,}/g, '.')
    .replace(/,(?!\s)/g, ', ')
    .replace(/\s+\./g, '.')
    .replace(/\s+,/g, ',')
    .replace(/\s{2,}/g, ' ');
  cleanedHtml = cleanedHtml
    .replace(/\.\s*\.\s*$/g, '.')
    .replace(/\.\s*\.\s*/g, '. ')
    .replace(/\s+\.\s*$/g, '.')
    .replace(/\.+$/g, '.');
  return cleanedHtml.trim();
}

const args = process.argv.slice(2);
if (args.length === 0) {
  console.log('❌ Use: npm run fetch DOC_ID');
  process.exit(1);
}

fetchGoogleDoc(args[0]);
