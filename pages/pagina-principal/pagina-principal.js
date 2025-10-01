// ======== Inicialização do Firebase ===========
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";
import { getFirestore, collection, query, where, getDocs } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyBUxLcOvtCClJ0XMAXsDQusme7PS7Xeo9g",
  authDomain: "callppo.firebaseapp.com",
  projectId: "callppo",
  storageBucket: "callppo.firebasestorage.app",
  messagingSenderId: "631386689899",
  appId: "1:631386689899:web:6fca2231e749797458bc2e",
  measurementId: "G-4N3FPFY63T"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

// ======== Funções auxiliares ==================
function obterIdDaSalaAtual() {
  const urlParams = new URLSearchParams(window.location.search);
  return urlParams.get("roomId");
}

// Tornando roomId global para ser acessado por outros módulos
window.roomId = obterIdDaSalaAtual();
const roomId = window.roomId;

async function usuarioEhMembroAtivo(uid, roomId) {
  const q = query(
    collection(db, "memberships"),
    where("userId", "==", uid),
    where("roomId", "==", roomId),
    where("status", "==", "active")
  );
  const snap = await getDocs(q);
  return !snap.empty;
}

// ======== Após autenticação ===================
onAuthStateChanged(auth, async (user) => {
  if (!user || !roomId) {
    window.location.href = "../sala_interface.html";
    return;
  }

  if (!(await usuarioEhMembroAtivo(user.uid, roomId))) {
    document.body.innerHTML = "<h2>Você não faz parte desta sala ou está banido.</h2>";
    return;
  }

  // ---------- Modo escuro ----------
  const themeToggle = document.getElementById("toggle-theme");
  if (themeToggle) {
    themeToggle.onclick = function () {
      document.body.classList.toggle("dark-mode");
      const icon = this.querySelector("i");
      if (document.body.classList.contains("dark-mode")) {
        icon.className = "fa-solid fa-sun";
        icon.style.color = "#FFD43B";
      } else {
        icon.className = "fa-solid fa-moon";
        icon.style.color = "#ffffff";
      }
    };
  }


  // ---------- Rádio ----------
  const soundBtn = document.getElementById("sound-btn");
  const player = document.getElementById("player");
  if (soundBtn && player) {
    soundBtn.onclick = function () {
      const img = document.getElementById("sound-img");
      player.muted = !player.muted;
      img.src = player.muted ? "img/sound-off.png" : "img/sound.png";
    };
    player.volume = 0.2;
    player.play();
  }

  // ---------- Canal de voz ----------
  async function usuarioPodeUsarVoz(uid) {
    const q = query(
      collection(db, "memberships"),
      where("userId", "==", uid),
      where("roomId", "==", roomId)
    );
    const snap = await getDocs(q);
    if (snap.empty) return false;
    return snap.docs[0].data().status !== "banned";
  }

  async function loadJitsiMeet() {
    if (!(await usuarioPodeUsarVoz(auth.currentUser.uid))) {
      alert("Você não tem permissão para usar o canal de voz.");
      return;
    }
    const domain = "meet.jit.si";
    const options = {
      roomName: "Sala LUMIVI",
      width: "100%",
      height: 500,
      parentNode: document.querySelector('#jitsi-container'),
      configOverwrite: {
        startWithVideoMuted: true,
        startWithAudioMuted: true
      }, interfaceConfigOverwrite: {
        SHOW_JITSI_WATERMARK: false,
        SHOW_BRAND_WATERMARK: false,
        TOOLBAR_BUTTONS: [
          'microphone', 'hangup', 'chat', 'settings'
        ]
        }
    };

    new JitsiMeetExternalAPI(domain, options);
  }

  // Adiciona botão do canal de voz
  const voiceBox = document.querySelector(".voice-box");
  if (voiceBox) {
    const joinButton = document.createElement("button");
    joinButton.textContent = "Entrar no Canal de Voz";
    joinButton.id = "join-voice-channel";
    joinButton.style.padding = "10px";
    joinButton.style.margin = "10px auto";
    joinButton.style.display = "block";
    joinButton.style.backgroundColor = "#ADB447";
    joinButton.style.color = "white";
    joinButton.style.border = "none";
    joinButton.style.borderRadius = "10px";
    joinButton.style.cursor = "pointer";
    joinButton.onclick = loadJitsiMeet;
    voiceBox.appendChild(joinButton);
  }

  // ---------- EXPANDIR / FECHAR caixas ----------
  const overlay = document.getElementById("container-overlay");
  const chatBox = document.querySelector(".chat-box");
  const calendarBox = document.querySelector(".calendar-box");
  const voiceBoxElement = document.querySelector(".voice-box");

  function closeExpandedContainer() {
    document.querySelectorAll(".box.expanded").forEach((box) => {
      box.classList.remove("expanded");
      const closeBtn = box.querySelector(".close-btn");
      if (closeBtn) closeBtn.remove();
    });
    overlay.classList.remove("show");
  }

  function expandContainer(container) {
    closeExpandedContainer();
    container.classList.add("expanded");

    const closeBtn = document.createElement("button");
    closeBtn.classList.add("close-btn");
    closeBtn.innerHTML = "&times;";
    closeBtn.setAttribute("aria-label", "Fechar");
    closeBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      closeExpandedContainer();
    });
    container.appendChild(closeBtn);

    setTimeout(() => overlay.classList.add("show"), 10);
  }

  if (overlay) {
    overlay.addEventListener("click", (e) => e.stopPropagation());
  }

  if (chatBox) {
    chatBox.addEventListener("click", (e) => {
      if (!e.target.closest("#chat-form") && !e.target.closest("#chat-messages")) {
        expandContainer(chatBox);
      }
    });
  }

  if (calendarBox) {
    calendarBox.addEventListener("click", (e) => {
      if (!e.target.closest(".fc-button") && !e.target.closest(".fc-event")) {
        expandContainer(calendarBox);
      }
    });
  }

  if (voiceBoxElement) {
    voiceBoxElement.addEventListener("click", (e) => {
      if (
        !e.target.closest("#join-voice-channel") &&
        !e.target.closest("#jitsi-container")
      ) {
        expandContainer(voiceBoxElement);
      }
    });
  }

  // ---------- Relógio ----------
  function atualizarHora() {
    const agora = new Date();
    const h = String(agora.getHours()).padStart(2, "0");
    const m = String(agora.getMinutes()).padStart(2, "0");
    const s = String(agora.getSeconds()).padStart(2, "0");
    document.getElementById("hora").textContent = `${h}:${m}:${s}`;
  }
  setInterval(atualizarHora, 1000);
  atualizarHora();
});
