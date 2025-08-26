<!-- StoryRenderer.svelte - COMPLETO com ScrollyFrames, CharacterPresentation, Curiosidades e RecommendedItems -->
<script>
	// Importação dos componentes da história
		import Section from '../Section.svelte'; // ← NOVO: Componente Section

	import Header from './story/Header.svelte';
	import StoryText from './story/StoryText.svelte';
	import SectionTitle from './story/SectionTitle.svelte';
	import SectionWrapper from './story/SectionWrapper.svelte';
	import PhotoWithCaption from './story/PhotoWithCaption.svelte';
	import VideoPlayer from './story/VideoPlayer.svelte';
	import GloboPlayer from './story/GloboPlayer.svelte';
	import PhotoGallery from './story/PhotoGallery.svelte';
	import Carousel from './story/Carousel.svelte';
	import Parallax from './story/Parallax.svelte';
	import BeforeAfter from './story/BeforeAfter.svelte';
	import ScrollyTelling from './story/ScrollyTelling.svelte';
	// ✅ MUDANÇA: ScrollyFrames ao invés de VideoScrollytelling
	import ScrollyFrames from './story/ScrollyFrames.svelte';
	import FlourishEmbed from './story/FlourishEmbed.svelte';
	import FlourishScrolly from './story/FlourishScrolly.svelte';
	import FinalCredits from './FinalCredits.svelte';
	import AnchorPoint from './story/AnchorPoint.svelte';
	// 🎬 COMPONENTES DE APRESENTAÇÃO
	import CharacterPresentation from './story/CharacterPresentation.svelte';
	import Curiosidades from './story/Curiosidades.svelte';
	// 🆕 NOVO: Itens Recomendados
	import RecommendedItems from './story/RecommendedItems.svelte';

	export let storyData = {};

	/**
	 * Mapeia os tipos de parágrafo para os nomes dos componentes.
	 */
	function getComponentType(paragraph) {
		const type = paragraph.type?.toLowerCase();
		
		switch (type) {
			// NOVO: Section
			case 'section':
			case 'secao':
			case 'container':
				return 'section-container';


			// Componentes existentes
			case 'header':
			case 'titulo-principal':
				return 'header';
			case 'texto':
			case 'paragrafo':
				return 'text';
			case 'intertitulo':
			case 'titulo':
				return 'section-title';
			case 'frase':
			case 'citacao':
			case 'quote':
				return 'quote';
			case 'foto':
			case 'imagem':
				return 'photo';
			case 'video':
			case 'mp4':
				return 'video';
			case 'globovideo':
			case 'globo-video':
			case 'globoplayer':
			case 'globo-player':
			case 'globo':
				return 'globo-player';
			case 'galeria':
			case 'gallery':
				return 'gallery';
			case 'carousel':
			case 'carrossel':
				return 'carousel';
			case 'parallax':
				return 'parallax';
			case 'beforeafter':
			case 'before-after':
			case 'antes-depois':
				return 'before-after';
			case 'scrollytelling':
			case 'scrolly-telling':
			case 'scrolly':
				return 'scrolly-telling';
			case 'videoscrollytelling':
			case 'video-scrollytelling':
			case 'scrollyframes':
			case 'scrolly-frames':
				return 'scrolly-frames';
			case 'flourish':
			case 'flourish-embed':
				return 'flourish';
			case 'flourish-scrolly':
				return 'flourish-scrolly';
			case 'character':
			case 'personagem':
			case 'character-presentation':
				return 'character';
			case 'curiosidades':
			case 'curiosity':
				return 'curiosidades';
			case 'recommended':
			case 'recomendados':
			case 'recommended-items':
				return 'recommended';
			case 'anchor':
			case 'ancora':
			case 'anchor-point':
				return 'anchor';
			default:
				return 'text';
		}
	}


		function renderChild(child, index) {
		const childType = getComponentType(child);
		const props = getComponentProps(child);
		
		return { type: childType, props, data: child };
	}

	/**
	 * Extrai as props específicas de cada tipo de componente.
	 */
	function getComponentProps(paragraph) {
		const props = { ...paragraph };
		delete props.type;
		return props;
	}
	/**
	 * Converte string para boolean
	 */
	function stringToBoolean(value, defaultValue = false) {
		if (typeof value === 'boolean') return value;
		if (typeof value === 'string') {
			return value.toLowerCase() === 'true' || value === '1';
		}
		return defaultValue;
	}

	/**
	 * Processa lista de personagens/curiosidades para padronizar formato
	 */
	function processCharacters(characters) {
		if (!characters) return [];
		
		// Se for string JSON, faz parse
		if (typeof characters === 'string') {
			try {
				characters = JSON.parse(characters);
			} catch (e) {
				console.error('Erro ao fazer parse dos personagens:', e);
				return [];
			}
		}

		// Se for array, retorna processado
		if (Array.isArray(characters)) {
			return characters.map(char => ({
				nome: char.nome || char.name || '',
				sobrenome: char.sobrenome || char.surname || '',
				foto: char.foto || char.photo || char.image || '',
				fotoMobile: char.fotoMobile || char.photoMobile || char.foto_mobile || char.photo_mobile || '',
				descricao: char.descricao || char.description || char.texto || '',
				frase: char.frase || char.quote || char.phrase || '', // ✅ CAMPO EXISTENTE
				autor: char.autor || char.author || '', // ✅ NOVO CAMPO
				profissao: char.profissao || char.profession || '' // ✅ NOVO CAMPO
			}));
		}

		return [];
	}

	/**
	 * 🆕 Processa lista de itens recomendados para padronizar formato
	 */
	function processRecommendedItems(items) {
		if (!items) return [];
		
		// Se for string JSON, faz parse
		if (typeof items === 'string') {
			try {
				items = JSON.parse(items);
			} catch (e) {
				console.error('Erro ao fazer parse dos itens recomendados:', e);
				return [];
			}
		}

		// Se for array, retorna processado
		if (Array.isArray(items)) {
			return items.map(item => ({
				title: item.title || item.titulo || item.nome || '',
				subtitle: item.subtitle || item.subtitulo || '',
				description: item.description || item.descricao || '',
				image: item.image || item.imagem || item.img || item.foto || '',
				link: item.link || item.url || '',
				category: item.category || item.categoria || '',
				year: item.year || item.ano || '',
				rating: item.rating || item.avaliacao || item.nota || '',
				genre: item.genre || item.genero || '',
				duration: item.duration || item.duracao || '',
				badge: item.badge || item.selo || '',
				isNew: item.isNew || item.novo || item.new || false
			}));
		}

		return [];
	}
</script>

<article class="story-content">
	<!-- Renderizar intro se existir -->
	{#if storyData.intro}
		<div class="section-content">
			<StoryText content={storyData.intro.text} variant="lead" />
		</div>
	{/if}

	<!-- Renderizar parágrafos -->
	{#if storyData.paragraphs}
		{#each storyData.paragraphs as paragraph, index}
			{@const componentType = getComponentType(paragraph)}
			{@const props = getComponentProps(paragraph)}

			<!-- NOVO: Section Container -->
			{#if componentType === 'section-container'}
				<Section
					id={props.id || `section-${index}`}
					backgroundColor={props.backgroundColor || props.background || ''}
					backgroundImage={props.backgroundImage || ''}
					backgroundVideo={props.backgroundVideo || ''}
					backgroundSize={props.backgroundSize || 'cover'}
					backgroundPosition={props.backgroundPosition || 'center'}
					overlay={props.overlay || ''}
					overlayOpacity={props.overlayOpacity || '0.5'}
					padding={props.padding || ''}
					paddingTop={props.paddingTop || ''}
					paddingBottom={props.paddingBottom || ''}
					paddingLeft={props.paddingLeft || ''}
					paddingRight={props.paddingRight || ''}
					margin={props.margin || ''}
					marginTop={props.marginTop || ''}
					marginBottom={props.marginBottom || ''}
					marginLeft={props.marginLeft || ''}
					marginRight={props.marginRight || ''}
					textColor={props.textColor || props.color || ''}
					textAlign={props.textAlign || props.align || ''}
					fontSize={props.fontSize || ''}
					fontWeight={props.fontWeight || ''}
					minHeight={props.minHeight || 'auto'}
					height={props.height || 'auto'}
					maxWidth={props.maxWidth || ''}
					width={props.width || ''}
					display={props.display || ''}
					justifyContent={props.justifyContent || ''}
					alignItems={props.alignItems || ''}
					flexDirection={props.flexDirection || ''}
					className={props.className || ''}
					as={props.as || 'section'}
				>
					<!-- Renderizar componentes filhos -->
					{#if paragraph.children && paragraph.children.length > 0}
						{#each paragraph.children as child, childIndex}
							{@const childComponent = renderChild(child, childIndex)}
							
							<!-- Renderizar cada tipo de componente filho -->
							{#if childComponent.type === 'text'}
								<div class="section-child">
									<StoryText 
										content={childComponent.props.text} 
										variant={childComponent.props.variant || 'body'} 
										align={childComponent.props.align}
										size={childComponent.props.size}
										color={childComponent.props.color}
									/>
								</div>

							{:else if childComponent.type === 'photo'}
								<div class="section-child">
									<PhotoWithCaption
										src={childComponent.props.src}
										alt={childComponent.props.alt}
										caption={childComponent.props.caption}
										credit={childComponent.props.credit}
										fullWidth={stringToBoolean(childComponent.props.fullWidth, true)}
									/>
								</div>

							{:else if childComponent.type === 'video'}
								<div class="section-child">
									<VideoPlayer
										src={childComponent.props.src}
										caption={childComponent.props.caption}
										credit={childComponent.props.credit}
										autoplay={stringToBoolean(childComponent.props.autoplay, false)}
										controls={stringToBoolean(childComponent.props.controls, true)}
										fullWidth={stringToBoolean(childComponent.props.fullWidth, true)}
									/>
								</div>

							{:else if childComponent.type === 'header'}
								<div class="section-child">
									<Header
										title={childComponent.props.title}
										subtitle={childComponent.props.subtitle}
										author={childComponent.props.author}
										date={childComponent.props.date}
										variant={childComponent.props.variant || 'simple'}
									/>
								</div>

							{:else}
								<!-- Fallback para outros tipos -->
								<div class="section-child">
									<StoryText content={childComponent.data.text || 'Componente não reconhecido'} variant="body" />
								</div>
							{/if}
						{/each}
					{:else}
						<!-- Se não tem filhos, mostrar conteúdo direto -->
						{#if props.content}
							<div class="section-content">
								{@html props.content}
							</div>
						{:else if props.text}
							<div class="section-content">
								<StoryText content={props.text} variant="body" />
							</div>
						{/if}
					{/if}
				</Section>
			<!-- Header -->
{:else if componentType === 'header'}
				<Header
					title={props.title}
					subtitle={props.subtitle}
					author={props.author}
					date={props.date}
					backgroundImage={props.backgroundImage}
					backgroundImageMobile={props.backgroundImageMobile}
					backgroundVideo={props.backgroundVideo}
					backgroundVideoMobile={props.backgroundVideoMobile}
					variant={props.variant || 'default'}
					overlay={stringToBoolean(props.overlay, true)}
				/>
			<!-- Text -->
			{:else if componentType === 'text'}
				<div class="section-content">
					<StoryText 
						content={props.text} 
						variant={props.variant || 'body'} 
						align={props.align}
						size={props.size}
						color={props.color}
					/>
				</div>

			<!-- Quote -->
			{:else if componentType === 'quote'}
				<div class="section-content">
					<StoryText 
						content={props.text} 
						variant="quote" 
						author={props.author} 
						role={props.role} 
					/>
				</div>

			<!-- Section Title -->
			{:else if componentType === 'section-title'}
				<SectionTitle
					title={props.text}
					backgroundImage={props.backgroundImage}
					backgroundImageMobile={props.backgroundImageMobile}
					backgroundPosition={props.backgroundPosition || 'center'}
					backgroundPositionMobile={props.backgroundPositionMobile || 'center'}
					backgroundVideo={props.backgroundVideo}
					backgroundVideoMobile={props.backgroundVideoMobile}
					backgroundColor={props.backgroundColor}
					textColor={props.textColor}
					fontFamily={props.fontFamily || 'obviously'}
					variant={props.variant || 'default'}
					size={props.size || 'medium'}
					height={props.height}
					heightMobile={props.heightMobile}
					textPosition={props.textPosition || 'center'}
					textPositionMobile={props.textPositionMobile}
					textAlign={props.textAlign || 'center'}
					textAlignMobile={props.textAlignMobile}
					overlay={stringToBoolean(props.overlay, false)}
				/>

			<!-- Photo -->
			{:else if componentType === 'photo'}
				<PhotoWithCaption
					src={props.src}
					alt={props.alt || ''}
					caption={props.caption || ''}
					credit={props.credit || ''}
					fullWidth={stringToBoolean(props.fullWidth, false)}
					alignment={props.alignment || 'center'}
				/>

			<!-- Video -->
			{:else if componentType === 'video'}
				<VideoPlayer
					src={props.src}
					caption={props.caption}
					credit={props.credit}
					fullWidth={stringToBoolean(props.fullWidth, false)}
					autoplay={stringToBoolean(props.autoplay, false)}
					controls={stringToBoolean(props.controls, true)}
					loop={stringToBoolean(props.loop, false)}
					showCaption={stringToBoolean(props.showCaption, true)}
				/>

			<!-- Globo Player -->
			{:else if componentType === 'globo-player'}
				<GloboPlayer
					videoId={props.videoId}
					videosIDs={props.videosIDs}
					caption={props.caption}
					credit={props.credit}
					fullWidth={stringToBoolean(props.fullWidth, false)}
					autoplay={stringToBoolean(props.autoplay, false)}
					startMuted={stringToBoolean(props.startMuted, true)}
					skipDFP={stringToBoolean(props.skipDFP, false)}
					chromeless={stringToBoolean(props.chromeless, false)}
					showCaption={stringToBoolean(props.showCaption, true)}
				/>

			<!-- Gallery -->
			{:else if componentType === 'gallery'}
				<PhotoGallery
					images={props.images || []}
					layout={props.layout || 'grid'}
					columns={parseInt(props.columns) || 3}
					lightbox={stringToBoolean(props.lightbox, true)}
				/>

			<!-- Carousel -->
			{:else if componentType === 'carousel'}
				<Carousel
					items={props.items || []}
					autoplay={stringToBoolean(props.autoplay, false)}
					interval={parseInt(props.interval) || 3000}
					showDots={stringToBoolean(props.showDots, true)}
					showArrows={stringToBoolean(props.showArrows, true)}
				/>

			<!-- 🆕 NOVO: Recommended Items -->
			{:else if componentType === 'recommended-items'}
				<RecommendedItems
					items={processRecommendedItems(props.items || props.itens)}
					title={props.title || props.titulo || 'conteúdos relacionados'}
					layout={props.layout || 'grid'}
					columns={parseInt(props.columns || props.colunas) || 5}
					showTitle={stringToBoolean(props.showTitle || props.mostrarTitulo, true)}
					backgroundColor={props.backgroundColor || props.corFundo || '#000000'}
					titleColor={props.titleColor || props.corTitulo || '#ff0000'}
					textColor={props.textColor || props.corTexto || '#ffffff'}
				/>

			<!-- Parallax -->
			{:else if componentType === 'parallax'}
				<Parallax
					image={props.image}
					imageMobile={props.imageMobile}
					height={props.height || '60vh'}
					speed={parseFloat(props.speed) || 0.5}
					overlay={stringToBoolean(props.overlay, true)}
					content={props.content || ''}
				/>

			<!-- Before/After -->
			{:else if componentType === 'before-after'}
				<BeforeAfter
					beforeImage={props.beforeImage}
					afterImage={props.afterImage}
					beforeLabel={props.beforeLabel || 'Antes'}
					afterLabel={props.afterLabel || 'Depois'}
					orientation={props.orientation || 'vertical'}
				/>

			<!-- ScrollyTelling -->
			{:else if componentType === 'scrolly'}
				<ScrollyTelling
					steps={props.steps || []}
					fullWidth={stringToBoolean(props.fullWidth, false)}
				/>

			<!-- ✅ SCROLLY FRAMES - NOVO COMPONENTE -->
			{:else if componentType === 'scrollyframes'}
				<ScrollyFrames
					framePrefix={props.imagePrefix || ''}
					framePrefixMobile={props.imagePrefixMobile || ''}
					frameExtension={props.imageSuffix || '.jpg'}
					frameExtensionMobile={props.imageSuffixMobile || '.webp'}
					startFrame={parseInt(props.frameStart) || 1}
					endFrame={parseInt(props.frameStop) || 100}
					totalFrames={parseInt(props.frameStop) || 100}
					height={props.height || '400vh'}
					showProgress={stringToBoolean(props.showProgress, true)}
					showFrameCounter={stringToBoolean(props.showTime, false)}
					preloadRadius={parseInt(props.preloadFrames) || 8}
				/>

			<!-- 🎬 CHARACTER PRESENTATION - COMPONENTE DE PERSONAGENS -->
			{:else if componentType === 'character-presentation'}
				<CharacterPresentation
					personagens={processCharacters(props.personagens || props.characters || props.lista)}
					shapeColor={props.shapeColor || '#DC2626'}
					nameColor={props.nameColor || '#000'}
					textColor={props.textColor || '#fff'}
					backgroundColor={props.backgroundColor || '#000'}
					animationSpeed={props.animationSpeed || 'normal'}
					sectionHeight={props.sectionHeight || '100vh'}
					sectionHeightMobile={props.sectionHeightMobile || '100vh'}
				/>

			<!-- 🎯 CURIOSIDADES - NOVO COMPONENTE -->
			{:else if componentType === 'curiosidades'}
				<Curiosidades
					personagens={processCharacters(props.personagens || props.characters || props.lista)}
					shapeColor={props.shapeColor || '#b51207'}
					nameColor={props.nameColor || '#000000'}
					textColor={props.textColor || '#ffffff'}
					backgroundColor={props.backgroundColor || '#000000'}
					quoteColor={props.quoteColor || '#ffd700'}
				/>

			<!-- Flourish Embed -->
			{:else if componentType === 'flourish'}
				<FlourishEmbed
					src={props.src}
					height={props.height || '600px'}
					caption={props.caption}
					credit={props.credit}
				/>

			<!-- Flourish Scrolly -->
			{:else if componentType === 'flourish-scrolly'}
				<FlourishScrolly src={props.src} steps={props.steps || []} />

			<!-- Anchor Point -->
			{:else if componentType === 'anchor'}
				<AnchorPoint id={props.id} />

			<!-- Fallback para tipos desconhecidos -->
			{:else}
				<div class="unknown-component">
					<p><strong>Componente desconhecido:</strong> {paragraph.type}</p>
					<pre>{JSON.stringify(paragraph, null, 2)}</pre>
				</div>
			{/if}
		{/each}
	{/if}

	<!-- Renderizar créditos finais se existir -->
<!-- Renderizar créditos finais se existir -->
{#if storyData.credits}
  <FinalCredits 
    notes={storyData.credits.notes || ''}
    sources={storyData.credits.sources || []}
    additionalGraphics={storyData.credits.additionalGraphics || []}
    editedBy={storyData.credits.editedBy || []}
    authors={storyData.credits.authors || []}
  />
{/if}

{#if storyData.finalCredits}
		<FinalCredits credits={storyData.finalCredits} />
	{/if}
</article>

<style>
	.story-content {
		max-width: none;
		width: 100%;
	}

	.section-content {
		max-width: 800px;
		margin: 0 auto;
		padding: 0 0rem;
	}

	.unknown-component {
		background: #f3f4f6;
		border: 2px dashed #9ca3af;
		padding: 2rem;
		margin: 2rem auto;
		max-width: 800px;
		border-radius: 8px;
	}

	.unknown-component pre {
		background: #ffffff;
		padding: 1rem;
		border-radius: 4px;
		overflow-x: auto;
		font-size: 0.875rem;
	}
	.section-child {
		/* Estilos para componentes filhos dentro de section */
		margin-bottom: 1rem;
	}
	
	.section-child:last-child {
		margin-bottom: 0;
	}
	
	.section-content {
		/* Estilos para conteúdo direto */
		width: 100%;
	}
</style>