// Chat del asistente ("Pregúntale a Kuri").
// Las preguntas van a /api/chat, que es la función de Netlify (netlify/functions/chat.mjs).
// La clave de la IA está allí, nunca en este archivo.
(function () {
  "use strict";

  var ENDPOINT = "/api/chat";
  var HELLO = "¡Hola! Soy la asistente de Kuri Studio. Pregúntame por servicios, precios o cómo llegar, y te ayudo a elegir.";
  var FALLBACK = "Ahora mismo no puedo responder. Escríbele a Cris por WhatsApp al +34 695 16 81 91 o reserva directamente en https://kuristudio.booksy.com/a";
  // Las tres preguntas rápidas que salen al abrir el chat
  var CHIPS = ["¿Qué manicura me dura más?", "¿Lifting o laminado?", "¿Dónde estáis?"];

  var panel = document.getElementById("bot-panel");
  var launch = document.getElementById("bot-launch");
  var launchLabel = document.getElementById("bot-launch-label");
  var closeBtn = document.getElementById("bot-close");
  var log = document.getElementById("bot-log");
  var form = document.getElementById("bot-form");
  var input = document.getElementById("bot-input");
  var sendBtn = form.querySelector("button");

  var history = []; // solo los turnos de la conversación (sin el saludo)
  var busy = false;
  var started = false;

  // Pinta texto de forma segura y convierte las URLs en enlaces.
  function fill(el, text) {
    el.textContent = "";
    var parts = String(text).split(/(https?:\/\/[^\s)]+)/g);
    parts.forEach(function (part) {
      if (/^https?:\/\//.test(part)) {
        var a = document.createElement("a");
        a.href = part.replace(/[.,;]+$/, "");
        // Enlaces cortos: el de Maps se lee mal entero
        a.textContent = /google\.[a-z.]+\/maps/.test(part) ? "Abrir en Google Maps"
          : part.replace(/^https?:\/\/(www\.)?/, "").replace(/\/$/, "");
        a.target = "_blank";
        a.rel = "noopener";
        el.appendChild(a);
      } else if (part) {
        el.appendChild(document.createTextNode(part));
      }
    });
  }

  // Añade un globo al chat
  function addMsg(role, text, extraClass) {
    var div = document.createElement("div");
    div.className = "msg " + (role === "user" ? "msg--user" : "msg--bot") + (extraClass ? " " + extraClass : "");
    fill(div, text);
    log.appendChild(div);
    log.scrollTop = log.scrollHeight;
    return div;
  }

  // Botones de sugerencias (se quitan en cuanto alguien pregunta)
  function addChips() {
    var wrap = document.createElement("div");
    wrap.className = "chips";
    CHIPS.forEach(function (label) {
      var b = document.createElement("button");
      b.type = "button";
      b.textContent = label;
      b.addEventListener("click", function () { wrap.remove(); send(label); });
      wrap.appendChild(b);
    });
    log.appendChild(wrap);
  }

  // Abre o cierra el panel. La primera vez saluda y enseña las sugerencias
  function setOpen(open) {
    panel.hidden = !open;
    launch.setAttribute("aria-expanded", String(open));
    launchLabel.textContent = open ? "Cerrar" : "Pregúntale a Kuri";
    if (open) {
      if (!started) { started = true; addMsg("assistant", HELLO); addChips(); }
      input.focus();
    } else {
      launch.focus();
    }
  }

  // Respuesta sin IA (asistente-local.js). Si ni eso está, el WhatsApp de Cris
  function localReply(text) {
    try { if (typeof window.KURI_LOCAL === "function") return window.KURI_LOCAL(text); } catch (e) {}
    return FALLBACK;
  }

  // Manda la pregunta y espera la respuesta.
  // Si la IA falla, contesta la versión sin IA para que nadie se quede sin respuesta
  async function send(text) {
    text = (text || "").trim();
    if (!text || busy) return;
    busy = true;
    sendBtn.disabled = true;
    var chips = log.querySelector(".chips");
    if (chips) chips.remove();

    addMsg("user", text);
    history.push({ role: "user", content: text });
    var typing = addMsg("assistant", "Escribiendo…", "msg--typing");

    var reply = null;
    try {
      // En la vista previa se usa KURI_ASK; en la web de verdad va por fetch a Netlify
      if (typeof window.KURI_ASK === "function") {
        reply = (await window.KURI_ASK(history.slice(-12))) || null;
      } else {
        var res = await fetch(ENDPOINT, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ messages: history.slice(-12) })
        });
        if (res.ok) {
          var data = await res.json();
          if (data && data.reply) reply = data.reply;
        }
      }
    } catch (e) {
      reply = null;
    }
    if (!reply) reply = localReply(text);

    typing.classList.remove("msg--typing");
    fill(typing, reply);
    history.push({ role: "assistant", content: reply });
    log.scrollTop = log.scrollHeight;
    busy = false;
    sendBtn.disabled = false;
    input.focus();
  }

  // Permite abrir el chat desde otras partes de la web (p. ej., la carta)
  window.KURI_OPEN_CHAT = function (prefill) {
    setOpen(true);
    if (prefill) { input.value = prefill; input.focus(); input.setSelectionRange(prefill.length, prefill.length); }
  };

  launch.addEventListener("click", function () { setOpen(panel.hidden); });
  closeBtn.addEventListener("click", function () { setOpen(false); });
  // Escape cierra el chat
  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape" && !panel.hidden) setOpen(false);
  });
  form.addEventListener("submit", function (e) {
    e.preventDefault();
    var t = input.value;
    input.value = "";
    send(t);
  });
})();

// Galería de trabajos: filtros y foto en grande.
// Las fotos no se tocan aquí, están en trabajos.js
(function () {
  "use strict";
  var all = window.KURI_TRABAJOS || [];
  var grid = document.getElementById("works");
  var dlg = document.getElementById("lightbox");
  if (!grid || !dlg) return;
  var lbImg = document.getElementById("lb-img");
  var lbCap = document.getElementById("lb-cap");
  var shown = all;
  var current = 0;
  var lastTrigger = null;

  // Pinta la cuadrícula con las fotos del filtro que esté activo
  function render() {
    grid.textContent = "";
    shown.forEach(function (w, i) {
      var li = document.createElement("li");
      var b = document.createElement("button");
      b.type = "button";
      b.setAttribute("aria-label", "Ampliar: " + w.alt);
      var img = document.createElement("img");
      img.src = w.src;
      img.alt = w.alt;
      img.loading = "lazy";
      b.appendChild(img);
      b.addEventListener("click", function () { lastTrigger = b; open(i); });
      li.appendChild(b);
      grid.appendChild(li);
    });
  }

  // Cambia la foto del visor (al llegar a la última vuelve a la primera)
  function show(i) {
    current = (i + shown.length) % shown.length;
    lbImg.src = shown[current].src;
    lbImg.alt = shown[current].alt;
    lbCap.textContent = shown[current].alt + " · " + (current + 1) + " de " + shown.length;
  }
  function open(i) {
    show(i);
    if (typeof dlg.showModal === "function") dlg.showModal(); else dlg.setAttribute("open", "");
  }
  function close() {
    if (typeof dlg.close === "function") dlg.close(); else dlg.removeAttribute("open");
  }

  document.getElementById("lb-prev").addEventListener("click", function () { show(current - 1); });
  document.getElementById("lb-next").addEventListener("click", function () { show(current + 1); });
  document.getElementById("lb-close").addEventListener("click", close);
  dlg.addEventListener("click", function (e) { if (e.target === dlg) close(); });
  dlg.addEventListener("close", function () { if (lastTrigger) lastTrigger.focus(); });
  dlg.addEventListener("keydown", function (e) {
    if (e.key === "ArrowLeft") show(current - 1);
    if (e.key === "ArrowRight") show(current + 1);
  });

  // Deslizar con el dedo en móvil
  var x0 = null;
  dlg.addEventListener("touchstart", function (e) { x0 = e.touches[0].clientX; }, { passive: true });
  dlg.addEventListener("touchend", function (e) {
    if (x0 === null) return;
    var dx = e.changedTouches[0].clientX - x0;
    if (Math.abs(dx) > 50) show(current + (dx < 0 ? 1 : -1));
    x0 = null;
  });

  // Botones Todos / Uñas / Mirada / Labios
  var filterBtns = document.querySelectorAll(".filters button");
  filterBtns.forEach(function (btn) {
    btn.addEventListener("click", function () {
      var cat = btn.getAttribute("data-cat");
      filterBtns.forEach(function (b) { b.setAttribute("aria-pressed", String(b === btn)); });
      shown = cat === "todos" ? all : all.filter(function (w) { return w.cat === cat; });
      render();
    });
  });

  render();
})();

// Ventanas con la carta completa de cada categoría.
// Los servicios y precios salen de servicios.js
(function () {
  "use strict";
  var data = window.KURI_SERVICIOS || {};
  var dlg = document.getElementById("sheet");
  if (!dlg) return;
  var inner = dlg.querySelector(".sheet__inner");
  var img = document.getElementById("sheet-img");
  var title = document.getElementById("sheet-title");
  var intro = document.getElementById("sheet-intro");
  var body = document.getElementById("sheet-body");
  var current = null;
  var trigger = null;
  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)");

  function el(tag, cls, text) {
    var e = document.createElement(tag);
    if (cls) e.className = cls;
    if (text) e.textContent = text;
    return e;
  }

  // Rellena la ventana con los servicios de la categoría pulsada
  function fill(key) {
    var c = data[key];
    current = c;
    img.src = c.img;
    img.alt = "";
    title.textContent = c.title;
    intro.textContent = c.intro;
    body.textContent = "";
    c.groups.forEach(function (g) {
      var sec = el("section", "sheet__group");
      sec.appendChild(el("h3", "", g.name));
      var ul = el("ul", "sheet__list");
      g.items.forEach(function (it) {
        var li = el("li");
        li.appendChild(el("span", "sheet__name", it[0]));
        li.appendChild(el("span", "sheet__price", it[1]));
        li.appendChild(el("span", "sheet__desc", it[3] || ""));
        li.appendChild(el("span", "sheet__dur", it[2] || ""));
        ul.appendChild(li);
      });
      sec.appendChild(ul);
      body.appendChild(sec);
    });
    body.scrollTop = 0;
  }

  function open(key, fromEl) {
    if (!data[key]) return;
    fill(key);
    trigger = fromEl;
    // La ventana "nace" desde la tarjeta pulsada
    var card = fromEl.closest(".card") || fromEl;
    var r = card.getBoundingClientRect();
    var w = Math.min(760, window.innerWidth - 32);
    var left = (window.innerWidth - w) / 2;
    var top = window.innerHeight * 0.06;
    inner.style.setProperty("--ox", (r.left + r.width / 2 - left) + "px");
    inner.style.setProperty("--oy", (r.top + r.height / 2 - top) + "px");
    dlg.classList.remove("is-closing");
    dlg.showModal();
    document.documentElement.style.overflow = "hidden";
  }

  // Cierra con animación: esperamos a que acabe antes de cerrar del todo
  function close() {
    if (!dlg.open || dlg.classList.contains("is-closing")) return;
    var finish = function () {
      dlg.classList.remove("is-closing");
      dlg.close();
    };
    if (reduce.matches) return finish();
    dlg.classList.add("is-closing");
    setTimeout(finish, 280);
  }

  dlg.addEventListener("close", function () {
    document.documentElement.style.overflow = "";
    inner.style.transform = "";
    if (trigger) trigger.focus();
  });
  // Que Escape también cierre con animación
  dlg.addEventListener("cancel", function (e) { e.preventDefault(); close(); });
  dlg.addEventListener("click", function (e) { if (e.target === dlg) close(); });
  document.getElementById("sheet-close").addEventListener("click", close);
  // "Preguntar a Kuri": cierra la ventana y abre el chat con la pregunta empezada
  document.getElementById("sheet-ask").addEventListener("click", function () {
    var t = current ? current.title.toLowerCase() : "";
    var finish = function () {
      if (window.KURI_OPEN_CHAT) window.KURI_OPEN_CHAT("Tengo una duda sobre " + t + ": ");
    };
    close();
    setTimeout(finish, reduce.matches ? 0 : 320);
  });

  document.querySelectorAll("[data-open]").forEach(function (b) {
    b.addEventListener("click", function () { open(b.getAttribute("data-open"), b); });
  });

  // En el móvil: deslizar hacia abajo desde la foto para cerrar
  var startY = null;
  var hero = dlg.querySelector(".sheet__hero");
  hero.addEventListener("touchstart", function (e) { startY = e.touches[0].clientY; }, { passive: true });
  hero.addEventListener("touchmove", function (e) {
    if (startY === null) return;
    var dy = Math.max(0, e.touches[0].clientY - startY);
    inner.style.transform = "translateY(" + dy + "px)";
  }, { passive: true });
  hero.addEventListener("touchend", function (e) {
    if (startY === null) return;
    var dy = e.changedTouches[0].clientY - startY;
    startY = null;
    inner.style.transform = "";
    if (dy > 90) close();
  });
})();

// Test "¿Qué manicura es para ti?".
// Si Cris quiere cambiar lo que se recomienda, hay que tocar decide()
(function () {
  "use strict";
  var box = document.getElementById("quiz");
  if (!box) return;

  // Preguntas del test. El primer valor es interno, el segundo es el texto que se ve
  var QUESTIONS = [
    { id: "nails", q: "¿Cómo son tus uñas naturales?", options: [
      ["fuertes", "Fuertes y sanas"],
      ["finas", "Finas, se doblan o se rompen"],
      ["cortas", "Muy cortas o con imperfecciones"]
    ]},
    { id: "length", q: "¿Qué largo te apetece?", options: [
      ["natural", "Mi largo natural"],
      ["poco", "Un poquito más largas"],
      ["largas", "Largas, que se vean"]
    ]},
    { id: "goal", q: "¿Qué es lo que más te importa?", options: [
      ["sencillo", "Algo sencillo y bonito"],
      ["dure", "Que me dure perfecta semanas"],
      ["arte", "Nail art, ¡que se vea!"],
      ["cuidar", "Cuidarlas y nutrirlas, sin esmalte"]
    ]},
    { id: "time", q: "¿Cuánto tiempo tienes para ti?", options: [
      ["poco", "Media horita"],
      ["hora", "Alrededor de una hora"],
      ["todo", "Lo que haga falta"]
    ]}
  ];

  // Posibles resultados (precios sacados de la carta de Booksy)
  var RESULTS = {
    japonesa:  { name: "Manicura japonesa", price: "23 €", time: "45 min", img: "assets/img/nails2.jpg",
      why: "Nutre y fortalece la uña en profundidad y le da un brillo natural, sin esmalte. Perfecta para cuidarlas entre diseño y diseño.", alt: "Manicura rusa sin esmaltado (13 €)" },
    express:   { name: "Esmaltado semipermanente express", price: "16 €", time: "30 min", img: "assets/img/cherry.jpg",
      why: "Tus uñas ya están fuertes: con un limado, limpieza de cutículas y un color bonito vas perfecta en media hora.", alt: "Manicura semipermanente sin refuerzo (20 €)" },
    sinref:    { name: "Manicura semipermanente", price: "20 €", time: "40 min", img: "assets/img/cherry.jpg",
      why: "La de siempre, bien hecha: tus uñas no necesitan refuerzo y el semipermanente te dará color y brillo durante semanas.", alt: "Semipermanente con nivelación (25 €), si quieres que dure aún más" },
    nivel:     { name: "Semipermanente con nivelación", price: "25 €", time: "50 min", img: "assets/img/nails1.jpg",
      why: "La estrella de Cris: con rubber o gel fortalece tus uñas y corrige imperfecciones, así que duran más y quedan perfectas.", alt: "Manicura rusa + nivelación (30 €), con limpieza de cutícula más exhaustiva" },
    rusa:      { name: "Manicura rusa + nivelación", price: "30 €", time: "1 h 15 min", img: "assets/img/blue.jpg",
      why: "Limpieza exhaustiva de la cutícula, nivelación y sellado: el acabado más pulido y el que mejor aguanta las semanas.", alt: "Semipermanente con nivelación (25 €), si vas con menos tiempo" },
    polygel:   { name: "Manicura refuerzo con polygel", price: "28 €", time: "1 h 15 min", img: "assets/img/nails1.jpg",
      why: "Si tus uñas son finas, el refuerzo y la nivelación en acrygel les da la fuerza que necesitan sin perder naturalidad.", alt: "Semipermanente con nivelación (25 €)" },
    softgel:   { name: "Manicura soft gel", price: "desde 30 €", time: "1 h 15 min", img: "assets/img/cherry.jpg",
      why: "Un extra de largo con un acabado ligero y natural. Ideal si tus uñas son cortas y quieres lucir un poquito más.", alt: "Extensión de gel (desde 35 €), si te animas con más largo" },
    gel:       { name: "Extensión de gel", price: "desde 35 €", time: "1 h", img: "assets/img/color.jpg",
      why: "Para lucir uñas largas y resistentes. El precio final depende del largo que elijas.", alt: "Extensión de polygel (desde 38 €) o acrílico (desde 42 €)" },
    acrilico:  { name: "Extensión de acrílico", price: "desde 42 €", time: "1 h 30 min", img: "assets/img/fruit.jpg",
      why: "Largo, resistencia y el lienzo perfecto para que Cris se luzca con tu nail art. El precio depende del largo.", alt: "Extensión de gel (desde 35 €)" }
  };

  // Aquí se elige la manicura según las respuestas.
  // Va en orden: la primera regla que encaje es la que sale
  function decide(a) {
    if (a.length === "largas") return a.goal === "arte" ? "acrilico" : "gel";
    if (a.length === "poco") return a.nails === "finas" ? "polygel" : "softgel";
    if (a.goal === "cuidar") return "japonesa";
    if (a.nails === "finas") return a.time === "poco" ? "nivel" : "polygel";
    if (a.goal === "dure" || a.goal === "arte") return a.time === "poco" ? "nivel" : "rusa";
    if (a.nails === "cortas") return "nivel";
    return a.time === "poco" ? "express" : "sinref";
  }

  var step = 0;
  var answers = {};

  function el(tag, cls, text) {
    var e = document.createElement(tag);
    if (cls) e.className = cls;
    if (text) e.textContent = text;
    return e;
  }

  function progress() {
    var p = el("div", "quiz__progress");
    p.setAttribute("aria-label", "Pregunta " + (step + 1) + " de " + QUESTIONS.length);
    QUESTIONS.forEach(function (_, i) {
      p.appendChild(el("span", i < step ? "is-done" : i === step ? "is-now" : ""));
    });
    return p;
  }

  // Una pregunta cada vez, con la barrita de progreso
  function renderQuestion(focus) {
    var q = QUESTIONS[step];
    box.textContent = "";
    var wrap = el("div", "quiz__step");
    wrap.appendChild(progress());
    var h = el("h3", "quiz__q", q.q);
    h.tabIndex = -1;
    wrap.appendChild(h);
    var opts = el("div", "quiz__options");
    q.options.forEach(function (o) {
      var b = el("button", "quiz__opt", o[1]);
      b.type = "button";
      b.addEventListener("click", function () {
        answers[q.id] = o[0];
        step++;
        if (step < QUESTIONS.length) renderQuestion(true); else renderResult();
      });
      opts.appendChild(b);
    });
    wrap.appendChild(opts);
    if (step > 0) {
      var back = el("button", "quiz__back", "← Anterior");
      back.type = "button";
      back.addEventListener("click", function () { step--; renderQuestion(true); });
      wrap.appendChild(back);
    }
    box.appendChild(wrap);
    if (focus) h.focus({ preventScroll: true });
  }

  // Pantalla final con la recomendación
  function renderResult() {
    var r = RESULTS[decide(answers)];
    box.textContent = "";
    var wrap = el("div", "quiz__result");
    var img = el("img", "quiz__img");
    img.src = r.img;
    img.alt = "";
    wrap.appendChild(img);
    var txt = el("div", "quiz__restext");
    txt.appendChild(el("p", "quiz__label", "Tu manicura ideal ✦"));
    var h = el("h3", "quiz__name", r.name);
    h.tabIndex = -1;
    txt.appendChild(h);
    txt.appendChild(el("p", "quiz__meta", r.price + " · " + r.time));
    txt.appendChild(el("p", "quiz__why", r.why));
    txt.appendChild(el("p", "quiz__alt", "También te puede encajar: " + r.alt + "."));
    var acts = el("div", "quiz__actions");
    var book = el("a", "btn btn--gold", "Reservar en Booksy");
    book.href = "https://kuristudio.booksy.com/a";
    book.target = "_blank";
    book.rel = "noopener";
    acts.appendChild(book);
    var again = el("button", "btn btn--ghost", "Repetir el test");
    again.type = "button";
    again.addEventListener("click", function () { step = 0; answers = {}; renderQuestion(true); });
    acts.appendChild(again);
    txt.appendChild(acts);
    var note = el("p", "quiz__note", "Es una orientación: Cris te asesora en la cita según cómo estén tus uñas.");
    txt.appendChild(note);
    wrap.appendChild(txt);
    box.appendChild(wrap);
    h.focus({ preventScroll: true });
  }

  renderQuestion(false);
})();

// Carrusel de reseñas.
// Las reseñas están escritas a mano en index.html
(function () {
  "use strict";
  var track = document.getElementById("reviews-track");
  if (!track) return;
  var prev = document.getElementById("rev-prev");
  var next = document.getElementById("rev-next");
  function stepSize() {
    var card = track.querySelector(".review");
    return card ? card.getBoundingClientRect().width + 18 : 300;
  }
  // Apaga las flechas al llegar al principio o al final
  function update() {
    prev.disabled = track.scrollLeft <= 4;
    next.disabled = track.scrollLeft + track.clientWidth >= track.scrollWidth - 4;
  }
  prev.addEventListener("click", function () { track.scrollBy({ left: -stepSize() }); });
  next.addEventListener("click", function () { track.scrollBy({ left: stepSize() }); });
  track.addEventListener("keydown", function (e) {
    if (e.key === "ArrowRight") { e.preventDefault(); track.scrollBy({ left: stepSize() }); }
    if (e.key === "ArrowLeft") { e.preventDefault(); track.scrollBy({ left: -stepSize() }); }
  });
  track.addEventListener("scroll", update, { passive: true });
  window.addEventListener("resize", update);
  update();
})();
