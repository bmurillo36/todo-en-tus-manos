/* =============================================================================
   Fondo animado: el código de Claude Code escribiéndose detrás de todo.

   Es un canvas, NO un vídeo. Un vídeo de fondo pesa megas, se ve borroso al
   escalar y en el móvil con datos se nota; esto son unos kilobytes, se dibuja
   nítido a cualquier resolución y se apaga solo cuando no se ve.

   Tres capas a distinta velocidad para que haya profundidad de verdad al
   desplazar (parallax), no un fondo plano moviéndose.
   ========================================================================== */

(function () {
  const lienzo = document.getElementById('fondo');
  if (!lienzo) return;
  const ctx = lienzo.getContext('2d', { alpha: true });
  if (!ctx) return;

  const quieto = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* Trozos de sesión reales, no "lorem ipsum": quien mire de cerca reconoce
     lo que hace el producto. */
  const LINEAS = [
    '❯ claude',
    '✻ Claude Code v2.1 · listo',
    '❯ arregla el error del menú',
    '⏺ Leyendo app.py…',
    '✓ Encontrado en línea 214',
    '⏺ Editando app.py…',
    '✓ 2 líneas cambiadas',
    '⏺ Probando…',
    '✓ Todo en orden',
    '✓ Guardado en GitHub',
    'rama movil-16 → main',
    '$ git commit -m "menú arreglado"',
    '$ systemctl status claude-movil',
    '● active (running)',
    '❯ añade una página de contacto',
    '⏺ Creando contacto.html…',
    '✓ Subido a tu servidor',
    '$ tmux attach -t claude',
    '❯ /memoria',
    '✓ Sesión persistente · 24/7'
  ];

  /* Las letras se ven de verdad (antes casi no se leian): la de delante casi
     al medio tono, y las de detras cada vez mas apagadas para que la
     profundidad se note sin ensuciar el texto de encima. */
  const CAPAS = [
    { tam: 12, alfa: 0.52, vel: 14, sep: 200, desfase: 0.06 },
    { tam: 14, alfa: 0.34, vel: 9,  sep: 250, desfase: 0.12 },
    { tam: 18, alfa: 0.18, vel: 5,  sep: 330, desfase: 0.22 }
  ];

  let ancho = 0;
  let alto = 0;
  let columnas = [];
  let ultimo = 0;
  let desplazamiento = 0;
  let visible = true;

  function medir() {
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    ancho = window.innerWidth;
    alto = window.innerHeight;
    lienzo.width = Math.floor(ancho * dpr);
    lienzo.height = Math.floor(alto * dpr);
    lienzo.style.width = ancho + 'px';
    lienzo.style.height = alto + 'px';
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    sembrar();
  }

  function sembrar() {
    columnas = [];
    CAPAS.forEach((capa, i) => {
      const cuantas = Math.max(1, Math.ceil(ancho / capa.sep));
      for (let c = 0; c <= cuantas; c++) {
        columnas.push({
          capa: i,
          x: c * capa.sep + (i * 37) % capa.sep,
          y: Math.random() * alto * 2 - alto,
          linea: Math.floor(Math.random() * LINEAS.length),
          /* Cuántas letras de la línea van escritas: así parece que alguien
             está tecleando, no un cartel que pasa. */
          letras: Math.floor(Math.random() * 12),
          espera: Math.random() * 40
        });
      }
    });
  }

  function pintar(ahora) {
    if (!visible) { ultimo = ahora; requestAnimationFrame(pintar); return; }
    const dt = Math.min((ahora - ultimo) / 1000, 0.05) || 0;
    ultimo = ahora;
    ctx.clearRect(0, 0, ancho, alto);

    for (const col of columnas) {
      const capa = CAPAS[col.capa];
      col.y += capa.vel * dt * 60 * 0.35;
      if (col.y > alto + 40) {
        col.y = -30;
        col.linea = Math.floor(Math.random() * LINEAS.length);
        col.letras = 0;
        col.espera = Math.random() * 30;
      }

      const texto = LINEAS[col.linea];
      if (col.espera > 0) {
        col.espera -= dt * 60;
      } else if (col.letras < texto.length) {
        col.letras += dt * 26;
      }
      const escrito = texto.slice(0, Math.floor(col.letras));
      if (!escrito) continue;

      /* El desfase por capa es lo que da la sensación de profundidad al
         desplazar la página: las de delante se mueven más. */
      const y = col.y - desplazamiento * capa.desfase;
      const yEnvuelta = ((y % (alto + 120)) + alto + 120) % (alto + 120) - 60;

      ctx.font = capa.tam + 'px "JetBrains Mono", ui-monospace, Menlo, monospace';
      ctx.fillStyle = 'rgba(226, 133, 100, ' + capa.alfa + ')';
      ctx.fillText(escrito, col.x, yEnvuelta);

      if (col.letras < texto.length) {
        ctx.fillStyle = 'rgba(255, 150, 112, ' + Math.min(0.95, capa.alfa * 1.8) + ')';
        ctx.fillRect(col.x + ctx.measureText(escrito).width + 1, yEnvuelta - capa.tam + 3, capa.tam * 0.5, capa.tam);
      }
    }
    requestAnimationFrame(pintar);
  }

  /* Con la pestaña de fondo no se dibuja: ni gasta batería ni calienta el
     teléfono por una animación que nadie está viendo. */
  document.addEventListener('visibilitychange', () => { visible = document.visibilityState === 'visible'; });
  window.addEventListener('scroll', () => { desplazamiento = window.scrollY || 0; }, { passive: true });
  window.addEventListener('resize', medir);

  medir();
  if (quieto) {
    /* Un solo fotograma, quieto: se ve la textura y no se mueve nada. */
    columnas.forEach((c) => { c.letras = LINEAS[c.linea].length; });
    pintarQuieto();
  } else {
    requestAnimationFrame((t) => { ultimo = t; pintar(t); });
  }

  function pintarQuieto() {
    ctx.clearRect(0, 0, ancho, alto);
    for (const col of columnas) {
      const capa = CAPAS[col.capa];
      const y = ((col.y % alto) + alto) % alto;
      ctx.font = capa.tam + 'px "JetBrains Mono", ui-monospace, Menlo, monospace';
      ctx.fillStyle = 'rgba(226, 133, 100, ' + (capa.alfa * 0.7) + ')';
      ctx.fillText(LINEAS[col.linea], col.x, y);
    }
  }
})();
