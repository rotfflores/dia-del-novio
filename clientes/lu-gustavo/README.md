# Gus + Lu

Copia independiente para su primer aniversario. Inicio de la relación: 14 de octubre de 2025.

- Foto 1: portada. Foto del carrusel enviada después: junto a la fecha. Siete fotos en el memorama.
- Carta completa entregada por Lu.
- Canción: Perfect Symphony, Ed Sheeran con Andrea Bocelli, versión «Lyrics». Comienza después de una interacción; el botón de sonido permite silenciarla.
- Regalo sorpresa: «Vale por una cena juntos».
- Pendiente: WhatsApp.
- Vista local: `node preview.mjs`, http://127.0.0.1:4186/
- Configuración: `config.js`.
- Publicación: https://dia-del-novio.rotfstudio.com/clientes/lu-gustavo/

## Misión mágica (parte 8)

Acceso temporal para revisar sin jugar: añadir `?revision=mision` al enlace de la página. Abre directamente la bienvenida de la misión. Su progreso se guarda en una clave separada terminada en `-revision`, de modo que no desbloquea la misión del recorrido normal. Retirar el bloque `reviewMode` de `mission.js` al terminar la revisión.

El último juego es infinito. Una ronda terminada, incluso con cero puntos, desbloquea la misión. Usar «Terminar la aventura» antes de jugar conserva la celebración original, pero no desbloquea la misión. Después del desbloqueo aparece también «Continuar la misión mágica» en la bienvenida para retomar tras una recarga.

El cierre comienza con «¡Misión cumplida, mago! ⚡» y continúa directamente con la nota de Lu y la respuesta escrita. No revela el regalo ni muestra tarjetas provisionales. Las opciones se editan al principio de `mission.js`, en `missionConfig`:

- `giftTitle`, `giftDescription` y `giftImage`: vacíos para omitir la tarjeta y conservar la sorpresa. Solo si se completan se muestra una tarjeta adicional.
- `giftImage`: si se activa la tarjeta, admite una ruta `./assets/archivo.jpg` o URL HTTPS. Vacío usa un sobre SVG original.
- `eventDate`: fecha de la tarjeta y de la frase final. Predeterminado: «Febrero de 2027».
- `saveWrittenAnswer` y `answerWebhook`: reservados para una futura integración. No activan ningún envío. La respuesta siempre se guarda solo en el navegador con el resto del progreso.

`mission-state.js` valida el orden y persiste el progreso bajo `aventura-lu-gustavo-mision-magica-v1`. Si se borran los datos del navegador o se cambia de dispositivo, no se transfiere el progreso. El evento local `mission:answer-saved` en la sección sirve como punto de extensión para una futura integración autorizada.

`mission.css` contiene todos los estilos nuevos, limitados a la misión. Al abrir la parte 8, el documento recibe la clase `is-mission-mode`: el fondo pasa a una noche estrellada que ocupa toda la pantalla, el encabezado cambia a tonos dorados y el pie se oculta. Al volver a la celebración todo regresa al diseño normal. Cada prueba usa una tarjeta de dos columnas (ilustración y acertijo) que en celular se apila. Donde el navegador lo permite (no en iPhone), la misión entra en pantalla completa al pulsar «Juro que mis intenciones no son buenas» o «Continuar la misión mágica», y el botón de esquinas arriba a la derecha alterna ese modo. No hay dependencias externas ni imágenes oficiales.

Fondo: `assets/mission-hogwarts.mp4` (video del castillo en bucle, sin audio, 4 MB) con póster `assets/mission-hogwarts.jpg`. Se descarga solo al entrar a la misión. En pantallas horizontales el video se ve nítido al centro sobre una copia difuminada; en la bienvenida de escritorio el castillo queda a la derecha y se desliza al centro al empezar. Con `prefers-reduced-motion` se muestra solo el póster. Canción de la misión: `missionSong` en `config.js` (`assets/a-window-to-the-past.mp3`). Al entrar a la parte 8 la canción principal se desvanece y cambia; al salir vuelve donde se quedó. Nunca suena sin una interacción previa. `assets/mission-observatory.svg` ya no se usa. Símbolos SVG en `mission.js`, un mapa con camino iluminado y la nota final sobre pergamino. Conserva las tipografías de la página. Las animaciones son breves y se desactivan con `prefers-reduced-motion`. El resto del sitio conserva su diseño.

Pruebas: instalar `jsdom` como herramienta de desarrollo (no es dependencia del sitio) y ejecutar `node --test tests/mission.test.cjs` desde esta carpeta. Incluyen navegación de los juegos anteriores, finalización real de una ronda, bloqueos, respuestas, persistencia, contenido configurable y ausencia de reproducción al cargar. La simulación DOM a 360 y 1280 píxeles no sustituye una revisión visual en dispositivos reales.

Verificación en navegador realizada a 390, 360 y 1280 píxeles: recorrido de los juegos anteriores, bloqueo si no se juega la ronda final, desbloqueo al terminar una ronda, dos respuestas incorrectas y una correcta del hipogrifo, orden incorrecto y correcto del hechizo, respuesta obligatoria y persistencia tras recargar, notas secuenciales con toque y teclado, persistencia parcial de notas y revelación final. Sin errores de consola ni desbordamiento horizontal en los anchos revisados.

Al final de la misión hay dos botones. «Compartir mi misión por WhatsApp» abre WhatsApp con un resumen de las cuatro pruebas, incluido el recuerdo escrito, para que la persona elija el contacto. `whatsappNumber` en `missionConfig` queda vacío para no publicar un número personal. «Repetir la misión mágica» borra el progreso de la misión, conserva el desbloqueo y vuelve a la bienvenida.
