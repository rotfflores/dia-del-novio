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

El último juego es infinito. Una ronda terminada, incluso con cero puntos, desbloquea la misión. Usar «Terminar la aventura» antes de jugar conserva la celebración original, pero no desbloquea la misión. Después del desbloqueo aparece también «Continuar la misión mágica» en la bienvenida para retomar tras una recarga.

El regalo se edita al principio de `mission.js`, en `missionConfig`:

- `giftTitle` y `giftDescription`: título y descripción. Actualmente contienen los marcadores solicitados, pendientes del regalo real.
- `giftImage`: ruta `./assets/archivo.jpg` o URL HTTPS. Vacío muestra el sobre SVG original.
- `eventDate`: fecha de la tarjeta y de la frase final. Predeterminado: «Febrero de 2027».
- `saveWrittenAnswer` y `answerWebhook`: reservados para una futura integración. No activan ningún envío. La respuesta siempre se guarda solo en el navegador con el resto del progreso.

`mission-state.js` valida el orden y persiste el progreso bajo `aventura-lu-gustavo-mision-magica-v1`. Si se borran los datos del navegador o se cambia de dispositivo, no se transfiere el progreso. El evento local `mission:answer-saved` en la sección sirve como punto de extensión para una futura integración autorizada.

`mission.css` contiene todos los estilos nuevos, limitados a la misión. No hay dependencias externas ni imágenes oficiales.

Pruebas: instalar `jsdom` como herramienta de desarrollo (no es dependencia del sitio) y ejecutar `node --test tests/mission.test.cjs` desde esta carpeta. Incluyen navegación de los juegos anteriores, finalización real de una ronda, bloqueos, respuestas, persistencia, contenido configurable y ausencia de reproducción al cargar. La simulación DOM a 360 y 1280 píxeles no sustituye una revisión visual en dispositivos reales.
