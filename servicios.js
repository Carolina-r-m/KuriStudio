// Carta completa que sale en las ventanas de cada categoría.
// Cada servicio va así: [nombre, precio, duración, descripción (opcional)]
// Si cambia un precio, cambiarlo también en netlify/functions/chat.mjs para que el asistente no se líe.
window.KURI_SERVICIOS = {
  // Manicura
  manicura: {
    title: "Manicura",
    intro: "Nivelación, nail art a mano alzada y extensiones. Uñas fuertes, bonitas y pensadas para tus manos.",
    img: "assets/img/nails1.jpg",
    groups: [
      { name: "Esmaltado y cuidado", items: [
        ["Masaje de manos", "8 €", "15 min"],
        ["Manicura rusa sin esmaltado", "13 €", "30 min", "Limado, preparación de cutícula e hidratación de manos."],
        ["Esmaltado semipermanente express", "16 €", "30 min", "Limado, limpieza superficial de cutículas y esmaltado."],
        ["Manicura semipermanente sin refuerzo", "20 €", "40 min", "La manicura semipermanente de siempre."],
        ["Manicura japonesa", "23 €", "45 min", "Nutre y fortalece la uña en profundidad y le da un brillo natural."]
      ]},
      { name: "Nivelación y refuerzo", items: [
        ["Semipermanente con nivelación", "25 €", "50 min", "Fortalece tus uñas y corrige imperfecciones con rubber o gel."],
        ["Refuerzo con polygel", "28 €", "1 h 15 min", "Refuerzo y nivelación en acrygel."],
        ["Manicura rusa + nivelación", "30 €", "1 h 15 min", "Limpieza exhaustiva de la cutícula y esmaltado con sellado."]
      ]},
      { name: "Extensiones y rellenos", items: [
        ["Soft gel", "desde 30 €", "1 h 15 min", "Extensión con técnica soft gel."],
        ["Extensión de gel", "desde 35 €", "1 h", "Precio según el largo."],
        ["Extensión de polygel", "desde 38 €", "1 h 30 min", "Precio según el largo."],
        ["Extensión de acrílico", "desde 42 €", "1 h 30 min", "Precio según el largo."],
        ["Relleno soft gel", "26 €", "1 h 15 min"],
        ["Relleno acrílico, gel o polygel", "desde 34 €", "1 h 30 min"],
        ["Arreglo de uña", "Gratis", "15 min", "Hasta 3 semanas después de tu manicura."]
      ]}
    ]
  },
  // Mirada
  mirada: {
    title: "Mirada",
    intro: "Cejas diseñadas por visagismo y pestañas que abren la mirada, siempre a tu medida.",
    img: "assets/img/brow3.jpg",
    groups: [
      { name: "Cejas", items: [
        ["Diseño de cejas HD con cera", "9 €", "15 min", "Visagismo y depilación con cera."],
        ["Diseño de cejas HD con hilo", "12 €", "15 min", "Medición de las cejas y depilación con hilo."],
        ["Tinte de cejas", "8 €", "20 min"],
        ["Diseño de cejas con henna", "23 €", "40 min", "Define la mirada y rellena pequeñas calvas."],
        ["Laminado de cejas sin depilación", "30 €", "40 min", "Cejas visualmente más gruesas y definidas."],
        ["Laminado de cejas + depilación", "35 €", "45 min", "Cejas visualmente más gruesas y definidas."]
      ]},
      { name: "Pestañas", items: [
        ["Lifting de pestañas + tinte", "38 €", "1 h"],
        ["Lifting + laminado + depilación", "62 €", "1 h 20 min", "El combo completo para elevar la mirada."],
        ["Extensiones de pestañas", "desde 45 €", "2 h"],
        ["Relleno de extensiones", "38 €", "1 h 30 min"]
      ]}
    ]
  },
  // Facial
  facial: {
    title: "Facial",
    intro: "Rituales para desconectar y cuidar tu piel y tus labios.",
    img: "assets/img/lips.jpg",
    groups: [
      { name: "Tratamientos", items: [
        ["Higiene facial con cosmética coreana", "35 €", "1 h", "Con limpiador ultrasónico."],
        ["Ritual facial Gua Sha", "25 €", "30 min", "Un viaje sensorial que libera la tensión acumulada del rostro."],
        ["Tratamiento Glossy Lips", "35 €", "40 min", "Labios profundamente hidratados."],
        ["Bono 4 sesiones Glossy Lips", "135 €", "40 min / sesión", "Recomendado para mayor efectividad."]
      ]}
    ]
  },
  // Pedicura, depilación y retiradas
  pedicura: {
    title: "Pedicura y depilación",
    intro: "Pies cuidados de verdad y depilación facial con hilo o cera.",
    img: "assets/img/flowers.jpg",
    groups: [
      { name: "Pedicura", items: [
        ["Pedicura completa sin esmaltado", "18 €", "30 min", "Exfoliación, preparación de la uña y retirada de durezas."],
        ["Pedicura esmaltado semipermanente", "20 €", "35 min"],
        ["Pedicura completa semipermanente", "25 €", "45 min", "Exfoliación, uñas, durezas y esmaltado."],
        ["Esmaltado completo manos y pies", "38 €", "1 h 15 min"],
        ["Esmaltado completo pro", "47 €", "1 h 35 min", "Manos con nivelación y pedicura completa con esmaltado."]
      ]},
      { name: "Depilación con hilo", items: [
        ["Mentón", "5 €", "5 min"], ["Labio", "6 €", "5 min"], ["Patillas", "6 €", "10 min"],
        ["Cejas", "9 €", "10 min"], ["Ceja + labio", "13 €", "15 min"], ["Rostro completo", "22 €", ""]
      ]},
      { name: "Depilación con cera", items: [
        ["Mentón", "3 €", "5 min"], ["Labio", "4 €", "5 min"], ["Patillas", "4 €", "10 min"],
        ["Cejas", "6 €", "10 min"], ["Cejas + labio", "8 €", "15 min"], ["Rostro completo", "15 €", "20 min"]
      ]},
      { name: "Retiradas", items: [
        ["De otro centro, al hacerte la manicura", "5 €", "", "Si vienes con uñas de otro sitio y te haces la manicura aquí."],
        ["Semipermanente pies", "6 €", "15 min", "Incluye corte de uñas y preparación de cutícula."],
        ["Semipermanente manos", "9 €", "30 min"],
        ["Acrílico o gel", "13 €", "40 min"]
      ]}
    ]
  }
};
