// firebase-init.js
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { getFirestore, collection, 
  addDoc, getDocs, query, where } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

// Configuração do Firebase
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

const calendarDiv = document.getElementById("calendar");

// Função para gerar os dias do mês atual
function gerarCalendario() {
  const hoje = new Date();
  const ano = hoje.getFullYear();
  const mes = hoje.getMonth();

  calendarDiv.innerHTML = ""; // Limpa antes de renderizar

  const ultimoDia = new Date(ano, mes + 1, 0).getDate();

  for (let i = 1; i <= ultimoDia; i++) {
    const dia = document.createElement("div");
    dia.className = "dia";
    dia.textContent = i;

    // Ao clicar no dia, adiciona evento
    dia.addEventListener("click", async () => {
      const evento = prompt(`Adicionar evento para ${i}/${mes + 1}/${ano}:`);
      if (evento) {
        try {
          await addDoc(collection(db, "eventos"), {
            dia: i,
            mes,
            ano,
            evento
          });
          alert("Evento salvo com sucesso!");
          mostrarEventos();  // Recarrega os eventos
        } catch (e) {
          console.error("Erro ao salvar evento: ", e);
          alert("Erro ao salvar evento: " + e.message);
        }
      }
    });

    calendarDiv.appendChild(dia);
  }
}

// Função para mostrar eventos no calendário
async function mostrarEventos() {
  const hoje = new Date();
  const mes = hoje.getMonth();
  const ano = hoje.getFullYear();

  const q = query(collection(db, "eventos"), where("mes", "==", mes), where("ano", "==", ano));
  const querySnapshot = await getDocs(q);

  // Limpa todos os títulos antes de adicionar novamente
  const dias = calendarDiv.querySelectorAll(".dia");
  dias.forEach(d => {
    d.style.backgroundColor = "";
    d.title = "";
  });

  // Agrupa eventos por dia
  const eventosPorDia = {};
  querySnapshot.forEach((doc) => {
    const { dia, evento } = doc.data();
    if (!eventosPorDia[dia]) eventosPorDia[dia] = [];
    eventosPorDia[dia].push(evento);
  });

  // Marca os dias com eventos
  dias.forEach(d => {
    const diaNum = parseInt(d.textContent);
    if (eventosPorDia[diaNum]) {
      d.style.backgroundColor = "#ffd1dc";
      d.title = eventosPorDia[diaNum].join('\n');
    }
  });
}

// Chama as funções na ordem correta
gerarCalendario();
mostrarEventos();