// firebase-init.js (versão corrigida e organizada)
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import {
  getFirestore,
  collection,
  addDoc,
  getDocs,
  deleteDoc,
  doc,
  query,
  orderBy
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

// --- CONFIG FIREBASE (substitua se necessário) ---
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

// --- VARIÁVEIS GLOBAIS ---
let calendar;
let selectedDate = null;
let modal; // referência ao modal criado dinamicamente

// ----------------- FUNÇÕES ----------------- //

/**
 * Cria o modal no DOM e conecta os listeners diretamente aos botões do modal.
 * Retorna a referência ao modal criado.
 */
function createEventModal() {
  // evita criar múltiplos modais caso a função seja chamada mais de uma vez
  if (document.getElementById('event-modal')) {
    return document.getElementById('event-modal');
  }

  const m = document.createElement('div');
  m.className = 'modal';
  m.id = 'event-modal';
  m.style.display = 'none';
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

  // Referências locais aos elementos do modal
  const closeBtn = m.querySelector('.close-modal');
  const cancelBtn = m.querySelector('.btn-cancel');
  const saveBtn = m.querySelector('.btn-save');

  // fechar modal
  function hideModal() {
    m.style.display = 'none';
  }

  // Clique no X fecha
  closeBtn.addEventListener('click', () => {
    console.log('close clicked');
    hideModal();
  });

  // Cancelar fecha
  cancelBtn.addEventListener('click', () => {
    console.log('cancel clicked');
    hideModal();
  });

  // Clique no overlay (mas somente se clicar fora do conteúdo)
  m.addEventListener('click', (e) => {
    if (e.target === m) {
      console.log('overlay clicked');
      hideModal();
    }
  });

  // Salvar (usa a função que persiste no Firebase)
  saveBtn.addEventListener('click', async () => {
    const titleInput = m.querySelector('#event-title');
    const title = titleInput.value.trim();
    if (!title || !selectedDate) {
      alert('Por favor, digite o nome do evento.');
      return;
    }
    console.log('Save clicked - title:', title, 'date:', selectedDate);

    // chama função que salva no Firebase e adiciona ao calendário
    await addEventToCalendarAndFirebase(title, selectedDate);

    // limpa e fecha modal
    titleInput.value = '';
    hideModal();
  });

  return m;
}

/**
 * Mostra o modal para a data selecionada
 */
function showEventModal(dateStr) {
  selectedDate = dateStr;
  if (!modal) modal = createEventModal();
  modal.querySelector('#event-date').value = dateStr;
  modal.querySelector('#event-title').value = '';
  modal.style.display = 'flex';
  // foco no input de título para usabilidade
  modal.querySelector('#event-title').focus();
}

/**
 * Adiciona evento no Firestore e no FullCalendar
 */
async function addEventToCalendarAndFirebase(title, date) {
  try {
    const docRef = await addDoc(collection(db, "eventos"), {
      title: title,
      date: date,
      createdAt: new Date()
    });

    // garante que calendar exista
    if (!calendar) {
      console.warn('Calendar não inicializado ainda ao adicionar evento localmente.');
    } else {
      calendar.addEvent({
        id: docRef.id,
        title: title,
        start: date,
        allDay: true
      });
    }

    console.log("Evento salvo com ID:", docRef.id);
    return docRef.id;
  } catch (e) {
    console.error("Erro ao adicionar evento:", e);
    alert("Erro ao salvar evento. Tente novamente.");
  }
}

/**
 * Carrega eventos do Firestore e adiciona ao calendário.
 */
async function loadEventsFromFirebase() {
  try {
    const q = query(collection(db, "eventos"), orderBy("createdAt"));
    const querySnapshot = await getDocs(q);

    querySnapshot.forEach((docSnap) => {
      const eventData = docSnap.data();
      // Algumas vezes o campo date pode vir como string; FullCalendar aceita ISO string
      calendar.addEvent({
        id: docSnap.id,
        title: eventData.title,
        start: eventData.date,
        allDay: true
      });
    });
    console.log("Eventos carregados do Firebase!");
  } catch (e) {
    console.error("Erro ao carregar eventos:", e);
  }
}

/**
 * (Opcional) Remover evento do Firebase e do calendário
 */
async function removeEventFromCalendarAndFirebase(eventId) {
  try {
    await deleteDoc(doc(db, "eventos", eventId));
    const event = calendar.getEventById(eventId);
    if (event) event.remove();
    console.log("Evento removido com sucesso!");
  } catch (e) {
    console.error("Erro ao remover evento:", e);
  }
}

// ----------------- INICIALIZAÇÃO ----------------- //
document.addEventListener('DOMContentLoaded', async function () {
  // cria modal (e seus listeners) antes de usar
  modal = createEventModal();

  // inicializa o FullCalendar
  const calendarEl = document.getElementById('calendar');
  calendar = new FullCalendar.Calendar(calendarEl, {
    initialView: 'dayGridMonth',
    fixedWeekCount: false,
    expandRows: true,
    locale: 'pt-br',
    height: 'auto',
    selectable: true,
    showNonCurrentDates: false,
    dateClick: function (info) {
      // mostra o modal (com a data selecionada)
      showEventModal(info.dateStr);
    },
    eventClick: function(info) {
      // Exemplo: perguntar se quer deletar
      const doDelete = confirm(`Deseja remover o evento "${info.event.title}"?`);
      if (doDelete && info.event.id) {
        removeEventFromCalendarAndFirebase(info.event.id);
      }
    }
  });

  calendar.render();

  // carrega eventos salvos no Firebase
  await loadEventsFromFirebase();
});
