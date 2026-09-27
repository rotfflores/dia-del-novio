/* Edita aquí los datos de la pareja. No hace falta modificar el HTML. */
window.COUPLE_CONFIG = {
  names: {
    her: "Obed", // Primer nombre: quien envía (firma cartas, cupón y canción).
    him: "Estefania", // Segundo nombre: quien recibe (aparece como "Para ...").
  },
  photo: {
    src: "./assets/pareja.jpeg",
    alt: "Nuestra foto favorita juntos",
    fit: "contain",
    position: "50% 50%",
  },
  text: {
    pageTitle: "Tú + yo · Nuestra aventura",
    occasion: "Día del Novio",
    eyebrow: "Una historia, dos protagonistas",
    title: "Nuestra aventura comienza aquí",
    // Esta parte del título se resaltará si coincide con su final.
    titleAccent: "comienza aquí",
    message: "Preparé algo especial para celebrar este día contigo. ¿Estás lista?",
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
  gallery: {
    text: {
      title: "Nuestros pequeños grandes momentos",
      introduction: "Toca cada recuerdo para volver a vivirlo conmigo",
      collectionLabel: "Guardados con amor",
      progressLabel: "Recuerdos descubiertos: {count} de {total}",
      openLabel: "Toca para abrir",
      closeLabel: "Cerrar recuerdo",
      discoveredLabel: "Descubierto",
      photoPlaceholder: "Aquí vive otro recuerdo",
      placeholderDetail: "Un espacio para nuestra foto.",
      completedTitle: "Cada recuerdo, otra razón para elegirte.",
      completedMessage: "Ya descubriste todos nuestros momentos.",
      continueButton: "¡Vamos a jugar! →",
      backButton: "Volver a nuestra fecha",
      nextBackButton: "Volver a nuestros recuerdos",
    },
    // Textos del memorama. {count}, {total} y {moves} se reemplazan solos.
    game: {
      introduction: "Voltea dos cartas y encuentra cada par de nuestros recuerdos",
      progressLabel: "Pares encontrados: {count} de {total}",
      movesLabel: "Intentos: {moves}",
      foundTitle: "Recuerdos desbloqueados",
      completedMessage: "Encontraste todos nuestros recuerdos en {moves} intentos.",
    },
    // Premio del memorama: la carta que aparece al encontrar todos los pares.
    letter: {
      title: "Una carta para nuestros recuerdos",
      greeting: "Mi amor:",
      paragraphs: [
        "Dicen que la memoria guarda lo que el corazón no quiere soltar. Por eso cada foto de este memorama no es solo una imagen: es un pedacito de nosotros que decidí cuidar para siempre.",
        "Me encanta pensar que tenemos una colección que nadie más tiene: nuestras risas, los días que quisiera volver a vivir y los lugares que se volvieron nuestros solo porque estábamos juntos.",
        "Aunque el tiempo pase y algunos detalles se vuelvan borrosos, sé que lo importante se queda: cómo me haces sentir, la calma que encuentro a tu lado y las ganas de seguir sumando momentos.",
        "Gracias por cada recuerdo. Prometo seguir haciendo espacio en mi memoria, y en mi corazón, para todos los que nos faltan.",
      ],
      signature: "", // Vacío firma "Con todo mi amor, " + names.her.
    },
    // AGREGA O EDITA AQUÍ TUS RECUERDOS (entre 4 y 6).
    // Mantén un id distinto por tarjeta. Las pistas y frases son ejemplos editables.
    // Las fotos están en dist/fotos.
    memories: [
      {
        id: "recuerdo-01",
        clue: "Tú y yo",
        photo: { src: "./fotos/foto1-tu-y-yo.jpg", alt: "Estefania y Obed juntos", fit: "contain", position: "50% 50%" },
        phrase: "Mi parte favorita de cualquier momento es compartirlo contigo.",
        date: "", // Opcional: por ejemplo, "21 de junio de 2025". Se muestra tal como lo escribas.
        place: "", // Opcional: escribe aquí el lugar.
      },
      {
        id: "recuerdo-02",
        clue: "Una de nuestras risas",
        photo: { src: "./fotos/foto3-nuestras-risas.jpg", alt: "Un recuerdo de nuestras risas", fit: "contain", position: "50% 50%" },
        phrase: "Contigo, hasta los días más sencillos tienen algo especial.",
        date: "",
        place: "",
      },
      {
        id: "recuerdo-03",
        clue: "Un día para guardar",
        photo: { src: "./fotos/foto2-un-dia-para-guardar.jpg", alt: "Un día especial de los dos", fit: "contain", position: "50% 50%" },
        phrase: "Hay momentos que quisiera volver a vivir mil veces.",
        date: "",
        place: "",
      },
      {
        id: "recuerdo-04",
        clue: "Mi lugar favorito",
        photo: { src: "./fotos/foto4-mi-lugar-favorito.jpg", alt: "Juntos en nuestro lugar favorito", fit: "contain", position: "50% 75%" },
        phrase: "Donde sea, siempre que sea contigo.",
        date: "",
        place: "",
      },
      {
        id: "recuerdo-05",
        clue: "Lo bonito de encontrarnos",
        photo: { src: "./fotos/foto5-encontrarnos.jpg", alt: "Otro momento de nuestra historia", fit: "contain", position: "50% 50%" },
        phrase: "Qué suerte coincidir contigo en esta aventura.",
        date: "",
        place: "",
      },
    ],
  },
  // PARTE 4 · Partidas de 45 a 90 segundos. El récord se guarda en este navegador.
  game: {
    title: "Laberinto del amor",
    instruction: "Recoge los corazones y esquiva los malentendidos",
    durationSeconds: 60,
    resultMessage: "Lo bonito es jugar contigo. Tu sorpresa está lista, sin importar los puntos.",
  },
  // PARTE 5 · "Arma el mensaje": juego de plataformas. Al llegar al castillo se abre el regalo.
  message: {
    // La frase que se arma: entre 3 y 8 palabras, separadas por espacios.
    phrase: "Mi lugar favorito siempre será contigo",
    title: "Arma el mensaje",
    introduction: "Guía a mi corazón por el camino: junta todas las palabras y llévalas al castillo.",
  },
  // PARTE 5 · Premio del laberinto (parte 4): la caja de regalo con el cupón.
  prize: {
    recipientName: "", // Vacío usa names.him (Estefania). Escribe aquí un apodo si prefieres.
    type: "coupon", // "coupon", "photo" o "message": el diseño se adapta solo.
    coupon: {
      label: "Cupón canjeable",
      text: "Vale por tu comida favorita: tú eliges qué y dónde, yo invito",
      footnote: "Válido cuando tengas antojo. Sin fecha de caducidad.",
    },
    photo: {
      src: "./assets/pareja.jpeg", // Reemplaza por tu foto especial real.
      alt: "Una foto especial de Estefania y Obed",
      fit: "contain", // Imagen completa; usa cover y position para ajustar el recorte.
      position: "50% 50%",
      caption: "Mi premio favorito es compartir la vida contigo.",
    },
    surpriseMessage: "Entre todas las cosas bonitas que me han pasado, tú sigues siendo mi favorita.",
    message: "Ganaste el laberinto, así que te toca consentirte. Dime qué se te antoja y ahí estaré.",
    text: {
      title: "¡Ganaste el laberinto!",
      introduction: "Sabía que ibas a llegar hasta aquí. Este premio es solo para ti ❤️",
      recipient: "Para {nombre}",
      openButton: "Abrir mi regalo",
      openHint: "Toca la caja. Hay algo bonito dentro.",
      openedHint: "Una sorpresa guardada para ti.",
      unlocked: "Premio desbloqueado",
      rewardTitle: "Un regalo solo para ti",
      photoPlaceholder: "Aquí te espera una foto especial",
      replayButton: "Jugar otra vez",
      continueButton: "Seguir jugando →",
      nextBackButton: "Volver a mi premio",
    },
  },
  // PARTE 5 · Premio de "Arma el mensaje": una canción dedicada.
  song: {
    name: "The Fate of Ophelia",
    artist: "Taylor Swift",
    dedication: "Esta canción es para ti. Cada vez que la escuches, acuérdate de este castillo, de nuestro mensaje y de que siempre voy a elegirte.",
    // Pega aquí el enlace exacto de la canción si lo tienes; si no, se abre la búsqueda.
    links: { spotify: "", appleMusic: "", youtubeMusic: "" },
    // Al abrir el premio suena la canción desde este segundo (clímax). Ajusta si quieres otro momento.
    youtubeId: "rbmdfEQODOw", // Video oficial con letra en YouTube.
    climaxStart: 167, // 2:47
  },
  // PARTE 6 · "Vuela, corazón": juego infinito; el récord se guarda en el navegador.
  flappy: {
    title: "Vuela, corazón",
    introduction: "Toca para aletear y cruza entre las columnas. Es infinito: ¿hasta dónde llegas?",
    backButton: "Volver a mi canción",
    // Frases que pasan por el fondo mientras vuela, en orden aleatorio. Agrega o quita las que quieras.
    phrases: [
      "Cada día contigo es mi favorito",
      "Eres mi lugar seguro",
      "Me haces reír como nadie",
      "Contigo todo es más bonito",
      "Gracias por elegirme",
      "Te quiero más que ayer",
      "Eres mi persona favorita",
      "Juntos llegamos más lejos",
      "Eres mi mejor aventura",
      "Sigue volando, mi amor",
      "Tu risa es mi canción favorita",
      "Mi corazón vuela contigo",
      "Eres mi casualidad más bonita",
      "Contigo, hasta lo simple es especial",
      "Me encanta nuestra historia",
      "Eres mi calma y mi locura",
      "Quiero mil aventuras más contigo",
      "Tus abrazos son mi hogar",
      "Siempre voy a elegirte",
      "Eres lo mejor de mis días",
      "Contigo el tiempo vuela",
      "Mi lugar favorito eres tú",
      "Gracias por existir",
      "Eres mi sueño cumplido",
      "Te pienso a cada rato",
      "Contigo todo tiene sentido",
      "Nunca dejes de sonreír",
      "Eres mi premio mayor",
      "Qué bonito es quererte",
      "Tú y yo, siempre",
    ],
  },
  // PARTE 7 · Celebración final.
  final: {
    title: "Misión cumplida",
    subtitle: "Feliz Día del Novio",
    message: "Llegaste hasta el final de nuestra aventura: revelaste nuestra fecha, encontraste nuestros recuerdos, cruzaste el laberinto, armaste nuestro mensaje y volaste tan alto como pudiste. Así como en cada juego, en la vida también quiero seguir superando niveles contigo. Gracias por ser mi persona favorita.",
    signature: "", // Vacío firma "Con todo mi amor, " + names.her.
  },
  // El cupón del laberinto trae un botón para mandárselo por WhatsApp a quien envía (names.her).
  whatsapp: {
    number: "526182051723", // Con código de país (52 = México), sin espacios ni signos.
    buttonLabel: "Mandárselo a {nombre} por WhatsApp",
  },
  totalParts: 7,
};
