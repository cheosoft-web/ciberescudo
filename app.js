import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.5/firebase-app.js";
import {
  getAuth,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut
} from "https://www.gstatic.com/firebasejs/10.12.5/firebase-auth.js";
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  getFirestore,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  setDoc
} from "https://www.gstatic.com/firebasejs/10.12.5/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyAbmxxyNZqPBqe07YvCfPhRYreDmj6DKPA",
  authDomain: "ciberescudo.firebaseapp.com",
  projectId: "ciberescudo",
  storageBucket: "ciberescudo.firebasestorage.app",
  messagingSenderId: "264153412090",
  appId: "1:264153412090:web:e2a7d846aad6c38361b443",
  measurementId: "G-QC9X9H4Q1Q"
};

const firebaseApp = initializeApp(firebaseConfig);
const auth = getAuth(firebaseApp);
const db = getFirestore(firebaseApp);
const contentRef = doc(db, "site", "content");
const reportsRef = collection(db, "reports");

const STORE_KEY = "ciberescudo-data-v1";
const VISITS_KEY = "ciberescudo-visits";
const PRIVACY_POLICY_URL = "assets/politica_privacidad.md";

const defaults = {
  alerts: [
    {
      tag: "Phishing",
      title: "Mensajes que usan logos de bancos o instituciones",
      body: "Ofrecen créditos, transferencias, bonos o inversiones inexistentes y piden claves, códigos QR o datos de cuenta.",
      tips: "No compartas claves ni códigos; verifica en canales oficiales; desconfía de urgencias."
    },
    {
      tag: "QR",
      title: "Comprobantes falsos y QR manipulado",
      body: "El estafador envía una captura de pago o un QR para que la víctima confirme sin revisar el abono real.",
      tips: "Revisa la app bancaria; no aceptes solo capturas; confirma el nombre del titular."
    },
    {
      tag: "Marketplace",
      title: "Productos escasos a precio demasiado bajo",
      body: "Publican combustible, alimentos o equipos con adelanto obligatorio. Después del depósito, desaparecen.",
      tips: "Evita adelantos; revisa reputación; compra en lugares verificables."
    },
    {
      tag: "Sextorsión",
      title: "Amenazas con fotos íntimas o capturas",
      body: "Presionan con publicar contenido privado para exigir dinero, más fotos o silencio.",
      tips: "No pagues; guarda evidencias; bloquea y denuncia; pide apoyo."
    }
  ],
  crimes: [
    {
      tag: "Identidad",
      title: "Phishing",
      body: "Engaño que imita a bancos, billeteras, instituciones o empresas para robar contraseñas, tokens, QR o información personal.",
      tips: "Escribe la dirección web manualmente; activa doble verificación; no abras enlaces sospechosos."
    },
    {
      tag: "Extorsión",
      title: "Sextorsión",
      body: "Amenaza de difundir imágenes íntimas reales o falsas para obtener dinero o más contenido.",
      tips: "Corta contacto; conserva capturas; reporta el perfil; no negocies con el agresor."
    },
    {
      tag: "Finanzas",
      title: "Estafa con QR",
      body: "Uso de QR falsos, comprobantes editados o pagos que nunca se acreditan para engañar a compradores y vendedores.",
      tips: "Verifica el movimiento dentro de la app; revisa monto y titular; espera confirmación bancaria."
    },
    {
      tag: "Cuentas",
      title: "Suplantación por WhatsApp",
      body: "Toman o imitan una cuenta para pedir dinero a familiares, vender productos o solicitar códigos de seguridad.",
      tips: "Llama por otro medio; pregunta algo personal; activa PIN de verificación en dos pasos."
    },
    {
      tag: "Comercio",
      title: "Falsas ventas online",
      body: "Ofertas con precios irreales, presión por adelanto y perfiles recién creados en redes sociales.",
      tips: "Desconfía de urgencias; revisa comentarios; usa pagos protegidos y entrega presencial segura."
    },
    {
      tag: "Inversión",
      title: "Ganancias milagrosas",
      body: "Prometen duplicar dinero, criptomonedas garantizadas o empleos con pagos previos.",
      tips: "Investiga la empresa; no pagues para trabajar; desconfía de rentabilidad garantizada."
    }
  ],
  methods: [
    {
      title: "Urgencia emocional",
      body: "Te dicen que tu cuenta será bloqueada, que ganaste un premio o que un familiar necesita dinero de inmediato.",
      detail: "Los estafadores buscan que decidas rápido y sin verificar. Suelen usar frases como 'último aviso', 'tu cuenta será suspendida', 'tu familiar tuvo un accidente' o 'deposita ahora para no perder la oportunidad'.\n\nLa prevención empieza bajando la velocidad: corta la conversación, verifica por un canal oficial y nunca entregues códigos, claves ni comprobantes por presión.",
      prevention: "Llama por otro medio; revisa canales oficiales; no compartas códigos; conversa con tu familia sobre palabras clave de verificación.",
      images: []
    },
    {
      title: "Autoridad falsa",
      body: "Usan nombres de instituciones, bancos, funcionarios, policías o empresas para parecer confiables.",
      detail: "La cuenta, llamada o mensaje aparenta venir de una entidad legítima. Pueden copiar logos, nombres de funcionarios, colores institucionales y lenguaje formal para pedir datos o pagos.",
      prevention: "Busca el número oficial por tu cuenta; no uses enlaces enviados por chat; confirma en sucursal, app oficial o líneas verificadas.",
      images: []
    },
    {
      title: "Adelanto pequeño",
      body: "Piden una reserva, comisión, garantía, envío o desbloqueo. El monto parece bajo, pero el objetivo es repetir el cobro.",
      detail: "El primer pago se presenta como algo mínimo: reserva, garantía, costo de envío, comisión, desbloqueo o trámite. Después aparecen nuevos pagos hasta que la víctima se da cuenta o se queda sin dinero.",
      prevention: "No pagues adelantos a desconocidos; pide comprobación verificable; usa entrega contra pago cuando sea posible.",
      images: []
    },
    {
      title: "Captura de pantalla como prueba",
      body: "Envían comprobantes editados para que entregues productos o liberes información antes de confirmar el pago real.",
      detail: "El comprobante puede verse real, pero estar editado o corresponder a otra operación. La trampa funciona cuando la víctima confía en la captura y no revisa el movimiento en su banco.",
      prevention: "Confirma el abono dentro de tu app; revisa monto, fecha y titular; no entregues productos solo por captura.",
      images: []
    },
    {
      title: "Enlace acortado o página clonada",
      body: "El link parece normal, pero te lleva a un sitio que copia el diseño de una entidad conocida.",
      detail: "El sitio clonado puede tener logo, colores y textos parecidos a una página real. La diferencia suele estar en la dirección web, errores pequeños, formularios extraños o solicitudes de claves.",
      prevention: "Escribe la URL manualmente; revisa el dominio completo; evita enlaces acortados; no ingreses claves desde enlaces recibidos.",
      images: []
    }
  ],
  questions: [
    ["Un enlace te pide actualizar tu clave bancaria por WhatsApp. ¿Qué haces?", "Entrar desde la app o web oficial, no desde el enlace", ["Enviar la clave para evitar bloqueo", "Reenviar el enlace a tus contactos", "Responder con tu número de cuenta"]],
    ["Al vender un producto, te mandan una captura de pago QR. ¿Qué confirma el pago?", "Ver el abono dentro de tu app bancaria", ["La captura enviada por chat", "La promesa del comprador", "Un audio diciendo que ya pagó"]],
    ["¿Qué señal suele indicar una estafa en Marketplace?", "Precio demasiado bajo y presión por adelanto", ["Fotos claras del producto", "Entrega en tienda formal", "Pago contra entrega"]],
    ["Si alguien amenaza con publicar fotos íntimas, lo más recomendable es:", "Guardar evidencias, cortar contacto y denunciar", ["Pagar de inmediato", "Enviar más fotos", "Borrar todo sin guardar pruebas"]],
    ["¿Para qué sirve la verificación en dos pasos de WhatsApp?", "Dificulta que roben o activen tu cuenta", ["Hace que internet sea gratis", "Borra mensajes antiguos", "Evita llamadas desconocidas"]],
    ["Una supuesta institución te ofrece crédito por SMS y pide un pago previo. ¿Qué haces?", "Verifico por canales oficiales y no pago adelantos", ["Pago la comisión rápido", "Mando mi PIN", "Comparto mi QR personal"]],
    ["¿Cuál dato nunca debes compartir por chat?", "Contraseñas, tokens o códigos de verificación", ["Tu ciudad general", "Horario de atención de una tienda", "Una noticia pública"]],
    ["Un familiar pide dinero por WhatsApp desde un número nuevo. ¿Primer paso?", "Llamar o verificar por otro canal", ["Depositar por confianza", "Enviar foto de tu carnet", "Compartirlo en grupos"]],
    ["¿Qué haces con un mensaje sospechoso?", "No abrir enlaces, bloquear y reportar", ["Probar el enlace por curiosidad", "Enviar datos falsos", "Instalar lo que pide"]],
    ["¿Qué indica una inversión posiblemente fraudulenta?", "Ganancia garantizada y presión por ingresar hoy", ["Contrato claro y verificable", "Registro legal comprobable", "Riesgo explicado con transparencia"]],
    ["¿Cuál es una buena práctica al escanear un QR?", "Revisar el destino antes de ingresar datos", ["Aceptar cualquier permiso", "Poner tu clave para probar", "Confiar si tiene logo bonito"]],
    ["Si ya entregaste una contraseña, ¿qué haces primero?", "Cambiarla y cerrar sesiones activas", ["Esperar unos días", "Publicarla para avisar", "Usarla en más cuentas"]]
  ],
  reports: []
};

let data = loadData();
let quiz = { questions: [], index: 0, score: 0, answered: false };
let activeTab = "alerts";
let carouselTimer = null;
let carouselPaused = false;
let remoteContentLoaded = false;
let contentUnsubscribe = null;

function loadData() {
  const saved = localStorage.getItem(STORE_KEY);
  if (!saved) return normalizeData(defaults);
  try {
    return normalizeData({ ...structuredClone(defaults), ...JSON.parse(saved) });
  } catch {
    return normalizeData(defaults);
  }
}

function normalizeData(source) {
  return {
    alerts: Array.isArray(source.alerts) ? source.alerts : structuredClone(defaults.alerts),
    crimes: Array.isArray(source.crimes) ? source.crimes : structuredClone(defaults.crimes),
    methods: Array.isArray(source.methods) ? source.methods : structuredClone(defaults.methods),
    questions: Array.isArray(source.questions) ? source.questions : structuredClone(defaults.questions),
    reports: Array.isArray(source.reports) ? source.reports : []
  };
}

function contentPayload() {
  return {
    alerts: data.alerts,
    crimes: data.crimes,
    methods: data.methods,
    questions: data.questions,
    updatedAt: serverTimestamp()
  };
}

function saveLocalData() {
  localStorage.setItem(STORE_KEY, JSON.stringify(data));
}

async function saveData() {
  saveLocalData();
  try {
    await setDoc(contentRef, contentPayload(), { merge: true });
  } catch (error) {
    console.warn("No se pudo guardar en Firestore.", error);
    alert("No se pudo guardar en Firestore. Revisa las reglas, el login de admin o tu conexión.");
  }
}

function bindFirestoreContent() {
  if (contentUnsubscribe) contentUnsubscribe();
  contentUnsubscribe = onSnapshot(contentRef, snapshot => {
    if (!snapshot.exists()) {
      remoteContentLoaded = false;
      return;
    }
    remoteContentLoaded = true;
    data = normalizeData({ ...data, ...snapshot.data(), reports: data.reports });
    saveLocalData();
    renderPublic();
    if (!document.querySelector("#adminPanel")?.hidden) renderAdmin();
  }, error => {
    console.warn("No se pudo leer contenido desde Firestore.", error);
  });
}

async function ensureRemoteContent() {
  if (remoteContentLoaded) return;
  try {
    const snapshot = await getDoc(contentRef);
    if (snapshot.exists()) {
      remoteContentLoaded = true;
      data = normalizeData({ ...data, ...snapshot.data(), reports: data.reports });
      saveLocalData();
      renderPublic();
      return;
    }
    await setDoc(contentRef, contentPayload(), { merge: true });
    remoteContentLoaded = true;
  } catch (error) {
    console.warn("No se pudo inicializar Firestore.", error);
  }
}

async function loadReports() {
  try {
    const snapshot = await getDocs(query(reportsRef, orderBy("createdAt", "desc")));
    data.reports = snapshot.docs.map(reportDoc => ({
      id: reportDoc.id,
      ...reportDoc.data()
    }));
  } catch (error) {
    console.warn("No se pudieron cargar reportes desde Firestore.", error);
  }
}

function shuffle(items) {
  return [...items].sort(() => Math.random() - 0.5);
}

function escapeHtml(value = "") {
  return String(value).replace(/[&<>"']/g, char => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#039;"
  }[char]));
}

function initVisits() {
  const visits = Number(localStorage.getItem(VISITS_KEY) || 0) + 1;
  localStorage.setItem(VISITS_KEY, visits);
  document.querySelector("#visitCount").textContent = visits.toLocaleString("es-BO");
}

function renderPublic() {
  document.querySelector("#alertCount").textContent = `${data.alerts.length} casos`;
  renderCarousel();
  renderCards("#crimeGrid", data.crimes);
  renderMethods();
}

function renderCarousel() {
  const carousel = document.querySelector("#carousel");
  const visibleAlerts = data.alerts.length ? data.alerts : defaults.alerts;
  const loops = visibleAlerts.length < 6 ? 3 : 2;
  carousel.innerHTML = Array.from({ length: loops }, (_, loopIndex) => {
    return visibleAlerts.map(item => cardTemplate(item, loopIndex > 0)).join("");
  }).join("");
  carousel.scrollLeft = 0;
  startCarouselMotion();
}

function renderCards(selector, items) {
  document.querySelector(selector).innerHTML = items.map(item => cardTemplate(item)).join("");
}

function cardTemplate(item, duplicate = false) {
  const tips = String(item.tips || "")
    .split(";")
    .map(tip => tip.trim())
    .filter(Boolean)
    .map(tip => `<li>${escapeHtml(tip)}</li>`)
    .join("");
  const image = (item.images || [])[0];

  return `
    <article class="card"${duplicate ? ' aria-hidden="true"' : ""}>
      ${image ? `<img class="card-image" src="${escapeHtml(image)}" alt="Imagen de referencia para ${escapeHtml(item.title)}">` : ""}
      <span class="card-tag">${escapeHtml(item.tag || "Alerta")}</span>
      <h3>${escapeHtml(item.title)}</h3>
      <p>${escapeHtml(item.body)}</p>
      ${tips ? `<ul class="tip-list">${tips}</ul>` : ""}
    </article>
  `;
}

function renderMethods() {
  document.querySelector("#methodList").innerHTML = data.methods.map((item, index) => `
    <button class="method-item" type="button" data-method-index="${index}">
      <strong>${String(index + 1).padStart(2, "0")} · ${escapeHtml(item.title)}</strong>
      <p>${escapeHtml(item.body)}</p>
      <span>Ver detalle</span>
    </button>
  `).join("");
}

function bindNavigation() {
  const navToggle = document.querySelector("#navToggle");
  const nav = document.querySelector("#siteNav");
  navToggle.addEventListener("click", () => {
    const isOpen = nav.classList.toggle("open");
    navToggle.setAttribute("aria-expanded", String(isOpen));
  });
  nav.addEventListener("click", event => {
    if (event.target.matches("a")) nav.classList.remove("open");
  });

  document.querySelector("#prevSlide").addEventListener("click", () => {
    nudgeCarousel(-1);
  });
  document.querySelector("#nextSlide").addEventListener("click", () => {
    nudgeCarousel(1);
  });

  const carousel = document.querySelector("#carousel");
  carousel.addEventListener("mouseenter", () => carouselPaused = true);
  carousel.addEventListener("mouseleave", () => carouselPaused = false);
  carousel.addEventListener("focusin", () => carouselPaused = true);
  carousel.addEventListener("focusout", () => carouselPaused = false);
}

function startCarouselMotion() {
  const carousel = document.querySelector("#carousel");
  if (!carousel) return;
  window.clearInterval(carouselTimer);
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
  carouselTimer = window.setInterval(() => {
    if (carouselPaused || carouselMaxScroll() <= 0) return;
    nudgeCarousel(1, false);
  }, 3600);
}

function carouselStep() {
  const carousel = document.querySelector("#carousel");
  const card = carousel?.querySelector(".card");
  if (!carousel || !card) return 410;
  const gap = Number.parseFloat(getComputedStyle(carousel).gap || "16");
  return card.getBoundingClientRect().width + gap;
}

function nudgeCarousel(direction = 1, pauseMomentarily = true) {
  const carousel = document.querySelector("#carousel");
  if (!carousel) return;
  const maxScroll = carouselMaxScroll();
  if (maxScroll <= 0) return;
  const next = carousel.scrollLeft + carouselStep() * direction;
  let target = next;
  if (next >= maxScroll - 12) target = 0;
  if (next < 0) target = maxScroll;
  target = Math.max(0, Math.min(target, maxScroll));
  carousel.scrollTo({ left: target, behavior: "smooth" });
  if (!pauseMomentarily) return;
  carouselPaused = true;
  window.setTimeout(() => carouselPaused = false, 1800);
}

function carouselMaxScroll() {
  const carousel = document.querySelector("#carousel");
  if (!carousel) return 0;
  return Math.max(0, carousel.scrollWidth - carousel.clientWidth);
}

function bindImageViewer() {
  const viewer = document.querySelector("#imageViewer");
  const viewerImg = document.querySelector("#imageViewerImg");
  const viewerTitle = document.querySelector("#imageViewerTitle");

  document.addEventListener("click", event => {
    const image = event.target.closest(".card-image, .image-grid img, .admin-thumb");
    if (!image) return;
    viewerImg.src = image.src;
    viewerImg.alt = image.alt || "Imagen ampliada";
    viewerTitle.textContent = image.alt || "Vista de imagen";
    viewer.showModal();
  });

  document.querySelector("#closeImageViewer").addEventListener("click", () => {
    viewer.close();
    viewerImg.src = "";
  });
}

function bindYanapaqBot() {
  const yanapaqModal = document.querySelector("#yanapaqModal");
  const privacyModal = document.querySelector("#privacyModal");

  document.querySelector("#openYanapaq").addEventListener("click", () => yanapaqModal.showModal());
  document.querySelector("#closeYanapaq").addEventListener("click", () => yanapaqModal.close());
  document.querySelector("#openPrivacy").addEventListener("click", () => openPrivacyPolicy());
  document.querySelector("#openPrivacyFromYanapaq").addEventListener("click", () => {
    yanapaqModal.close();
    openPrivacyPolicy();
  });
  document.querySelector("#closePrivacy").addEventListener("click", () => privacyModal.close());
}

async function openPrivacyPolicy() {
  const privacyModal = document.querySelector("#privacyModal");
  const content = document.querySelector("#privacyContent");
  content.innerHTML = "<p>Cargando política de privacidad...</p>";
  privacyModal.showModal();

  try {
    const response = await fetch(PRIVACY_POLICY_URL, { cache: "no-store" });
    if (!response.ok) throw new Error("No se pudo cargar el archivo.");
    const markdown = await response.text();
    content.innerHTML = markdownToHtml(markdown);
  } catch {
    content.innerHTML = `
      <p>No se pudo cargar automáticamente el archivo de política de privacidad desde el navegador.</p>
      <p>Puedes abrirlo directamente aquí: <a href="${PRIVACY_POLICY_URL}" target="_blank" rel="noopener noreferrer">assets/politica_privacidad.md</a></p>
    `;
  }
}

function markdownToHtml(markdown) {
  const lines = markdown.split(/\r?\n/);
  let html = "";
  let inList = false;

  lines.forEach(rawLine => {
    const line = rawLine.trim();
    if (!line) {
      if (inList) {
        html += "</ul>";
        inList = false;
      }
      return;
    }

    if (line.startsWith("- ")) {
      if (!inList) {
        html += "<ul>";
        inList = true;
      }
      html += `<li>${inlineMarkdown(line.slice(2))}</li>`;
      return;
    }

    if (inList) {
      html += "</ul>";
      inList = false;
    }

    if (line.startsWith("# ")) html += `<h1>${inlineMarkdown(line.slice(2))}</h1>`;
    else if (line.startsWith("## ")) html += `<h2>${inlineMarkdown(line.slice(3))}</h2>`;
    else if (line.startsWith("### ")) html += `<h3>${inlineMarkdown(line.slice(4))}</h3>`;
    else html += `<p>${inlineMarkdown(line)}</p>`;
  });

  if (inList) html += "</ul>";
  return html;
}

function inlineMarkdown(text) {
  return escapeHtml(text).replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>");
}

function bindMethodDetails() {
  document.querySelector("#methodList").addEventListener("click", event => {
    const item = event.target.closest("[data-method-index]");
    if (!item) return;
    openMethodDetail(Number(item.dataset.methodIndex));
  });
  document.querySelector("#closeMethodModal").addEventListener("click", () => {
    document.querySelector("#methodModal").close();
  });
}

function openMethodDetail(index) {
  const method = data.methods[index];
  if (!method) return;
  document.querySelector("#methodModalKicker").textContent = `Forma ${String(index + 1).padStart(2, "0")}`;
  document.querySelector("#methodModalTitle").textContent = method.title;
  const images = (method.images || []).map(src => `<img src="${escapeHtml(src)}" alt="Captura de referencia sobre ${escapeHtml(method.title)}">`).join("");
  document.querySelector("#methodModalBody").innerHTML = `
    <p class="detail-copy">${escapeHtml(method.detail || method.body)}</p>
    <div class="detail-grid">
      <div class="detail-panel">
        <h3>Cómo reconocerlo</h3>
        <p class="detail-copy">${escapeHtml(method.body)}</p>
      </div>
      <div class="detail-panel">
        <h3>Cómo prevenirlo</h3>
        <p class="detail-copy">${escapeHtml(method.prevention || "Verifica por canales oficiales, no compartas datos sensibles y guarda evidencias.")}</p>
      </div>
    </div>
    ${images ? `<div><h3>Imágenes o capturas</h3><div class="image-grid">${images}</div></div>` : ""}
  `;
  document.querySelector("#methodModal").showModal();
}

function bindReports() {
  document.querySelector("#reportForm").addEventListener("submit", async event => {
    event.preventDefault();
    const status = document.querySelector("#reportStatus");
    status.textContent = "Guardando reporte...";
    const form = new FormData(event.currentTarget);
    const images = await filesToDataUrls(event.currentTarget.elements.images?.files || []);
    const report = {
      date: new Date().toLocaleString("es-BO"),
      type: form.get("type").trim(),
      story: form.get("story").trim(),
      city: form.get("city").trim(),
      contact: form.get("contact").trim(),
      images,
      status: "pending",
      createdAt: serverTimestamp()
    };

    try {
      const reportDoc = await addDoc(reportsRef, report);
      data.reports.unshift({ ...report, id: reportDoc.id });
      event.currentTarget.reset();
      status.textContent = "Reporte guardado en Firestore para revisión del administrador.";
      if (!document.querySelector("#adminPanel").hidden) renderAdmin();
    } catch (error) {
      console.warn("No se pudo guardar el reporte en Firestore.", error);
      status.textContent = "No se pudo guardar el reporte. Revisa conexión o reglas de Firestore.";
    }
  });
}

function bindQuiz() {
  document.querySelector("#startQuiz").addEventListener("click", startQuiz);
  document.querySelector("#nextQuestion").addEventListener("click", nextQuestion);
}

function startQuiz() {
  quiz = {
    questions: shuffle(data.questions).slice(0, 10),
    index: 0,
    score: 0,
    answered: false
  };
  document.querySelector("#startQuiz").textContent = "Reiniciar quiz";
  document.querySelector("#nextQuestion").disabled = true;
  renderQuestion();
}

function renderQuestion() {
  const current = quiz.questions[quiz.index];
  if (!current) {
    document.querySelector("#quizProgress").textContent = "Quiz finalizado";
    document.querySelector("#quizScore").textContent = `Puntaje final: ${quiz.score}/10`;
    document.querySelector("#questionText").textContent = scoreMessage();
    document.querySelector("#answers").innerHTML = "";
    document.querySelector("#nextQuestion").disabled = true;
    return;
  }

  const [question, correct, wrongs] = current;
  quiz.answered = false;
  document.querySelector("#quizProgress").textContent = `Pregunta ${quiz.index + 1} de ${quiz.questions.length}`;
  document.querySelector("#quizScore").textContent = `Puntaje: ${quiz.score}`;
  document.querySelector("#questionText").textContent = question;
  document.querySelector("#nextQuestion").disabled = true;
  document.querySelector("#answers").innerHTML = shuffle([correct, ...wrongs]).map(answer => `
    <button class="answer-btn" type="button" data-correct="${answer === correct}">${escapeHtml(answer)}</button>
  `).join("");
}

function nextQuestion() {
  quiz.index += 1;
  renderQuestion();
}

function scoreMessage() {
  if (quiz.score >= 9) return "Excelente. Tienes criterio de escudo alto.";
  if (quiz.score >= 7) return "Muy bien. Solo falta reforzar algunos reflejos digitales.";
  if (quiz.score >= 5) return "Buen inicio. Revisa las alertas y vuelve a intentarlo.";
  return "Necesitas practicar más. La prevención se entrena.";
}

document.querySelector("#answers").addEventListener("click", event => {
  const button = event.target.closest(".answer-btn");
  if (!button || quiz.answered) return;
  quiz.answered = true;
  const isCorrect = button.dataset.correct === "true";
  if (isCorrect) quiz.score += 1;
  document.querySelectorAll(".answer-btn").forEach(btn => {
    btn.disabled = true;
    if (btn.dataset.correct === "true") btn.classList.add("correct");
  });
  if (!isCorrect) button.classList.add("wrong");
  document.querySelector("#quizScore").textContent = `Puntaje: ${quiz.score}`;
  document.querySelector("#nextQuestion").disabled = false;
});

function bindAdmin() {
  const modal = document.querySelector("#adminModal");
  document.querySelector("#openAdmin").addEventListener("click", () => modal.showModal());
  document.querySelector("#closeAdmin").addEventListener("click", () => modal.close());
  document.querySelector("#loginForm").addEventListener("submit", async event => {
    event.preventDefault();
    const email = document.querySelector("#adminEmail").value.trim();
    const password = document.querySelector("#adminPassword").value;
    const status = document.querySelector("#loginStatus");

    status.textContent = "Verificando credenciales...";
    try {
      await signInWithEmailAndPassword(auth, email, password);
      status.textContent = "";
    } catch (error) {
      status.textContent = firebaseAuthMessage(error.code);
    }
  });

  document.querySelector("#logoutAdmin").addEventListener("click", async () => {
    await signOut(auth);
  });

  onAuthStateChanged(auth, user => {
    if (user) showAdminPanel(user);
    else showAdminLogin();
  });

  document.querySelector(".tabs").addEventListener("click", event => {
    const tab = event.target.closest(".tab");
    if (!tab) return;
    activeTab = tab.dataset.tab;
    document.querySelectorAll(".tab").forEach(item => item.classList.toggle("active", item === tab));
    renderAdmin();
  });

  document.querySelector("#adminContent").addEventListener("click", handleAdminClick);
  document.querySelector("#adminContent").addEventListener("submit", handleAdminSubmit);
}

async function showAdminPanel(user) {
  document.querySelector("#loginForm").hidden = true;
  document.querySelector("#adminPanel").hidden = false;
  document.querySelector("#adminSessionText").textContent = `Sesión: ${user.email}`;
  await ensureRemoteContent();
  await loadReports();
  renderAdmin();
}

function showAdminLogin() {
  document.querySelector("#loginForm").hidden = false;
  document.querySelector("#adminPanel").hidden = true;
  document.querySelector("#adminPassword").value = "";
}

function firebaseAuthMessage(code) {
  const messages = {
    "auth/invalid-credential": "Correo o contraseña incorrectos.",
    "auth/user-disabled": "Este usuario administrador está deshabilitado.",
    "auth/too-many-requests": "Demasiados intentos. Espera unos minutos e intenta nuevamente.",
    "auth/network-request-failed": "No hay conexión con Firebase. Revisa internet o el dominio autorizado."
  };
  return messages[code] || "No se pudo iniciar sesión con Firebase.";
}

async function renderAdmin() {
  const content = document.querySelector("#adminContent");
  if (activeTab === "reports") {
    await loadReports();
    content.innerHTML = renderReports();
    return;
  }
  if (activeTab === "questions") {
    content.innerHTML = renderQuestionAdmin();
    return;
  }
  content.innerHTML = renderCollectionAdmin(activeTab);
}

function renderCollectionAdmin(collection) {
  const titleMap = { alerts: "tarjeta del carousel", crimes: "tipo de delito", methods: "forma de estafa" };
  const isMethod = collection === "methods";
  const rows = data[collection].map((item, index) => `
    <div class="admin-row">
      <div>
        <strong>${escapeHtml(item.title)}</strong>
        <p>${escapeHtml(item.body)}</p>
        ${(item.images || [])[0] ? `<img class="admin-thumb" src="${escapeHtml(item.images[0])}" alt="Miniatura">` : ""}
      </div>
      <div class="row-actions">
        <button class="btn secondary" type="button" data-action="edit" data-collection="${collection}" data-index="${index}">Editar</button>
        <button class="btn secondary danger" type="button" data-action="delete" data-collection="${collection}" data-index="${index}">Eliminar</button>
      </div>
    </div>
  `).join("");

  return `
    <form class="admin-form" data-form="${collection}">
      <label>${isMethod ? "Etiqueta opcional" : "Etiqueta"}<input name="tag" placeholder="Ej. Phishing, QR, Extorsión"></label>
      <label>Título<input name="title" required></label>
      <label>Descripción<textarea name="body" rows="3" required></textarea></label>
      <label>Detalle ampliado<textarea name="detail" rows="5" placeholder="Explica el caso con más contexto, señales y ejemplo de cómo opera."></textarea></label>
      <label>Prevención<textarea name="prevention" rows="3" placeholder="Recomendaciones prácticas para evitar caer."></textarea></label>
      <label>Tips separados por punto y coma<textarea name="tips" rows="2" ${isMethod ? "disabled" : ""}></textarea></label>
      <label class="full">Imágenes o capturas<input name="images" type="file" accept="image/*" multiple></label>
      <label class="full checkbox-label"><input name="clearImages" type="checkbox" value="yes"> Quitar imágenes guardadas de este elemento</label>
      <input name="editIndex" type="hidden" value="">
      <button class="btn primary full" type="submit">Guardar ${titleMap[collection]}</button>
    </form>
    <div class="admin-list">${rows || "<p>No hay elementos todavía.</p>"}</div>
  `;
}

function renderQuestionAdmin() {
  const rows = data.questions.map((item, index) => `
    <div class="admin-row">
      <div>
        <strong>${escapeHtml(item[0])}</strong>
        <p>Correcta: ${escapeHtml(item[1])}</p>
      </div>
      <div class="row-actions">
        <button class="btn secondary" type="button" data-action="edit-question" data-index="${index}">Editar</button>
        <button class="btn secondary danger" type="button" data-action="delete-question" data-index="${index}">Eliminar</button>
      </div>
    </div>
  `).join("");

  return `
    <form class="admin-form" data-form="questions">
      <label class="full">Pregunta<input name="question" required></label>
      <label>Respuesta correcta<input name="correct" required></label>
      <label>Opciones incorrectas separadas por punto y coma<input name="wrongs" required></label>
      <input name="editIndex" type="hidden" value="">
      <button class="btn primary full" type="submit">Guardar pregunta</button>
    </form>
    <div class="admin-list">${rows}</div>
  `;
}

function renderReports() {
  const rows = data.reports.map((report, index) => `
    <div class="admin-row">
      <div>
        <strong>${escapeHtml(report.type)} · ${escapeHtml(report.city || "Sin ciudad")}</strong>
        <p>${escapeHtml(report.story)}</p>
        ${(report.images || [])[0] ? `<img class="admin-thumb" src="${escapeHtml(report.images[0])}" alt="Captura del reporte">` : ""}
        <small>${escapeHtml(report.date)} ${report.contact ? "· Contacto: " + escapeHtml(report.contact) : ""}</small>
      </div>
      <div class="row-actions">
        <button class="btn secondary" type="button" data-action="promote-report" data-index="${index}">Publicar alerta</button>
        <button class="btn secondary danger" type="button" data-action="delete-report" data-index="${index}">Eliminar</button>
      </div>
    </div>
  `).join("");
  return `<div class="admin-list">${rows || "<p>No hay reportes pendientes.</p>"}</div>`;
}

async function handleAdminSubmit(event) {
  const form = event.target.closest("form[data-form]");
  if (!form) return;
  event.preventDefault();
  const kind = form.dataset.form;
  const formData = new FormData(form);
  const editIndex = formData.get("editIndex");

  if (kind === "questions") {
    const item = [
      formData.get("question").trim(),
      formData.get("correct").trim(),
      formData.get("wrongs").split(";").map(item => item.trim()).filter(Boolean).slice(0, 5)
    ];
    if (item[2].length < 2) return alert("Agrega al menos dos opciones incorrectas separadas por punto y coma.");
    if (editIndex !== "") data.questions[Number(editIndex)] = item;
    else data.questions.push(item);
  } else {
    const previous = editIndex !== "" ? data[kind][Number(editIndex)] : {};
    const newImages = await filesToDataUrls(form.elements.images?.files || []);
    const keepImages = formData.get("clearImages") === "yes" ? [] : (previous.images || []);
    const item = {
      tag: readFormText(formData, "tag") || "Alerta",
      title: readFormText(formData, "title"),
      body: readFormText(formData, "body"),
      detail: readFormText(formData, "detail"),
      prevention: readFormText(formData, "prevention"),
      tips: readFormText(formData, "tips"),
      images: [...keepImages, ...newImages]
    };
    if (editIndex !== "") data[kind][Number(editIndex)] = item;
    else data[kind].push(item);
  }

  await saveData();
  renderPublic();
  renderAdmin();
}

function readFormText(formData, field) {
  return String(formData.get(field) || "").trim();
}

function filesToDataUrls(files) {
  return Promise.all(Array.from(files).map(file => new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  })));
}

async function handleAdminClick(event) {
  const button = event.target.closest("button[data-action]");
  if (!button) return;
  const action = button.dataset.action;
  const index = Number(button.dataset.index);

  if (action === "delete" && confirm("¿Eliminar este elemento?")) {
    data[button.dataset.collection].splice(index, 1);
  }
  if (action === "edit") {
    fillCollectionForm(button.dataset.collection, index);
    return;
  }
  if (action === "delete-question" && confirm("¿Eliminar esta pregunta?")) {
    data.questions.splice(index, 1);
  }
  if (action === "edit-question") {
    fillQuestionForm(index);
    return;
  }
  if (action === "delete-report" && confirm("¿Eliminar este reporte?")) {
    const report = data.reports[index];
    if (report?.id) {
      try {
        await deleteDoc(doc(db, "reports", report.id));
      } catch (error) {
        console.warn("No se pudo eliminar reporte en Firestore.", error);
        alert("No se pudo eliminar el reporte en Firestore.");
        return;
      }
    }
    data.reports.splice(index, 1);
  }
  if (action === "promote-report") {
    const report = data.reports[index];
    data.alerts.unshift({
      tag: report.type,
      title: `Reporte ciudadano: ${report.city || "Bolivia"}`,
      body: report.story,
      detail: report.story,
      prevention: "Verifica antes de pagar; guarda evidencias; reporta perfiles sospechosos; reporta formalmente en https://bloquealaestafa.att.gob.bo/",
      tips: "Verifica antes de pagar; guarda evidencias; reporta perfiles sospechosos",
      images: report.images || []
    });
    await saveData();
    if (report?.id) {
      try {
        await deleteDoc(doc(db, "reports", report.id));
      } catch (error) {
        console.warn("La alerta fue publicada, pero no se pudo eliminar el reporte.", error);
      }
    }
    data.reports.splice(index, 1);
  }

  await saveData();
  renderPublic();
  renderAdmin();
}

function fillCollectionForm(collection, index) {
  const item = data[collection][index];
  const form = document.querySelector(`form[data-form="${collection}"]`);
  form.tag.value = item.tag || "";
  form.title.value = item.title || "";
  form.body.value = item.body || "";
  form.detail.value = item.detail || "";
  form.prevention.value = item.prevention || "";
  form.tips.value = item.tips || "";
  form.editIndex.value = index;
  form.scrollIntoView({ behavior: "smooth", block: "center" });
}

function fillQuestionForm(index) {
  const item = data.questions[index];
  const form = document.querySelector(`form[data-form="questions"]`);
  form.question.value = item[0];
  form.correct.value = item[1];
  form.wrongs.value = item[2].join("; ");
  form.editIndex.value = index;
  form.scrollIntoView({ behavior: "smooth", block: "center" });
}

initVisits();
renderPublic();
bindFirestoreContent();
bindNavigation();
bindImageViewer();
bindYanapaqBot();
bindMethodDetails();
bindReports();
bindQuiz();
bindAdmin();
