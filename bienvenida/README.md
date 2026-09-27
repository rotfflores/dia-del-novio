# Nuestra aventura · Día del Novio

Experiencia interactiva integrada en HTML, CSS y JavaScript. `dist` contiene el código listo para abrir; no necesita compilación. Los nombres y la foto real de la pareja se configuran por separado de la portada pública para compartir.

## Abrir

Abre `dist/index.html` directamente en un navegador. También puedes ejecutar `npm run dev` desde esta carpeta y visitar `http://127.0.0.1:4173`. No necesitas ejecutar `npm install`.

## Portada al compartir el enlace

`dist/assets/portada-whatsapp.jpg` es una portada horizontal de **1200 × 630 px**, sin nombres ni foto de la pareja. `dist/index.html` ya incluye el título, la descripción y las etiquetas Open Graph y Twitter necesarias para la vista previa. La portada no cambia los datos privados que aparecen dentro de la experiencia.

Para que WhatsApp muestre la imagen al compartir **el enlace de la página**, publícala en una URL HTTPS accesible para cualquier persona. Con esa dirección pública, ejecuta desde esta carpeta:

```sh
node scripts/preparar-compartir.mjs https://tu-dominio.com/
```

El comando escribe las URLs absolutas de la portada en `og:image` y `twitter:image`, y la URL de la página en `og:url`. Después publica de nuevo el contenido de `dist`. Si la página está en una subruta, pasa la URL exacta de la página (por ejemplo, `https://tu-dominio.com/aventura/`). `localhost` y una página privada no pueden generar una vista previa en WhatsApp. La imagen puede enviarse directamente como archivo aunque la página aún no esté publicada.

## Personalizar: todo en `dist/config.js`

| Dato | Variable |
| --- | --- |
| Nombres (todas las partes) | `names.her`, `names.him` |
| Fecha de noviazgo | `memory.date`: `{ year: 2025, month: 6, day: 21 }` |
| Foto de la parte 2 | `memory.photo.src` |
| Descripción accesible de esa foto | `memory.photo.alt` |
| Encuadre de esa foto | `memory.photo.fit`, `memory.photo.position` |
| Frase debajo de la foto | `memory.phrase` |
| Título, introducción y botones de la parte 2 | `memory.text` |
| Foto de la bienvenida | `photo.src`, `photo.alt`, `photo.fit`, `photo.position` |
| Textos de la bienvenida | `text` |
| Lista de fotos y recuerdos de la parte 3 | `gallery.memories` |
| Título, introducción, contador y botones de la galería | `gallery.text` |
| Número de partes | `totalParts`, actualmente `7` |

La fecha ya está configurada como **21 de junio de 2025**. El mes es un número de 1 a 12. Los datos se validan como fecha de calendario: meses en español y cálculos UTC, sin convertir la fecha a hora local. Cambiar de zona horaria no desplaza el día ni la cuadrícula. Las fechas inexistentes se rechazan.

Las dos partes usan actualmente `./assets/pareja.jpeg`. Para una foto diferente en la parte 2, guárdala en `dist/assets` y cambia solo `memory.photo.src`, por ejemplo `./assets/nuestro-inicio.jpg`. Las rutas son relativas a `index.html`; respeta la extensión y las mayúsculas. Si falta el archivo o falla su carga, aparece un reservado elegante.

`fit: "contain"` muestra la foto completa para no cortar rostros. `fit: "cover"` llena el marco con un recorte; en ese caso, ajusta `position`, por ejemplo `"50% 25%"`, y revísalo en celular y computadora.

`memory.text.dateMessage` admite `{fecha}` para insertar automáticamente la fecha configurada. Los textos se insertan de forma segura, sin interpretar HTML. Los corazones y flechas de los textos se convierten a **SVG locales**, igual que los demás iconos: no requieren una fuente de iconos, una conexión o un emoji específico del sistema.

## Cómo funciona la parte 2

- El calendario comienza cubierto. El contenido oculto tampoco se anuncia a lectores de pantalla.
- Se puede raspar con dedo, lápiz o mouse mediante Pointer Events; el desplazamiento táctil solo se captura dentro de la tarjeta.
- Al descubrir aproximadamente el **40 %** de la superficie, se destapa el resto. Pasar muchas veces por el mismo punto no incrementa falsamente el progreso.
- El botón **Revelar fecha** ofrece la misma experiencia con clic, Enter o Espacio y sirve también si el navegador no permite usar canvas.
- Después de revelar, se muestran la fecha, la foto, la frase y **Ver nuestros recuerdos**. El botón queda bloqueado antes de ese momento; la navegación programática también comprueba la finalización.
- La parte 2 se monta una sola vez. La fecha revelada se conserva al ir a la parte 3, regresar y visitar nuevamente la bienvenida. Incluso un raspado parcial se conserva al volver o cambiar el tamaño de pantalla.
- El estado dura mientras la página esté abierta; **recargar reinicia la experiencia**. No se guarda información en servidores ni en almacenamiento persistente del navegador.

El canvas tiene una resolución acotada (densidad máxima 2) y dibuja como máximo una vez por cuadro. El área revelada se estima con una cuadrícula de 1,440 celdas, sin lecturas costosas de píxeles. La foto se solicita al desbloquear el recuerdo.

Las animaciones y celebraciones respetan `prefers-reduced-motion`, incluso si la preferencia cambia con la página abierta. La navegación actualiza el foco y el progreso accesible.

## Parte 3: agregar o cambiar los recuerdos

Edita **`gallery.memories` en `dist/config.js`**. Esta única lista contiene las cinco tarjetas. Puedes dejar entre **4 y 6**; el contador, la barra de progreso y el desbloqueo se ajustan automáticamente. Mantén un `id` distinto por recuerdo. No cambies el HTML para agregar tarjetas.

Cada elemento tiene esta estructura:

```js
{
  id: "recuerdo-02",                    // Identificador único.
  clue: "Una de nuestras risas",        // Portada de la tarjeta.
  photo: {
    src: "./assets/recuerdo-02.jpg",     // Ruta de tu foto real.
    alt: "Descripción de nuestro recuerdo",
    fit: "contain",                    // Foto completa, sin recortar rostros.
    position: "50% 50%",               // Encuadre individual; útil con cover.
  },
  phrase: "La frase que quieras guardar junto a esta foto.",
  date: "",                            // Opcional: texto de fecha, sin conversiones.
  place: "",                           // Opcional: lugar.
}
```

El primer recuerdo usa la foto real existente `dist/assets/pareja.jpeg`. Las tarjetas 2–5 esperan **`recuerdo-02.jpg`, `recuerdo-03.jpg`, `recuerdo-04.jpg` y `recuerdo-05.jpg`** en `dist/assets`; esos cuatro archivos aún no existen. Hasta que los agregues, se muestra un reservado elegante. También puedes apuntar `photo.src` a otros nombres. Las pistas y frases incluidas son ejemplos editables; no se agregaron fechas ni lugares inventados.

### Memorama

La parte 3 ahora es un **memorama** (`dist/part3-memorama.js` y `dist/memorama-tools.js`). Cada recuerdo de `gallery.memories` aparece en dos cartas barajadas; al voltear un par se desbloquea su foto completa con la frase, fecha y lugar en **Recuerdos desbloqueados**. Al encontrar todos los pares aparece **¡Vamos a jugar!**. Los textos del juego (introducción, contador de pares, intentos) están en `gallery.game`. Mientras falten las fotos 02–05, cada carta muestra un icono y su pista para que el par se reconozca. La galería anterior sigue en `dist/part3.js`, sin cargarse; para volver a ella, cambia en `index.html` los scripts `memorama-tools.js` y `part3-memorama.js` por `part3.js`.

La descripción siguiente corresponde a la galería anterior. Las tarjetas pueden abrirse y cerrarse en cualquier orden, con toque, mouse, Enter o Espacio. Una reapertura no suma al contador. Cada tarjeta conserva su estado al navegar hacia atrás o volver desde la parte 4, y la celebración ocurre una sola vez. **El progreso dura mientras la página esté abierta; recargar reinicia la experiencia**, igual que en las partes anteriores.

Las fotos se cargan al abrir la tarjeta. La frase, la fecha y el lugar quedan fuera de la imagen. En celular hay una columna amplia; en pantallas mayores, dos o tres columnas. Todos los iconos son SVG locales y las animaciones respetan el movimiento reducido.

## Parte 4: Laberinto del amor

Al descubrir todos los recuerdos aparece **¡Vamos a jugar!**. Se abre el laberinto real de `dist/part4.js` y `dist/maze-engine.js`: recoge corazones durante una partida de hasta 60 segundos, esquiva los malentendidos y usa el corazón grande para obtener protección temporal. Funciona con flechas, WASD y controles táctiles; incluye pausa, reinicio, tres vidas, sonidos opcionales y récord local. Al terminar, **Reclamar mi premio** pasa la puntuación a la parte 5 sin exigir un mínimo. `npm run dev:game` permite abrirlo directamente en `http://127.0.0.1:4174/?preview=game`.

API en `dist/app.js`:

- `Aventura.currentPart`, `Aventura.isTransitioning`, `Aventura.part2Completed`, `Aventura.part3Completed`: solo lectura.
- `Aventura.goToWelcome()`, `Aventura.goToPart2()`, `Aventura.goToPart3()`, `Aventura.goToPart4()`: navegación con transiciones; devuelven una promesa booleana. El avance a 3 requiere haber revelado la fecha; el avance a 4 requiere estar en 3 y haber descubierto todos los recuerdos, o volver desde el regalo abierto. Los regresos conservan las partes ya montadas.
- `Aventura.registerPart4(renderer)`: extensión para el juego. Se monta al entrar y se vuelve a montar al pulsar **Jugar otra vez**. Puede devolver una función que limpie temporizadores/listeners al reiniciar.
- `Aventura.registerPart2(renderer)` y `Aventura.registerPart3(renderer)`: usados por sus respectivos archivos.
- Evento `adventure:partchange` en `document`, con `event.detail.currentPart`.

## Parte 5: personalizar el regalo

Todo está en **`prize` dentro de `dist/config.js`**:

| Dato | Variable |
| --- | --- |
| Destinatario | `prize.recipientName`; vacío utiliza `names.him` |
| Tipo de premio | `prize.type`: `"coupon"`, `"photo"` o `"message"` |
| Texto principal del cupón | `prize.coupon.text` |
| Etiqueta y nota del cupón | `prize.coupon.label`, `prize.coupon.footnote` |
| Foto especial | `prize.photo.src`, `alt`, `fit`, `position`, `caption` |
| Mensaje como premio | `prize.surpriseMessage` |
| Mensaje adicional debajo del premio | `prize.message` |
| Firma | `names.her` |
| Títulos, etiqueta y botones | `prize.text` |

Cambiar `type` basta para usar otro formato: no hace falta rehacer HTML ni CSS. El modo foto utiliza una imagen real, completa por defecto (`contain`), y muestra un reservado si falta el archivo. El contenido del premio se crea al abrir la caja; no aparece antes en pantalla ni en el árbol accesible. No hay acciones de envío o canje.

La caja se abre con toque, mouse, Enter o Espacio. Las animaciones respetan el movimiento reducido. El regalo permanece abierto al volver desde la parte 6 y después de jugar otra vez. Los resultados y el récord se guardan **en memoria mientras la página está abierta**, igual que el progreso de las partes anteriores; recargar reinicia la visita.

### Navegación del juego y la carta

El laberinto llama `await Aventura.completeGame({ score, maxScore })` al reclamar el premio. Solo se acepta desde la parte 4 sin una transición activa; ambos valores deben ser enteros, con `0 <= score <= maxScore` y `maxScore > 0`. Se registra la partida y se abre la parte 5; **cero puntos también basta**.

- `Aventura.getPrizeState()`: vista de solo lectura de `lastResult`, `bestResult`, `roundNumber`, `unlocked` y `opened`.
- `Aventura.restartGame()`: desde el regalo abierto, limpia y vuelve a montar únicamente la parte 4. Conserva el regalo y el récord.
- `Aventura.goToPart5()`: vuelve al premio desde 4 o 6, siempre que ya exista una partida completada.
- `Aventura.goToPart6()`: solo avanza desde 5 cuando la caja está abierta.
- `Aventura.registerPart6(renderer)`: entrada para la futura carta. Incluye un `h2` con `id="part-six-title"`. Recibe `goToPart5` para volver al regalo. Actualmente muestra únicamente **Continuará…**.

### Revisar el premio directamente

Ejecuta **`npm run dev:prize`** y abre **`http://127.0.0.1:4174`**. Recorre bienvenida, fecha y recuerdos. En la parte 4 aparecerá un control de prueba claramente identificado que simula partidas de 0, 3 o 5 puntos; sirve para comprobar apertura, repetición y récord. No es un juego y no se incluye en `dist`, en `npm run dev` ni al abrir `dist/index.html`.

**Acceso directo al regalo:** abre `http://127.0.0.1:4174/?preview=prize`. Esta vista local prepara una partida simulada y muestra directamente la parte 5, sin tener que recorrer las partes anteriores. También puedes pulsar **Ver el regalo directamente** en la franja de la vista de prueba.

Para comprobar variantes sin editar tus datos, usa `http://127.0.0.1:4174/?prize=photo`, `?prize=message` o `?prize=missing-photo` en esa misma vista de prueba. Cada carga comienza una visita nueva.

## Premios de cada juego

- **Nombres:** `names.her` es quien envía (firma) y `names.him` quien recibe ("Para ..."). Hoy: Obed envía, Estefania recibe.
- **Memorama (parte 3):** al encontrar todos los pares aparecen dos opciones: **Ver nuestras fotos** y **Leer mi carta** (sobre con una carta sobre recuerdos y memoria), cada una con **Regresar**. Texto en `gallery.letter` de `dist/config.js`.
- **Laberinto (parte 4):** la caja de regalo de la parte 5 trae un cupón de "tu comida favorita" (`prize.coupon`). Su botón "Seguir jugando →" abre "Arma el mensaje".
- **Arma el mensaje (parte 5):** al entrar al castillo, "Escuchar mi premio →" muestra una canción dedicada ("The Fate of Ophelia", Taylor Swift) con botones para Spotify, Apple Music y YouTube Music. Por defecto abren la búsqueda de la canción; pega el enlace exacto en `song.links` si lo tienes. Al abrir el premio suena el video oficial con letra en YouTube desde `song.climaxStart` (segundos; hoy 167 = 2:47). El reproductor necesita que la página se abra desde un servidor o hosting (no como archivo); si no carga, hay un enlace para abrir el clímax en YouTube. En iPhone puede pedir tocar play. Texto en `song`.

## Parte 5: "Arma el mensaje"

Antes del regalo hay un juego de plataformas al estilo clásico (`dist/platform-engine.js`, `dist/part5-mensaje.js`, `dist/mensaje.css`). El corazón golpea bloques corazón desde abajo y atrapa palabras flotantes; las nubecitas se apartan saltando encima y, si lo tocan, solo lo empujan. Al caer en un hueco vuelve al último punto seguro. La bandera solo se alcanza con todas las palabras. Si llega sin ellas aparece **¿Seguimos?** con **Regresar por las palabras** o **Avanzar sin premio →** (va a la parte 6 sin abrir la canción). La escalera final sube y baja, así que se puede regresar. Con todas las palabras, entonces baja por el mástil, entra al castillo, hay fuegos artificiales de corazones y el botón **Abrir mi regalo** muestra el regalo de siempre (`part5.js`, sin cambios en su lógica).

La frase está en `message.phrase` de `dist/config.js` (entre 3 y 8 palabras); las palabras se reparten solas por el nivel. `message.title` e `message.introduction` cambian los textos. Controles: flechas o A/D y espacio/W/flecha arriba; en celular aparecen botones. Si el regalo ya se abrió en la visita, la parte 5 lo muestra directamente.

## Parte 6: "Vuela, corazón"

Juego infinito tipo Flappy Bird (`dist/flappy-engine.js`, `dist/part6-flappy.js`, `dist/flappy.css`). Se aletea tocando el juego, con clic, espacio, W o flecha arriba. Cada columna superada suma un punto; la velocidad aumenta y el hueco se estrecha poco a poco, con límites para que siempre se pueda pasar. Al chocar aparece el puntaje y **Volar otra vez**. El **récord se guarda en el navegador** (`localStorage`, clave `aventura-flappy-record`), así que sigue ahí aunque se recargue la página; si el navegador no permite guardar, dura la visita. Mientras vuela, pasan frases de amor por el fondo (`flappy.phrases`, 30 frases en orden aleatorio, sin repetir hasta usarlas todas). Textos en `flappy` de `dist/config.js`. El botón del regalo ahora dice "Seguir jugando →" y lleva aquí.

## Parte 7: celebración final

Desde el Flappy, **Terminar la aventura →** abre la parte 7: «Misión cumplida · Feliz Día del Novio», confeti a pantalla completa (cañones desde las esquinas y lluvia de corazones), las misiones completadas (con el récord del Flappy), la foto de la bienvenida y un mensaje final firmado. **Crear imagen para compartir** genera una imagen vertical de 1080 × 1920 (formato de estado) con el título, los nombres, la fecha, la foto, los 5 recuerdos, las misiones, la frase, la canción y el récord; se puede **Guardar imagen** y, en celulares que lo permiten, **Compartir** directo (`dist/summary-image.js`). Necesita que la página se abra desde un servidor o hosting. **Celebrar otra vez** repite el confeti. Al llegar aquí la aventura queda terminada: el menú **¿A dónde quieres volver?** y los puntos del progreso (abajo a la derecha) llevan directo a cualquier parte. Textos en `final` de `dist/config.js` (`dist/part7-final.js`, `dist/final.css`).

## WhatsApp

El cupón del laberinto tiene el botón **Mandárselo a Obed por WhatsApp**, que abre WhatsApp con un mensaje ya escrito hacia `whatsapp.number` de `dist/config.js` (`dist/whatsapp.js`). Quien juega solo tiene que tocar Enviar. Si dejas el número vacío, los botones desaparecen.

## Sonidos

`dist/sounds.js` genera sonidos suaves de caja musical con Web Audio, sin archivos de audio ni conexión: campanita al tocar botones, dos notas ascendentes en los botones principales, notas descendentes al volver, arpegio al revelar la fecha, roce de papel al voltear cartas, destello al encontrar un par, notas graves suaves al fallar, melodía al ganar el memorama y un brillo al abrir el regalo. El botón con la bocina, junto a "Día del Novio", silencia o activa el sonido; la preferencia se recuerda en ese navegador. Para cambiar el sonido de un botón concreto, agrégale `data-sound="tap"` (u otro nombre de `SOUNDS`), o `data-sound="none"` para dejarlo en silencio.

## Archivos y comprobaciones

- `dist/styles.css`: estilo compartido y estilos de cada parte.
- `dist/part2.js`: calendario, gesto, revelación y recompensa.
- `dist/memory-tools.js`: validación de fecha y cálculo de cobertura.
- `dist/part3.js`: tarjetas, fotos, contador y celebración de la galería.
- `dist/gallery-tools.js`: seguimiento de recuerdos únicos y validación de la colección.
- `dist/part5.js`: caja, recompensa adaptable, resultados y navegación a la carta.
- `dist/prize-tools.js`: validación de resultados, récord y estado del regalo.
- `npm run check`: sintaxis de todos los scripts.
- `npm test`: 17 pruebas de carga de configuración, fechas, zonas horarias, raspado, galería, memorama y premio (cero puntos, repetición, récord y resultados inválidos).
