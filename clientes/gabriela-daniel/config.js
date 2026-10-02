/* Edita aquí los datos de la pareja. No hace falta modificar el HTML. */
window.COUPLE_CONFIG = {
  names: {
    her: "Gabriela", // Quien dedica: firma cartas, cupón y canción.
    him: "Daniel", // Quien recibe: aparece como "Para ...".
  },
  photo: {
    src: "./assets/pareja.jpeg",
    alt: "Nuestra foto favorita juntos",
    fit: "contain",
    position: "50% 50%",
  },
  text: {
    pageTitle: "Gabriela + Daniel · Nuestra aventura",
    occasion: "Día del Novio",
    eyebrow: "Una historia, dos protagonistas",
    title: "Nuestra aventura comienza aquí",
    // Esta parte del título se resaltará si coincide con su final.
    titleAccent: "comienza aquí",
    message: "Preparé algo especial para celebrar este día contigo. ¿Estás listo?",
    button: "Comenzar nuestra aventura ❤️",
    startNote: "Al comenzar, sonará nuestra canción",
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
    date: { year: 2023, month: 8, day: 4 },
    photo: {
      // Puedes usar otra foto aquí sin cambiar la de la bienvenida.
      src: "./fotos/recuerdo-05.jpeg",
      alt: "Gabriela y Daniel abrazados, un recuerdo de nuestra historia",
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
      title: "Una carta para Daniel",
      greeting: "",
      image: {
        src: "./assets/carta-gabriela-daniel.jpeg",
        alt: "Carta ilustrada de amor que Gabriela dedica a Daniel",
      },
      paragraphs: [
        "Quiero decirte esto desde lo más profundo de mi corazón. Eres el hombre que quiero en mi vida, y la persona que le dio sentido a todo lo que antes parecía un desastre. La verdad es que yo soy un caos, a veces no sé ni cómo seguir, pero desde que estás conmigo, todo cambió.",
        "Tu presencia, tu cariño, incluso un simple mensaje tuyo hacen que me olvide por un momento de todos mis problemas. Aunque mi mundo sea un desastre, tú eres lo más maravilloso dentro de él. Me haces sentir que vale la pena seguir, que no todo está perdido.",
        "A veces me pongo a pensar que no te merezco, que no soy suficiente para alguien como tú. Tú mereces tanto, pero te prometo que me esfuerzo cada día por darte lo mejor de mí. Porque te amo con todo mi ser, y voy a seguir luchando por este amor que tenemos.",
        "El amor que te tengo es tan grande que atraviesa cualquier espacio. Con un solo mensaje me haces sentir como la niña más feliz del mundo.",
        "Gracias por amarme como soy. Gracias por no soltarme. Gracias por seguir a mi lado. Te amo mucho, no se te olvide.",
      ],
      signature: "", // Vacío firma "Con todo mi amor, " + names.her.
    },
    // AGREGA O EDITA AQUÍ TUS RECUERDOS (entre 4 y 10).
    // Mantén un id distinto por tarjeta. Las pistas y frases son ejemplos editables.
    // Las fotos están en dist/fotos.
    memories: [
      {
        id: "recuerdo-01",
        clue: "Tú y yo",
        photo: { src: "./fotos/recuerdo-01.jpeg", alt: "Gabriela y Daniel juntos", fit: "contain", position: "50% 50%" },
        phrase: "Mi parte favorita de cualquier momento es compartirlo contigo.",
        date: "", // Opcional. Se muestra tal como lo escribas.
        place: "", // Opcional: escribe aquí el lugar.
      },
      {
        id: "recuerdo-02",
        clue: "Una de nuestras risas",
        photo: { src: "./fotos/recuerdo-02.jpeg", alt: "Un recuerdo de Gabriela y Daniel", fit: "contain", position: "50% 50%" },
        phrase: "Contigo, hasta los días más sencillos tienen algo especial.",
        date: "",
        place: "",
      },
      {
        id: "recuerdo-03",
        clue: "Un día para guardar",
        photo: { src: "./fotos/recuerdo-03.jpeg", alt: "Dos dedos con caritas y un corazón", fit: "contain", position: "50% 50%" },
        phrase: "Hay momentos que quisiera volver a vivir mil veces.",
        date: "",
        place: "",
      },
      {
        id: "recuerdo-04",
        clue: "Mi lugar favorito",
        photo: { src: "./fotos/recuerdo-04.jpeg", alt: "Gabriela y Daniel en una foto juntos", fit: "contain", position: "50% 50%" },
        phrase: "Donde sea, siempre que sea contigo.",
        date: "",
        place: "",
      },
      {
        id: "recuerdo-05",
        clue: "Lo bonito de encontrarnos",
        photo: { src: "./fotos/recuerdo-05.jpeg", alt: "Daniel abraza a Gabriela y le da un beso", fit: "contain", position: "50% 50%" },
        phrase: "Qué suerte coincidir contigo en esta aventura.",
        date: "",
        place: "",
      },
      {
        id: "recuerdo-06",
        clue: "A tu lado",
        photo: { src: "./fotos/recuerdo-06.jpeg", alt: "Gabriela y Daniel sentados juntos en una foto en blanco y negro", fit: "contain", position: "50% 50%" },
        phrase: "A tu lado, cada instante se convierte en un recuerdo bonito.",
        date: "",
        place: "",
      },
      {
        id: "recuerdo-07",
        clue: "Nuestro mejor equipo",
        photo: { src: "./fotos/recuerdo-07.jpeg", alt: "Gabriela y Daniel sonriendo junto a una fuente", fit: "contain", position: "50% 50%" },
        phrase: "Me encanta la vida cuando la comparto contigo.",
        date: "",
        place: "",
      },
      {
        id: "recuerdo-08",
        clue: "Una sonrisa contigo",
        photo: { src: "./fotos/recuerdo-08.jpeg", alt: "Gabriela y Daniel en una selfie", fit: "contain", position: "50% 50%" },
        phrase: "Tu compañía siempre me regala una sonrisa.",
        date: "",
        place: "",
      },
      {
        id: "recuerdo-09",
        clue: "Los días sencillos",
        photo: { src: "./fotos/recuerdo-09.jpeg", alt: "Una selfie de Gabriela y Daniel juntos", fit: "contain", position: "50% 50%" },
        phrase: "Los días más sencillos se vuelven especiales contigo.",
        date: "",
        place: "",
      },
      {
        id: "recuerdo-10",
        clue: "Más aventuras juntos",
        photo: { src: "./fotos/recuerdo-10.jpeg", alt: "Gabriela y Daniel compartiendo otro momento", fit: "contain", position: "50% 50%" },
        phrase: "Quiero seguir sumando aventuras a tu lado.",
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
    recipientName: "", // Vacío usa names.him (Daniel). Escribe aquí un apodo si prefieres.
    type: "coupon", // "coupon", "photo" o "message": el diseño se adapta solo.
    coupon: {
      label: "Cupón canjeable",
      text: "Vale por tu comida favorita: tú eliges qué y dónde, yo invito",
      footnote: "Válido cuando tengas antojo. Sin fecha de caducidad.",
    },
    photo: {
      src: "./assets/pareja.jpeg", // Reemplaza por tu foto especial real.
      alt: "Una foto especial de Gabriela y Daniel",
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
    name: "Hasta mi final",
    artist: "El Trono de México",
    dedication: "Esta canción es para ti. Cada vez que la escuches, acuérdate de este castillo, de nuestro mensaje y de que siempre voy a elegirte.",
    // Pega aquí el enlace exacto de la canción si lo tienes; si no, se abre la búsqueda.
    links: { spotify: "", appleMusic: "", youtubeMusic: "" },
    // Audio adjunto por el cliente. Se reproduce dentro del regalo.
    audioSrc: "./assets/hasta-mi-final.mp3",
    youtubeId: "",
    climaxStart: 0,
    playButton: "Escuchar nuestra canción otra vez",
    note: "Esta canción es para ti. Puedes escucharla aquí o guardarla en tu playlist.",
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
    number: "529601866290", // Con código de país (52 = México), sin espacios ni signos.
    buttonLabel: "Mandárselo a {nombre} por WhatsApp",
  },
  totalParts: 7,
};
