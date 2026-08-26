/* =============================================================================
   Todo en tus Manos — comportamiento de la página.

   Cuatro cosas y ninguna más: idioma, barra al desplazar, aparecer al llegar,
   parallax, y la terminal de la portada contándose sola.
   ========================================================================== */

const $ = (id) => document.getElementById(id);
const QUIETO = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/* ------------------------------------------------------------- idioma */

/* El español está escrito en el HTML; los demás salen del diccionario. Así la
   página se lee entera aunque el JS no llegue a cargar, que es lo que ven los
   buscadores y lo que pasa con una conexión mala. */
function idiomaGuardado() {
  try {
    const g = localStorage.getItem('idioma');
    if (g && (g === 'es' || IDIOMAS[g])) return g;
  } catch (e) { /* modo privado */ }
  const navegador = (navigator.language || 'es').slice(0, 2).toLowerCase();
  return IDIOMAS[navegador] ? navegador : 'es';
}

let IDIOMA = idiomaGuardado();

function aplicarIdioma() {
  document.documentElement.lang = IDIOMA;
  $('idiomaActual').textContent = IDIOMA.toUpperCase();
  if (IDIOMA === 'es') { location.reload(); return; }
  const dicc = IDIOMAS[IDIOMA];
  if (!dicc) return;
  document.querySelectorAll('[data-t]').forEach((el) => {
    const texto = dicc[el.dataset.t];
    if (texto) el.textContent = texto;
  });
  if (dicc['meta.titulo']) document.title = dicc['meta.titulo'];
}

function ponerIdioma(cual) {
  IDIOMA = cual;
  try { localStorage.setItem('idioma', cual); } catch (e) { /* modo privado */ }
  if (cual === 'es') { location.reload(); return; }
  aplicarIdioma();
  $('capaIdiomas').hidden = true;
}

$('btnIdioma').addEventListener('click', (e) => {
  e.stopPropagation();
  $('capaIdiomas').hidden = !$('capaIdiomas').hidden;
});
document.addEventListener('click', () => { $('capaIdiomas').hidden = true; });
$('capaIdiomas').addEventListener('click', (e) => e.stopPropagation());
$('capaIdiomas').querySelectorAll('button[data-idioma]').forEach((b) => {
  b.addEventListener('click', () => ponerIdioma(b.dataset.idioma));
});

if (IDIOMA !== 'es') {
  $('idiomaActual').textContent = IDIOMA.toUpperCase();
  document.documentElement.lang = IDIOMA;
  document.querySelectorAll('[data-t]').forEach((el) => {
    const texto = IDIOMAS[IDIOMA] && IDIOMAS[IDIOMA][el.dataset.t];
    if (texto) el.textContent = texto;
  });
  if (IDIOMAS[IDIOMA] && IDIOMAS[IDIOMA]['meta.titulo']) document.title = IDIOMAS[IDIOMA]['meta.titulo'];
}

/* ------------------------------------------------- barra al desplazar */

const barra = $('barra');
let ultimoY = -1;
function alDesplazar() {
  const y = window.scrollY || 0;
  if (y === ultimoY) return;
  ultimoY = y;
  barra.classList.toggle('pegada', y > 24);
  if (!QUIETO) moverParallax(y);
}
window.addEventListener('scroll', () => requestAnimationFrame(alDesplazar), { passive: true });
/* La primera pasada NO se hace aquí: alDesplazar() llama a moverParallax(), que
   usa constantes declaradas más abajo. Con `const`/`let` eso no vale undefined,
   es un error de zona muerta que corta el fichero entero — y con el fichero
   cortado no se monta el observador que hace aparecer los textos, así que la
   página se queda en blanco. Se arranca al final, cuando ya existe todo. */

/* ---------------------------------------------------------- parallax */

/* Cada elemento con data-parallax se mueve a su propio ritmo. Sin transición
   CSS a propósito: la transición y el scroll se pelean y sale a tirones. */

/* El teléfono va FIJO: se queda a la misma altura de la pantalla mientras se
   baja y gira sin parar hasta el final de la página. Tres vueltas completas de
   arriba abajo — con una sola apenas se notaba pasada la portada.

   La posición horizontal se calcula: tiene que caer donde estaría la columna
   derecha de la portada, y eso depende del ancho de la ventana. Se recalcula
   al cambiar de tamaño y no se mueve nunca mientras se baja, que es lo pedido. */
const conParallax = Array.from(document.querySelectorAll('[data-parallax]'));
const movil = $('movil');
const marco = $('movilMarco');
const VUELTAS = 3;
let giroObjetivo = 0;
let giroActual = 0;
let girando = false;

function colocarMovil() {
  if (!movil) return;
  const portada = document.querySelector('.portada');
  if (!portada) return;
  const caja = portada.getBoundingClientRect();
  const ancho = movil.offsetWidth || 290;
  /* La columna derecha de la portada empieza al 55 % de su ancho; el teléfono
     se centra en lo que queda. Con la ventana estrecha, el CSS lo esconde. */
  const izquierdaColumna = caja.left + caja.width * 0.55;
  const anchoColumna = caja.width * 0.45;
  movil.style.left = Math.round(izquierdaColumna + (anchoColumna - ancho) / 2) + 'px';
  movil.classList.add('puesto');
}

function moverParallax(y) {
  if (y < window.innerHeight * 1.6) {
    for (const el of conParallax) {
      const factor = parseFloat(el.dataset.parallax) || 0;
      el.style.transform = 'translate3d(0, ' + (y * factor).toFixed(1) + 'px, 0)';
    }
  }
  if (!marco) return;
  /* El giro se reparte a lo largo de TODA la página, no solo de la portada:
     así sigue girando mientras se baja, que es lo que se pide. */
  const recorrido = Math.max(1, document.documentElement.scrollHeight - window.innerHeight);
  giroObjetivo = (y / recorrido) * 360 * VUELTAS;
  if (!girando) { girando = true; requestAnimationFrame(suavizarGiro); }
}

function suavizarGiro() {
  const falta = giroObjetivo - giroActual;
  giroActual += falta * 0.12;
  /* Se inclina un poco a la vez que gira: girar solo en un eje se ve plano,
     como una puerta. La inclinación sigue al propio giro, así que va y viene
     sola sin depender del scroll. */
  const inclina = Math.sin(giroActual * Math.PI / 180) * 6;
  marco.style.transform =
    'rotateX(' + inclina.toFixed(2) + 'deg) rotateY(' + giroActual.toFixed(2) + 'deg)';
  if (Math.abs(falta) > 0.05) {
    requestAnimationFrame(suavizarGiro);
  } else {
    girando = false;
  }
}

window.addEventListener('resize', colocarMovil);

/* ------------------------------------------------- aparecer al llegar */

if ('IntersectionObserver' in window && !QUIETO) {
  const vigia = new IntersectionObserver((entradas) => {
    entradas.forEach((e) => {
      if (!e.isIntersecting) return;
      e.target.classList.add('dentro');
      vigia.unobserve(e.target);
    });
  }, { rootMargin: '0px 0px -12% 0px', threshold: 0.08 });

  document.querySelectorAll('.revelar').forEach((el, i) => {
    /* Escalonado por posición dentro de su grupo: las tarjetas de una fila
       entran una detrás de otra, no todas de golpe. */
    el.style.transitionDelay = ((i % 6) * 70) + 'ms';
    vigia.observe(el);
  });
} else {
  document.querySelectorAll('.revelar').forEach((el) => el.classList.add('dentro'));
}

/* --------------------------------------- la terminal de la portada */

/* Se escribe sola, en bucle. Es la promesa del producto contada en diez
   segundos y sin que nadie tenga que leer nada. */
const GUION = [
  { t: '❯ ', c: 'gris' },
  { t: 'arregla el error del menú\n', c: 'nar', escribir: true },
  { t: '⏺ Leyendo app.py…\n', c: 'gris', espera: 420 },
  { t: '✓ Encontrado en línea 214\n', c: 'ok', espera: 380 },
  { t: '⏺ Editando app.py…\n', c: 'gris', espera: 420 },
  { t: '✓ 2 líneas cambiadas\n', c: 'ok', espera: 380 },
  { t: '⏺ Probando…\n', c: 'gris', espera: 500 },
  { t: '✓ Todo en orden\n', c: 'ok', espera: 380 },
  { t: '✓ Guardado en GitHub\n', c: 'ok', espera: 420 },
  { t: '  rama movil-16 → main\n', c: 'gris', espera: 900 }
];

const pantalla = $('terminalDemo');
if (pantalla) {
  if (QUIETO) {
    pantalla.innerHTML = GUION.map((p) => '<span class="' + (p.c || '') + '">' + p.t + '</span>').join('');
  } else {
    let paso = 0;
    let letra = 0;
    let html = '';
    const ventana = pantalla.parentElement;

    /* Las líneas SUBEN, no se borran de golpe: cuando lo escrito pasa del alto
       de la ventana, se desplaza el bloque hacia arriba. Es lo que hace una
       terminal de verdad, y de paso siempre hay movimiento dentro. */
    function subir() {
      if (!ventana) return;
      const sobra = pantalla.scrollHeight - ventana.clientHeight + 20;
      pantalla.style.transform = 'translateY(' + (sobra > 0 ? -sobra : 0) + 'px)';
    }

    function tic() {
      if (paso >= GUION.length) {
        setTimeout(() => {
          /* Se encadena otra vuelta SIN vaciar: lo viejo sigue subiendo y
             desaparece por arriba, como en la terminal de verdad. */
          if (pantalla.scrollHeight > 1400) { html = ''; pantalla.style.transform = 'translateY(0)'; }
          paso = 0; letra = 0; tic();
        }, 2400);
        return;
      }
      const trozo = GUION[paso];
      if (trozo.escribir) {
        letra++;
        const visto = trozo.t.slice(0, letra);
        pantalla.innerHTML = html + '<span class="' + trozo.c + '">' + visto + '</span><i class="cursor">&nbsp;</i>';
        subir();
        if (letra >= trozo.t.length) { html += '<span class="' + trozo.c + '">' + trozo.t + '</span>'; paso++; letra = 0; }
        setTimeout(tic, 45);
      } else {
        html += '<span class="' + (trozo.c || '') + '">' + trozo.t + '</span>';
        pantalla.innerHTML = html + '<i class="cursor">&nbsp;</i>';
        subir();
        paso++;
        setTimeout(tic, trozo.espera || 260);
      }
    }
    tic();
  }
}

/* ------------------------------------------------------- láser y cifras */

/* El trazo del láser va en un SVG metido al vuelo en cada botón, no en un
   borde animado por CSS: con `pathLength="100"` el recorrido dura lo mismo en
   un botón ancho que en uno estrecho, y `non-scaling-stroke` mantiene el
   grosor aunque el viewBox se estire. Es el mismo truco que usa la app. */
function ponerLaser() {
  const NS = 'http://www.w3.org/2000/svg';
  document.querySelectorAll('.boton').forEach((b) => {
    if (b.querySelector('.laser')) return;
    const svg = document.createElementNS(NS, 'svg');
    svg.setAttribute('class', 'laser');
    svg.setAttribute('viewBox', '0 0 100 100');
    svg.setAttribute('preserveAspectRatio', 'none');
    svg.setAttribute('aria-hidden', 'true');
    const r = document.createElementNS(NS, 'rect');
    r.setAttribute('x', '1'); r.setAttribute('y', '1');
    r.setAttribute('width', '98'); r.setAttribute('height', '98');
    r.setAttribute('rx', '9'); r.setAttribute('pathLength', '100');
    svg.appendChild(r);
    b.appendChild(svg);
  });
}
if (!QUIETO) ponerLaser();

/* Las cifras de la franja (24/7, 6, 0, 9,99 €) suben desde cero al entrar en
   pantalla. Solo lo hacen una vez y solo si son un número: «24/7» se queda
   como está, que contarlo no significaría nada. */
function contarCifras() {
  const cajas = document.querySelectorAll('.franja-datos b');
  if (!cajas.length || !('IntersectionObserver' in window)) return;
  const ojo = new IntersectionObserver((entradas) => {
    entradas.forEach((e) => {
      if (!e.isIntersecting) return;
      ojo.unobserve(e.target);
      const b = e.target;
      const original = b.textContent.trim();
      /* Solo se cuenta lo que ES una cifra: «24/7» no es un número, es una
         forma de decir «siempre», y contarlo lo deja en «1/7» a mitad de
         camino — que fue justo lo que pasó. La barra lo descarta. */
      if (original.includes('/')) return;
      const m = /^([0-9]+(?:,[0-9]+)?)(\s*[^0-9]*)$/.exec(original);
      if (!m) return;
      const destino = parseFloat(m[1].replace(',', '.'));
      const cola = m[2];
      const decimales = m[1].includes(',') ? m[1].split(',')[1].length : 0;
      const arranque = performance.now();
      const DURA = 1100;
      const paso = (ahora) => {
        const avance = Math.min((ahora - arranque) / DURA, 1);
        /* Frena al final en vez de ir a velocidad constante: así parece que
           el número «llega» en lugar de cortarse en seco. */
        const suave = 1 - Math.pow(1 - avance, 3);
        const valor = (destino * suave).toFixed(decimales).replace('.', ',');
        b.textContent = valor + cola;
        if (avance < 1) requestAnimationFrame(paso);
        else b.textContent = original;
      };
      requestAnimationFrame(paso);
    });
  }, { threshold: 0.6 });
  cajas.forEach((b) => ojo.observe(b));
}
if (!QUIETO) contarCifras();

/* ----------------------------------------------------------- los vídeos */

/* Los dos comparten trato: se pausan cuando no se ven —un bucle que nadie
   mira sigue gastando batería y calentando el teléfono— y con «menos
   movimiento» se quedan quietos.

   Lo que cambia es el papel de cada uno. El del fondo es AMBIENTE: va lento y
   en bucle continuo. El del cierre es CONTENIDO: va a su ritmo, se funde a
   negro al terminar y vuelve a empezar dos segundos después, para que se note
   que ha acabado en vez de saltar de golpe al primer fotograma. */
function montarVideo(elemento, opciones) {
  if (!elemento) return;
  const ajustes = opciones || {};
  const velocidad = ajustes.velocidad || 1;
  const ponerVelocidad = () => { try { elemento.playbackRate = velocidad; } catch (e) { /* aún no listo */ } };
  elemento.addEventListener('loadedmetadata', ponerVelocidad);
  elemento.addEventListener('play', ponerVelocidad);
  ponerVelocidad();

  /* El fundido y la espera: sin `loop`, se atiende el final a mano. */
  if (ajustes.fundido) {
    elemento.loop = false;
    elemento.addEventListener('ended', () => {
      elemento.classList.add('fundido');
      setTimeout(() => {
        try { elemento.currentTime = 0; } catch (e) { /* aún no se puede */ }
        elemento.classList.remove('fundido');
        elemento.play().then(ponerVelocidad).catch(() => {});
      }, ajustes.espera || 2000);
    });
  }

  if (QUIETO) { elemento.pause(); return; }
  if (!('IntersectionObserver' in window)) return;
  const vigilante = new IntersectionObserver((entradas) => {
    entradas.forEach((e) => {
      if (e.isIntersecting) elemento.play().then(ponerVelocidad).catch(() => {});
      else elemento.pause();
    });
  }, { threshold: 0.01 });
  vigilante.observe(elemento);
}

montarVideo($('videoEscena'), { velocidad: 0.55 });
montarVideo($('videoCierre'), { velocidad: 1, fundido: true, espera: 2000 });

/* ------------------------------------------------------------- arranque */

/* Lo último del fichero, a propósito: aquí ya están declaradas todas las
   constantes que toca la primera pasada. */
colocarMovil();
alDesplazar();
