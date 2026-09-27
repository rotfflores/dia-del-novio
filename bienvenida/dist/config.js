/* Edita aquí los datos de la pareja. No hace falta modificar el HTML. */
window.COUPLE_CONFIG = {
  names: {
    her: "Estefania",
    him: "Obed",
  },
  photo: {
    // Guarda la foto real en dist/assets/pareja.jpg, o cambia esta ruta.
    src: "./assets/pareja.jpeg",
    alt: "Nuestra foto favorita juntos",
    // "contain" muestra la imagen completa y evita recortar los rostros.
    // Usa "cover" solo si quieres llenar el marco con un recorte.
    fit: "contain",
    position: "50% 50%", // Por ejemplo: "50% 25%" para priorizar la parte superior.
  },
  text: {
    pageTitle: "Tú + yo · Nuestra aventura",
    occasion: "Día del Novio",
    eyebrow: "Una historia, dos protagonistas",
    title: "Nuestra aventura comienza aquí",
    // Esta parte del título se resaltará si coincide con su final.
    titleAccent: "comienza aquí",
    message: "Preparé algo especial para celebrar este día contigo. ¿Estás listo?",
    button: "Comenzar nuestra aventura ❤️",
    startNote: "El primer capítulo de algo bonito",
    photoCaption: "Mi lugar favorito siempre será contigo.",
    photoTag: "MI PERSONA FAVORITA",
    placeholderTitle: "Nuestra foto favorita",
    placeholderMessage: "Este espacio es para nosotros.",
    placeholderMemory: "TÚ & YO · RECUERDO 001",
    footnote: "Hecho con amor, solo para ti",
    nextTitle: "Continuará…",
    nextMessage: "Lo que sigue de nuestra historia está por llegar.",
    backButton: "Volver a la bienvenida",
    nextBackButton: "Volver a nuestra fecha",
  },
  memory: {
    // Fecha de noviazgo: cambia únicamente estos tres números.
    // El mes va del 1 (enero) al 12 (diciembre). No uses un texto con zona horaria.
    date: { year: 2025, month: 6, day: 21 },
    photo: {
      // Puedes usar otra foto aquí sin cambiar la de la bienvenida.
      src: "./assets/pareja.jpeg",
      alt: "Estefania y Obed, un recuerdo de nuestra historia",
      fit: "contain",
      position: "50% 50%",
    },
    phrase: "Y desde entonces, cada momento contigo se volvió especial",
    text: {
      title: "El día que comenzó todo",
      introduction: "Hay fechas que cambian nuestra historia para siempre…",
      coverTitle: "Un día cambió todo.",
      coverMessage: "Y este recuerdo es nuestro.",
      scratchHint: "Desliza el dedo para revelar la fecha",
      mouseHint: "También puedes arrastrar con el mouse",
      revealButton: "Revelar fecha",
      revealedLabel: "Recuerdo desbloqueado",
      calendarLabel: "Nuestro primer capítulo",
      dateMessage: "Desde el {fecha}, tú y yo comenzamos esta aventura ❤️",
      continueButton: "Ver nuestros recuerdos →",
      backButton: "Volver a la bienvenida",
      photoPlaceholder: "Un recuerdo de los dos",
    },
  },
  totalParts: 7,
};
