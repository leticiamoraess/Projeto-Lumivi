// ----------------- IMPORTS -----------------
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { 
  getFirestore, collection, query, where, orderBy, addDoc, getDocs, deleteDoc, doc 
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";

// ----------------- CONFIGURAÇÃO FIREBASE -----------------
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

// ----------------- VARIÁVEIS -----------------
let calendar;
let selectedDate = null;
let modal;

// ----------------- FUNÇÕES AUXILIARES -----------------
function obterIdDaSalaAtual() {
  const urlParams = new URLSearchParams(window.location.search);
  return urlParams.get("roomId");
}
const roomId = obterIdDaSalaAtual();

// ----------------- MODAL -----------------
function createEventModal() {
  if (document.getElementById("event-modal")) {
    return document.getElementById("event-modal");
  }

  const m = document.createElement("div");
  m.className = "modal";
  m.id = "event-modal";
  m.style.display = "none";

  m.innerHTML = `
    <div class="modal-content">
      <div class="modal-header">
        <h2>Adicionar Evento</h2>
        <button class="close-modal" aria-label="Fechar">&times;</button>
      </div>
      <div class="modal-body">
        <label for="event-date">Data:</label>
        <input type="text" id="event-date" readonly>
        <label for="event-title">Evento:</label>
        <input type="text" id="event-title" placeholder="Digite o nome do evento">
      </div>
      <div class="modal-footer">
        <button class="btn-modal btn-cancel">Cancelar</button>
        <button class="btn-modal btn-save">Salvar</button>
      </div>
    </div>
  `;

  document.body.appendChild(m);

  // Botões do modal
  const closeBtn = m.querySelector(".close-modal");
  const cancelBtn = m.querySelector(".btn-cancel");
  const saveBtn = m.querySelector(".btn-save");

  const hideModal = () => { m.style.display = "none"; };

  closeBtn.addEventListener("click", hideModal);
  cancelBtn.addEventListener("click", hideModal);

  m.addEventListener("click", (e) => {
    if (e.target === m) hideModal();
  });

  // Salvar evento
  saveBtn.addEventListener("click", async () => {
    const titleInput = m.querySelector("#event-title");
    const title = titleInput.value.trim();
    if (!title || !selectedDate) {
      await Swal.fire({
        title: "Dados incompletos",
        text: "Por favor, digite o nome do evento.",
        icon: "warning",
        confirmButtonText: "OK",
        confirmButtonColor: "#f36c9c"
      });
      return;
    }

    try {
      await addEventToCalendarAndFirebase(title, selectedDate);
      titleInput.value = "";
      hideModal();
      await Swal.fire({
        title: "Evento salvo!",
        text: "O evento foi adicionado ao calendário com sucesso.",
        icon: "success",
        confirmButtonText: "OK",
        confirmButtonColor: "#ADB447"
      });
    } catch (error) {
      console.error("Erro ao salvar evento:", error);
      await Swal.fire({
        title: "Erro",
        text: "Ocorreu um erro ao salvar o evento. Tente novamente.",
        icon: "error",
        confirmButtonText: "OK",
        confirmButtonColor: "#f36c9c"
      });
    }
  });

  return m;
}

function showEventModal(dateStr) {
  selectedDate = dateStr;
  if (!modal) modal = createEventModal();
  modal.querySelector("#event-date").value = dateStr;
  modal.querySelector("#event-title").value = "";
  modal.style.display = "flex";
  modal.querySelector("#event-title").focus();
}

// ----------------- FIREBASE FUNÇÕES -----------------
async function addEventToCalendarAndFirebase(title, date) {
  const user = auth.currentUser;
  if (!user) {
    alert("Faça login para adicionar eventos.");
    return;
  }
  const docRef = await addDoc(collection(db, "eventos"), {
    title,
    date,
    roomId,
    createdAt: new Date()
  });

  calendar.addEvent({
    id: docRef.id,
    title,
    start: date,
    allDay: true
  });
}

async function loadEventsFromFirebase() {
  const q = query(collection(db, "eventos"), where("roomId", "==", roomId), orderBy("createdAt"));
  const snapshot = await getDocs(q);
  snapshot.forEach(docSnap => {
    const ev = docSnap.data();
    calendar.addEvent({
      id: docSnap.id,
      title: ev.title,
      start: ev.date,
      allDay: true
    });
  });
}

async function removeEventFromCalendarAndFirebase(eventId) {
  await deleteDoc(doc(db, "eventos", eventId));
  const event = calendar.getEventById(eventId);
  if (event) event.remove();
}

// ----------------- INICIALIZAÇÃO -----------------
document.addEventListener("DOMContentLoaded", async () => {
  modal = createEventModal();

  const calendarEl = document.getElementById("calendar");
  calendar = new FullCalendar.Calendar(calendarEl, {
    initialView: "dayGridMonth",
    fixedWeekCount: false,
    expandRows: true,
    locale: "pt-br",
    height: "auto",
    selectable: true,
    dateClick: (info) => showEventModal(info.dateStr),
    eventClick: (info) => {
      Swal.fire({
        title: "Evento",
        html: `<strong>${info.event.title}</strong><br><small>${info.event.start.toLocaleDateString()}</small>`,
        icon: "info",
        showCancelButton: true,
        confirmButtonColor: "#f36c9c",
        cancelButtonColor: "#ADB447",
        confirmButtonText: "Excluir",
        cancelButtonText: "Fechar"
      }).then((result) => {
        if (result.isConfirmed && info.event.id) {
          removeEventFromCalendarAndFirebase(info.event.id);
          Swal.fire({
            title: "Excluído!",
            text: "O evento foi removido com sucesso.",
            icon: "success",
            confirmButtonText: "OK",
            confirmButtonColor: "#ADB447"
          });
        }
      });
    }
  });

  calendar.render();
  await loadEventsFromFirebase();
});
