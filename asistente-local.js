// Respuestas de Kuri sin IA.
// Si la IA no contesta (sin saldo, sin conexión...), el chat usa esto para no dejar a nadie colgado.
// Saca los precios de servicios.js, así que si cambia un precio allí, aquí se actualiza solo.
// Solo dice cosas confirmadas del estudio: si añades una respuesta, que sea un dato real.
(function () {
  "use strict";

  var BOOKSY = "https://kuristudio.booksy.com/a";
  var WHATSAPP = "+34 695 16 81 91";
  var MAPS = "https://www.google.com/maps/search/?api=1&query=Kuri+Studio+Obispo+Segura+Saez+5+Caceres";

  // Quita tildes y mayúsculas para comparar
  function norm(s) {
    return String(s).toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/[^a-z0-9ñ€ ]/g, " ");
  }
  function has(t, words) {
    return words.some(function (w) { return t.indexOf(w) !== -1; });
  }

  // Todos los servicios de la carta en una lista: { name, price, time, desc, cat }
  function allServices() {
    var out = [];
    var data = window.KURI_SERVICIOS || {};
    Object.keys(data).forEach(function (key) {
      data[key].groups.forEach(function (g) {
        g.items.forEach(function (it) {
          out.push({ name: it[0], price: it[1], time: it[2], desc: it[3] || "", cat: key, group: g.name });
        });
      });
    });
    return out;
  }

  function line(s) {
    var extra = s.desc ? " (" + s.desc.replace(/\.$/, "") + ")" : "";
    var name = /Depilación|Retiradas/.test(s.group) ? s.group + ": " + s.name.toLowerCase() : s.name;
    return "· " + name + ": " + s.price + (s.time ? ", " + s.time : "") + extra;
  }

  // Palabras que no sirven para buscar un servicio
  var STOP = ["cuanto", "cuesta", "vale", "precio", "precios", "tienes", "teneis", "hay", "haceis", "hacer", "quiero", "puedo", "para", "como", "que", "una", "unas", "los", "las", "del", "con", "sin", "por", "mas", "me", "mi", "el", "la", "de", "y", "o", "en", "es", "un", "al", "se", "lo", "tu", "te"];

  // Busca servicios por nombre ("soft gel", "henna", "gua sha"...)
  function findServices(t) {
    var words = t.split(/\s+/).filter(function (w) { return w.length >= 3 && STOP.indexOf(w) === -1; });
    if (!words.length) return [];
    var scored = allServices().map(function (s) {
      var hay = norm(s.name + " " + s.group);
      var score = words.filter(function (w) { return hay.indexOf(w) !== -1 || hay.indexOf(w.replace(/s$/, "")) !== -1; }).length;
      return { s: s, score: score };
    }).filter(function (x) { return x.score > 0; });
    if (!scored.length) return [];
    var best = Math.max.apply(null, scored.map(function (x) { return x.score; }));
    return scored.filter(function (x) { return x.score === best; }).map(function (x) { return x.s; });
  }

  // Resumen de una categoría de la carta
  function category(key, intro, limit) {
    var list = allServices().filter(function (s) { return s.cat === key; });
    return intro + "\n" + list.slice(0, limit || 8).map(line).join("\n") +
      (list.length > (limit || 8) ? "\nTienes la carta completa en la sección Servicios de esta página." : "") +
      "\nPuedes reservar en " + BOOKSY;
  }

  // Cada tema: palabras que lo activan y la respuesta. Van en orden: gana el primero que encaje.
  // Estos van antes de buscar un servicio por nombre
  var TOPICS = [
    { k: ["gracias", "genial", "perfecto", "vale gracias"], r: function () { return "¡A ti! Si te surge cualquier otra duda, aquí estoy. ✦"; } },
    { k: ["whatsapp", "telefono", "llamar", "hablar con cris", "contactar", "contacto"],
      r: function () { return "Puedes escribirle a Cris por WhatsApp al " + WHATSAPP + ". Y si ya sabes lo que quieres, reservas directamente en " + BOOKSY; } },
    { k: ["formacion", "curso", "aprender", "clases", "alumna", "academia", "ensenas", "ensena"],
      r: function () { return "Cris da formación de uñas personalizada: se adapta a tu nivel y a lo que necesitas aprender. Se trabaja preparación de la uña, manicura combinada, nivelación y nail art. Muy pronto también habrá formación de laminado de cejas y lifting de pestañas. Precio, fechas y cómo sería la tuya te lo cuenta Cris por WhatsApp (" + WHATSAPP + ")."; } },
    { k: ["regalo", "regalar", "cumpleanos", "sorpresa", "cupon", "vale regalo"],
      r: function () { return "¡Buena idea! Hay tarjetas regalo en Booksy, en la pestaña «Tarjetas de regalo», y también cupones de varias sesiones: " + BOOKSY; } },
    { k: ["donde", "direccion", "llegar", "ubicacion", "ubicais", "estais", "calle", "mapa", "aparcar"],
      r: function () { return "Estamos en C/ Obispo Segura Sáez, 5, 10001 Cáceres, en pleno centro. Se atiende solo con cita previa. Cómo llegar: " + MAPS; } },
    { k: ["horario", " hora ", "que hora", "a que hora", "abris", "abierto", "cerrais", "hueco", "disponib", "reservar", "reserva", "cita", "cuando", "hoy", "manana", "sabado", "domingo", "lunes"],
      r: function () { return "Las citas se reservan en Booksy, y ahí ves al momento los días y horas libres: " + BOOKSY + "\nSe atiende solo con cita previa."; } },
    { k: ["cancelar", "anular", "cambiar la cita", "cambiar mi cita", "mover la cita"],
      r: function () { return "Puedes gestionar tu cita desde Booksy (" + BOOKSY + "). Si tienes cualquier problema, escríbele a Cris por WhatsApp al " + WHATSAPP + "."; } },
    { k: ["rota", "roto", "rompe", "rompio", "partido", "partio", "arreglo", "garantia", "levantado", "despegado"],
      r: function () { return "Si una uña da guerra, el arreglo es gratis hasta 3 semanas después de tu manicura (unos 15 minutos). Pide hueco en " + BOOKSY; } },
    { k: ["alergi", "sensible", "embaraz", "lactancia", "medicac", "hongo", "herida", "irritac", "reaccion", "hema", "tpo", "toxic", "esteril", "higiene del material"],
      r: function () { return "Todo el material está totalmente esterilizado y los productos son libres de HEMA y TPO, que son los que más alergias dan. Aun así, si tienes alergias, la piel sensible, estás embarazada o tomas medicación, coméntaselo a Cris antes de reservar para que lo adapte: WhatsApp " + WHATSAPP + "."; } },
    { k: ["nail art", "nailart", "dibujo", "mano alzada", "decoracion", "decorad", "diseno de un", "este diseno", "foto de referencia"],
      r: function () { return "El nail art a mano alzada es una de las especialidades de Cris. Tienes ejemplos en la sección Trabajos de esta página. Como cada diseño es distinto, mándale una foto de lo que te gusta por WhatsApp (" + WHATSAPP + ") y te dice qué manicura le va mejor y el precio."; } },
    { k: ["mascota", "perro", "perra", "gato"], r: function () { return "¡Sí! Tu mascota es bienvenida en el estudio."; } },
    { k: ["wifi", "internet"], r: function () { return "Sí, hay wifi en el estudio."; } },
    { k: ["bizum", "efectivo", "pagar", "pago", "tarjeta de credito", "con tarjeta", "datafono"],
      r: function () { return "Se puede pagar con tarjeta. Si quieres pagar de otra forma, pregúntale a Cris por WhatsApp (" + WHATSAPP + ")."; } },
    { k: ["resena", "opinion", "valoracion", "estrellas", "fiable"],
      r: function () { return "Kuri Studio tiene un 5,0 en Booksy con 154 reseñas, y todas son de 5 estrellas. Puedes leerlas en " + BOOKSY; } },
    { k: ["instagram", "redes", "threads", "fotos de trabajos"],
      r: function () { return "En Instagram y Threads está como @kuristudio.caceres. Y en la sección Trabajos de esta página tienes una galería con sus diseños."; } },
    { k: ["dura mas", "durar", "duracion", "aguante", "aguanta", "se me rompen", "debiles", "fragiles", "finas", "blandas", "fuertes"],
      r: function () { return "Si quieres que te dure y que la uña quede fuerte, lo mejor es la semipermanente con nivelación (25 €, 50 min): fortalece y corrige imperfecciones con rubber o gel. Si tus uñas son muy débiles, el refuerzo con polygel (28 €, 1 h 15 min). Y si solo quieres color rápido, la semipermanente express (16 €, 30 min). En la sección «¿Qué manicura es para ti?» de la web tienes un test que te lo dice en 3 preguntas."; } },
    { k: ["lifting o laminado", "laminado o lifting", "diferencia entre lifting", "diferencia entre laminado", "lifting y laminado"],
      r: function () { return "El laminado es para las cejas: quedan visualmente más gruesas y definidas (30 €, o 35 € con depilación). El lifting es para las pestañas: las eleva desde la raíz y lleva tinte (38 €, 1 h). Si quieres las dos cosas, está el combo lifting + laminado + depilación por 62 €."; } },
    { k: ["quitar", "retirar", "retirada", "otro sitio", "otro centro"],
      r: function () { return "Sí, se retira lo que lleves:\n" + allServices().filter(function (s) { return s.group === "Retiradas"; }).map(line).join("\n") + "\nAvísalo al reservar en " + BOOKSY; } }
  ];

  // Estos, después: si no se ha nombrado un servicio concreto, se enseña la categoría
  var GENERAL = [
    { k: ["extension", "largas", "alargar", "acrilico", "polygel", "soft gel", "softgel", "porcelana"],
      r: function () { return category("manicura", "Para alargar las uñas tienes estas opciones (el precio depende del largo):", 20).split("\n").filter(function (l, i) { return i === 0 || /xtensi|oft gel|elleno|Puedes|Tienes/.test(l); }).join("\n"); } },
    { k: ["depila", "hilo", "cera", "bigote", "menton", "patilla", "vello"],
      r: function () { return "Depilación facial con hilo o con cera:\n" + allServices().filter(function (s) { return /Depilación/.test(s.group); }).map(line).join("\n"); } },
    { k: ["pedicura", "pies", "pie ", "durezas"],
      r: function () { return category("pedicura", "Para los pies:", 5); } },
    { k: ["pestana", "lifting"], r: function () { return category("mirada", "Para las pestañas:", 20).split("\n").filter(function (l, i) { return i === 0 || /ifting|xtensi|elleno de ext|Puedes/.test(l); }).join("\n"); } },
    { k: ["ceja", "laminado", "henna", "visagismo"], r: function () { return category("mirada", "Para las cejas:", 6); } },
    { k: ["labio", "glossy", "gua sha", "facial", "piel", "limpieza"], r: function () { return category("facial", "Tratamientos faciales:", 6); } },
    { k: ["mirada"], r: function () { return category("mirada", "En mirada hay cejas y pestañas:", 10); } },
    { k: ["manicura", "unas", "una ", "semipermanente", "esmalt", "nivelacion", "rusa", "japonesa", "nail art", "diseno"],
      r: function () { return category("manicura", "En manicura tienes, entre otras:", 8); } },
    { k: ["servicio", "carta", "que haceis", "tratamientos", "precios", "tarifa"],
      r: function () { return "Kuri Studio hace manicura (semipermanente, nivelación, nail art a mano alzada y extensiones), mirada (cejas y pestañas), tratamientos faciales y labios, pedicura y depilación facial. Dime qué te interesa y te paso precios, o mira la carta completa en la sección Servicios."; } },
    { k: ["hola", "buenas", "buenos dias", "hey", "holi"],
      r: function () { return "¡Hola! Cuéntame qué te apetece hacerte y te ayudo a elegir. Puedo darte precios, explicarte servicios o decirte cómo reservar."; } }
  ];

  // Devuelve una respuesta para el texto de la clienta
  function firstMatch(list, t) {
    for (var i = 0; i < list.length; i++) if (has(t, list[i].k)) return list[i].r();
    return null;
  }

  window.KURI_LOCAL = function (text) {
    var t = " " + norm(text) + " ";
    var topic = firstMatch(TOPICS, t);
    if (topic) return topic;
    // Si nombra un servicio concreto de la carta, se le da el precio directamente
    var found = findServices(t.trim());
    var askingPrice = has(t, ["cuanto", "precio", "cuesta", "vale ", "dura ", "tiempo", "tarda"]);
    if (found.length && found.length <= 4 && (askingPrice || found.length <= 2)) {
      return found.map(line).join("\n") + "\nReserva en " + BOOKSY;
    }
    var general = firstMatch(GENERAL, t);
    if (general) return general;
    if (found.length) return found.slice(0, 6).map(line).join("\n") + "\nReserva en " + BOOKSY;
    return "Esa no la sé responder yo. Puedo ayudarte con precios, servicios, cómo reservar o dónde está el estudio. Si es algo más concreto, Cris te contesta por WhatsApp al " + WHATSAPP + ".";
  };
})();
