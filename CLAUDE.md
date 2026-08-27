# CLAUDE.md — Todo en tus Manos

Web de venta de **Claude Code en tu propio servidor, manejado desde el movil**.
El producto que vende es [[claude-movil]]; esto es solo el escaparate.

## Que es

Una sola pagina estatica: `index.html`, `css/estilos.css`, `js/app.js`,
`js/fondo.js`, `js/idiomas.js`, mas `img/` y `video/`. **Sin dependencias y sin
compilacion**: se sirve tal cual desde GitHub Pages. No hay `package.json`, y no
deberia haberlo — el dia que haga falta compilar, esta web deja de poder tocarse
desde el movil en treinta segundos.

Precio que anuncia: **9,99 €/mes** de mantenimiento. Si cambia, cambia en tres
sitios a la vez: aqui, en la guia de [[claude-code-for-iphone]] y en su PDF.

## Lo que hay que saber antes de tocarlo

- **`js/fondo.js` es un canvas, no un video.** Tres capas de codigo cayendo a
  distinta velocidad. Un video de fondo pesa megas y se ve borroso al escalar;
  esto son unos kilobytes. Se para solo con `prefers-reduced-motion` y con la
  pestaña de fondo. Es el mismo enfoque que usa el Monitor Siglo 21.
- **El laser de los botones** (`ponerLaser` en `js/app.js`) inyecta un SVG con
  `pathLength="100"`. Esa cifra es la gracia: hace que el recorrido mida 100 sea
  cual sea el ancho, asi que la vuelta dura lo mismo en un boton largo que en
  uno corto. Y `vector-effect: non-scaling-stroke` mantiene el grosor aunque el
  viewBox se estire.
- **Ojo con `textContent` en un boton**: borra sus hijos, y con ellos el SVG del
  laser. Si le cambias el rotulo a un boton, vuelve a llamar a `ponerLaser()`.
  Ese fallo ya ha costado un rato en el Monitor Siglo 21.
- Los videos se pausan cuando no se ven: un bucle que nadie mira gasta bateria.

## Publicar

Es GitHub Pages: `git push` a `main` y ya esta. No hay despliegue que lanzar.
