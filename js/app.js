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
const conParallax = Array.from(document.querySelectorAll('[data-parallax]'));

/* El teléfono gira sobre sí mismo mientras se baja: una vuelta entera a lo
   largo de vez y media la pantalla. La rotación se SUAVIZA hacia el objetivo en
   vez de saltar al valor exacto del scroll; con el desplazamiento por inercia
   del móvil, ir pegado al scroll se ve a tirones. */
const marco = $('movilMarco');
let giroObjetivo = 0;
let giroActual = 0;
let girando = false;

function moverParallax(y) {
  if (y < window.innerHeight * 1.6) {
    for (const el of conParallax) {
      const factor = parseFloat(el.dataset.parallax) || 0;
      el.style.transform = 'translate3d(0, ' + (y * factor).toFixed(1) + 'px, 0)';
    }
  }
  if (!marco) return;
  const recorrido = window.innerHeight * 1.5;
  const avance = Math.max(0, Math.min(y / recorrido, 1.35));
  giroObjetivo = avance * 360;
  if (!girando) { girando = true; requestAnimationFrame(suavizarGiro); }
}

function suavizarGiro() {
  const falta = giroObjetivo - giroActual;
  giroActual += falta * 0.12;
  /* Se inclina un poco a la vez que gira: girar solo en un eje se ve plano,
     como una puerta. Y sube despacio, que es el parallax del propio teléfono. */
  const inclina = Math.sin(giroActual * Math.PI / 180) * 6;
  const sube = -(window.scrollY || 0) * 0.16;
  marco.style.transform =
    'translate3d(0, ' + sube.toFixed(1) + 'px, 0)'
    + ' rotateX(' + inclina.toFixed(2) + 'deg)'
    + ' rotateY(' + giroActual.toFixed(2) + 'deg)';
  if (Math.abs(falta) > 0.05) {
    requestAnimationFrame(suavizarGiro);
  } else {
    girando = false;
  }
}

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

/* ------------------------------------------------------------- arranque */

/* Lo último del fichero, a propósito: aquí ya están declaradas todas las
   constantes que toca la primera pasada. */
alDesplazar();
