<!-- Section.svelte -->
<script>
  // Props básicas
  export let id = '';
  export let className = '';
  export let as = 'section';

  // Background Controls
  export let backgroundColor = '';
  export let backgroundImage = '';
  export let backgroundVideo = '';
  export let backgroundSize = 'cover'; // 'cover', 'contain', 'auto'
  export let backgroundPosition = 'center'; // 'center', 'top', 'bottom', 'left', 'right'
  export let backgroundRepeat = 'no-repeat'; // 'no-repeat', 'repeat', 'repeat-x', 'repeat-y'
  export let backgroundAttachment = 'scroll'; // 'scroll', 'fixed', 'local'
  export let overlay = ''; // Para overlay sobre background image/video
  export let overlayOpacity = '0.5';

  // Spacing Controls
  export let margin = '';
  export let marginTop = '';
  export let marginBottom = '';
  export let marginLeft = '';
  export let marginRight = '';
  export let padding = '';
  export let paddingTop = '';
  export let paddingBottom = '';
  export let paddingLeft = '';
  export let paddingRight = '';

  // Text Controls
  export let textColor = '';
  export let textAlign = ''; // 'left', 'center', 'right', 'justify'
  export let fontSize = '';
  export let fontWeight = '';

  // Layout Controls
  export let minHeight = 'auto'; // Altura automática por padrão
  export let height = 'auto'; // Altura automática
  export let maxHeight = '';
  export let maxWidth = '';
  export let width = '';
  export let display = '';
  export let justifyContent = '';
  export let alignItems = '';
  export let flexDirection = '';

  // Responsive breakpoints para props customizadas
  export let sm = {};
  export let md = {};
  export let lg = {};
  export let xl = {};

  // Função para gerar estilos CSS
  function generateStyles() {
    let styles = [];

    // Background color
    if (backgroundColor) {
      styles.push(`background-color: ${backgroundColor}`);
    }

    // Background image
    if (backgroundImage) {
      styles.push(`background-image: url('${backgroundImage}')`);
      styles.push(`background-size: ${backgroundSize}`);
      styles.push(`background-position: ${backgroundPosition}`);
      styles.push(`background-repeat: ${backgroundRepeat}`);
      styles.push(`background-attachment: ${backgroundAttachment}`);
    }

    // Margin
    if (margin) styles.push(`margin: ${margin}`);
    if (marginTop) styles.push(`margin-top: ${marginTop}`);
    if (marginBottom) styles.push(`margin-bottom: ${marginBottom}`);
    if (marginLeft) styles.push(`margin-left: ${marginLeft}`);
    if (marginRight) styles.push(`margin-right: ${marginRight}`);

    // Padding
    if (padding) styles.push(`padding: ${padding}`);
    if (paddingTop) styles.push(`padding-top: ${paddingTop}`);
    if (paddingBottom) styles.push(`padding-bottom: ${paddingBottom}`);
    if (paddingLeft) styles.push(`padding-left: ${paddingLeft}`);
    if (paddingRight) styles.push(`padding-right: ${paddingRight}`);

    // Text
    if (textColor) styles.push(`color: ${textColor}`);
    if (textAlign) styles.push(`text-align: ${textAlign}`);
    if (fontSize) styles.push(`font-size: ${fontSize}`);
    if (fontWeight) styles.push(`font-weight: ${fontWeight}`);

    // Layout
    if (height) styles.push(`height: ${height}`);
    if (minHeight) styles.push(`min-height: ${minHeight}`);
    if (maxHeight) styles.push(`max-height: ${maxHeight}`);
    if (maxWidth) styles.push(`max-width: ${maxWidth}`);
    if (width) styles.push(`width: ${width}`);
    if (display) styles.push(`display: ${display}`);
    if (justifyContent) styles.push(`justify-content: ${justifyContent}`);
    if (alignItems) styles.push(`align-items: ${alignItems}`);
    if (flexDirection) styles.push(`flex-direction: ${flexDirection}`);

    return styles.join('; ');
  }

  $: computedStyles = generateStyles();

  // Classes CSS responsivas e utilitárias
  $: computedClasses = [
    'section-component',
    backgroundVideo ? 'relative overflow-hidden' : '',
    className
  ].filter(Boolean).join(' ');

  // Função para aplicar estilos responsivos
  function applyResponsiveStyles(breakpoint, styles) {
    if (!styles || Object.keys(styles).length === 0) return '';
    
    const responsiveStyles = Object.entries(styles)
      .map(([prop, value]) => {
        const cssProp = prop.replace(/([A-Z])/g, '-$1').toLowerCase();
        return `${cssProp}: ${value}`;
      })
      .join('; ');
    
    return responsiveStyles;
  }
</script>

<svelte:element
  this={as}
  {id}
  class={computedClasses}
  style={computedStyles}
>
  <!-- Background Video -->
  {#if backgroundVideo}
    <video
      class="absolute top-0 left-0 w-full h-full object-cover z-0"
      autoplay
      muted
      loop
      playsinline
    >
      <source src={backgroundVideo} type="video/mp4">
      <!-- Fallback para browsers que não suportam video -->
    </video>
  {/if}

  <!-- Overlay -->
  {#if (backgroundImage || backgroundVideo) && overlay}
    <div 
      class="absolute inset-0 z-10"
      style="background-color: {overlay}; opacity: {overlayOpacity};"
    ></div>
  {/if}

  <!-- Conteúdo -->
  <div class={`content-container relative z-20`}>
    <slot />
  </div>
</svelte:element>

<!-- CSS responsivo -->
<style>
  .section-component {
    position: relative;
    height: auto; /* Altura automática por padrão */
    min-height: fit-content; /* Se ajusta ao conteúdo */
  }

  /* Container do conteúdo se adapta automaticamente */
  .section-component > .content-container {
    height: auto;
    min-height: inherit;
  }

  /* Estilos responsivos via CSS custom properties */
  @media (min-width: 640px) {
    .section-component.responsive-sm {
      /* Estilos sm serão aplicados via JS se necessário */
    }
  }

  @media (min-width: 768px) {
    .section-component.responsive-md {
      /* Estilos md serão aplicados via JS se necessário */
    }
  }

  @media (min-width: 1024px) {
    .section-component.responsive-lg {
      /* Estilos lg serão aplicados via JS se necessário */
    }
  }

  @media (min-width: 1280px) {
    .section-component.responsive-xl {
      /* Estilos xl serão aplicados via JS se necessário */
    }
  }

  /* Garantir que o vídeo não apareça acima do conteúdo */
  :global(.section-component video) {
    pointer-events: none;
  }

  /* Suporte para overlay gradiente */
  :global(.section-component .gradient-overlay) {
    background: linear-gradient(to bottom, transparent, rgba(0,0,0,0.7));
  }

  /* Garantir que o conteúdo define a altura quando há background video/image */
  .section-component .content-container {
    width: 100%;
    height: auto;
    min-height: fit-content;
  }
</style>