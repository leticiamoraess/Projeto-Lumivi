# Tutorial: Integrando Firebase com Calendário FullCalendar

Este tutorial mostra como salvar eventos do calendário FullCalendar no Firebase Firestore para que persistam mesmo após recarregar a página.

## 1. Configuração Inicial do Firebase

Primeiro, certifique-se de que você tem as credenciais do Firebase no seu projeto. Se não tiver, adicione ao seu arquivo JavaScript:

```javascript
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.9.1/firebase-app.js";
import { getFirestore, collection, addDoc, getDocs, deleteDoc, doc, query, orderBy } from "https://www.gstatic.com/firebasejs/11.9.1/firebase-firestore.js";

// Substitua pela sua configuração do Firebase
const firebaseConfig = {
  apiKey: "SUA_API_KEY",
  authDomain: "SEU_PROJETO.firebaseapp.com",
  projectId: "SEU_PROJECT_ID",
  storageBucket: "SEU_STORAGE_BUCKET",
  messagingSenderId: "SEU_MESSAGING_SENDER_ID",
  appId: "SUA_APP_ID"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
```

## 2. Criando a Coleção de Eventos

No Firebase Firestore, os eventos serão armazenados em uma coleção chamada "eventos". Não é necessário criar manualmente - o Firebase cria automaticamente quando você adiciona o primeiro documento.

## 3. Modificando a Função de Adicionar Eventos

Altere a função de salvar eventos no calendário para também salvar no Firebase:

```javascript
// Função para adicionar evento ao calendário e ao Firebase
async function addEventToCalendarAndFirebase(title, date) {
  try {
    // Adicionar ao Firebase
    const docRef = await addDoc(collection(db, "eventos"), {
      title: title,
      date: date,
      createdAt: new Date()
    });
    
    console.log("Evento salvo com ID: ", docRef.id);
    
    // Adicionar ao calendário FullCalendar
    calendar.addEvent({
      id: docRef.id, // Usar o ID do Firebase como ID do evento
      title: title,
      start: date,
      allDay: true
    });
    
    return docRef.id;
  } catch (e) {
    console.error("Erro ao adicionar evento: ", e);
    alert("Erro ao salvar evento. Tente novamente.");
  }
}
```

## 4. Carregando Eventos do Firebase ao Iniciar

Modifique a inicialização do calendário para carregar eventos do Firebase:

```javascript
// Função para carregar eventos do Firebase
async function loadEventsFromFirebase() {
  try {
    const q = query(collection(db, "eventos"), orderBy("createdAt"));
    const querySnapshot = await getDocs(q);
    
    querySnapshot.forEach((doc) => {
      const eventData = doc.data();
      calendar.addEvent({
        id: doc.id,
        title: eventData.title,
        start: eventData.date,
        allDay: true
      });
    });
  } catch (e) {
    console.error("Erro ao carregar eventos: ", e);
  }
}

// Inicializar o calendário e carregar eventos
document.addEventListener('DOMContentLoaded', async function() {
  var calendarEl = document.getElementById('calendar');
  var calendar = new FullCalendar.Calendar(calendarEl, {
    initialView: 'dayGridMonth',
    fixedWeekCount: false,
    expandRows: true,
    locale: 'pt-br',
    height: 'auto',
    selectable: true,
    showNonCurrentDates: false,
    dateClick: function(info) {
      // Abrir modal ao clicar em uma data
      selectedDate = info.dateStr;
      document.getElementById('event-date').value = info.dateStr;
      document.getElementById('event-title').value = '';
      document.getElementById('event-modal').style.display = 'flex';
    }
  });
  
  calendar.render();
  
  // Carregar eventos do Firebase após inicializar o calendário
  await loadEventsFromFirebase();
});
```

## 5. Atualizando a Função de Salvar do Modal

Modifique a função do botão "Salvar" no modal para usar a nova função:

```javascript
// Salvar o evento ao clicar em Salvar
document.querySelector('.btn-save').addEventListener('click', async function() {
  const title = document.getElementById('event-title').value.trim();
  if (title && selectedDate) {
    await addEventToCalendarAndFirebase(title, selectedDate);
    document.getElementById('event-modal').style.display = 'none';
  } else {
    alert('Por favor, digite o nome do evento.');
  }
});
```

## 6. (Opcional) Adicionando Função de Remoção de Eventos

Se quiser permitir que os usuários removam eventos:

```javascript
// Função para remover evento do calendário e do Firebase
async function removeEventFromCalendarAndFirebase(eventId) {
  try {
    // Remover do Firebase
    await deleteDoc(doc(db, "eventos", eventId));
    
    // Remover do calendário
    const event = calendar.getEventById(eventId);
    if (event) {
      event.remove();
    }
    
    console.log("Evento removido com sucesso");
  } catch (e) {
    console.error("Erro ao remover evento: ", e);
    alert("Erro ao remover evento. Tente novamente.");
  }
}
```

## 7. Código Completo Integrado

Aqui está como ficaria a parte do calendário com integração completa ao Firebase:

```javascript
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.9.1/firebase-app.js";
import { getFirestore, collection, addDoc, getDocs, deleteDoc, doc, query, orderBy } from "https://www.gstatic.com/firebasejs/11.9.1/firebase-firestore.js";

// Configuração do Firebase
const firebaseConfig = {
  // Suas credenciais do Firebase aqui
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

let calendar;
let selectedDate = null;

// Função para adicionar evento ao calendário e ao Firebase
async function addEventToCalendarAndFirebase(title, date) {
  try {
    const docRef = await addDoc(collection(db, "eventos"), {
      title: title,
      date: date,
      createdAt: new Date()
    });
    
    calendar.addEvent({
      id: docRef.id,
      title: title,
      start: date,
      allDay: true
    });
    
    return docRef.id;
  } catch (e) {
    console.error("Erro ao adicionar evento: ", e);
    alert("Erro ao salvar evento. Tente novamente.");
  }
}

// Função para carregar eventos do Firebase
async function loadEventsFromFirebase() {
  try {
    const q = query(collection(db, "eventos"), orderBy("createdAt"));
    const querySnapshot = await getDocs(q);
    
    querySnapshot.forEach((doc) => {
      const eventData = doc.data();
      calendar.addEvent({
        id: doc.id,
        title: eventData.title,
        start: eventData.date,
        allDay: true
      });
    });
  } catch (e) {
    console.error("Erro ao carregar eventos: ", e);
  }
}

// Inicializar o calendário e carregar eventos
document.addEventListener('DOMContentLoaded', async function() {
  // Criar o modal (código existente)
  const modal = document.createElement('div');
  modal.className = 'modal';
  modal.id = 'event-modal';
  modal.innerHTML = `
    <div class="modal-content">
      <div class="modal-header">
        <h2>Adicionar Evento</h2>
        <button class="close-modal">&times;</button>
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
  document.body.appendChild(modal);

  var calendarEl = document.getElementById('calendar');
  calendar = new FullCalendar.Calendar(calendarEl, {
    initialView: 'dayGridMonth',
    fixedWeekCount: false,
    expandRows: true,
    locale: 'pt-br',
    height: 'auto',
    selectable: true,
    showNonCurrentDates: false,
    dateClick: function(info) {
      selectedDate = info.dateStr;
      document.getElementById('event-date').value = info.dateStr;
      document.getElementById('event-title').value = '';
      document.getElementById('event-modal').style.display = 'flex';
    }
  });
  
  calendar.render();
  
  // Carregar eventos do Firebase
  await loadEventsFromFirebase();

  // Eventos do modal (código existente)
  document.querySelector('.close-modal').addEventListener('click', function() {
    document.getElementById('event-modal').style.display = 'none';
  });

  document.querySelector('.btn-cancel').addEventListener('click', function() {
    document.getElementById('event-modal').style.display = 'none';
  });

  window.addEventListener('click', function(event) {
    const modal = document.getElementById('event-modal');
    if (event.target === modal) {
      modal.style.display = 'none';
    }
  });

  document.querySelector('.btn-save').addEventListener('click', async function() {
    const title = document.getElementById('event-title').value.trim();
    if (title && selectedDate) {
      await addEventToCalendarAndFirebase(title, selectedDate);
      document.getElementById('event-modal').style.display = 'none';
    } else {
      alert('Por favor, digite o nome do evento.');
    }
  });
});
```

## 8. Considerações Finais

- Certifique-se de que as permissões do Firestore estão configuradas corretamente
- O código acima assume que você já tem o Firebase configurado no seu projeto
- Os eventos agora serão salvos permanentemente e carregados toda vez que a página for aberta
- A função de remoção é opcional e pode ser implementada conforme a necessidade

Com essas modificações, seus eventos do calendário serão persistentes e não serão perdidos ao recarregar a página!