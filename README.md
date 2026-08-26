# Todo en tus Manos

Web de venta de **Claude Code en tu propio servidor, manejado desde el móvil**.

Estática, sin dependencias ni compilación: se sirve tal cual desde GitHub Pages
y de ahí se engancha con Base44.

## Qué hay

```
index.html        la portada entera (el texto en español va en el HTML)
guia.html         guía de instalación paso a paso
css/estilos.css   negro y naranja, la paleta de Claude Code
js/idiomas.js     inglés, francés, italiano y chino
js/fondo.js       el código de Claude escribiéndose detrás, en canvas
js/app.js         idioma, barra, parallax, aparecer al llegar y la terminal
favicon.svg
```

## Decisiones que conviene no deshacer

- **El español está en el HTML, no en el diccionario.** Así la página se lee
  entera aunque el JavaScript no llegue a cargar, y es lo que ve un buscador.
  Los otros cuatro idiomas se aplican encima sobre los `data-t`.
- **Clave nueva ⇒ a los CUATRO diccionarios**, no solo al inglés.
- **El fondo es un canvas, no un vídeo.** Un vídeo de fondo pesa megas, se ve
  borroso al escalar y en el móvil con datos se nota; esto son unos kilobytes,
  se dibuja nítido a cualquier resolución, se para cuando la pestaña no se ve y
  se queda quieto si el sistema pide menos animación.
- **`prefers-reduced-motion` se respeta de verdad**: el fondo pinta un solo
  fotograma, la terminal sale escrita del tirón y no hay transiciones.
- Sin gestores de paquetes ni framework: el único recurso externo son las
  tipografías de Google Fonts.

## Verlo en local

Cualquier servidor estático vale:

```
python -m http.server 8000
```

Y abrir <http://localhost:8000>.

## Publicar

Está en GitHub Pages sobre la rama `main`. Cada `push` la actualiza.

---

© 2026 Pedro (prevencion.cc). Claude y Claude Code son marcas de Anthropic.
