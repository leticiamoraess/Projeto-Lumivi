import { initializeApp } from "https://www.gstatic.com/firebasejs/11.9.1/firebase-app.js";
import { getFirestore, collection, addDoc, query, orderBy, onSnapshot, serverTimestamp } from "https://www.gstatic.com/firebasejs/11.9.1/firebase-firestore.js";
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/11.9.1/firebase-auth.js";

// Sua configuração do Firebase
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

let currentUser = null;

// Verifica se o usuário está logado
onAuthStateChanged(auth, (user) => {
  currentUser = user;
  console.log("Usuário logado:", currentUser);
});

// Enviar mensagem
document.getElementById("chat-form").addEventListener("submit", async function(e) {
  e.preventDefault();
  const input = document.getElementById("chat-input");
  const text = input.value.trim();
  console.log("Tentando enviar:", text, currentUser);
  if (text && currentUser) {
    try {
      await addDoc(collection(db, "chat"), {
        text,
        user: currentUser.displayName || currentUser.email,
        timestamp: serverTimestamp()
      });
      input.value = "";
    } catch (error) {
      console.error("Erro ao enviar mensagem:", error);
      // Para este caso específico, manter o alert tradicional para não causar conflito com outros alertas
      alert("Erro ao enviar mensagem. Tente novamente.");
    }
  } else if (!currentUser) {
    // Usar alert tradicional para manter consistência com o comportamento padrão do sistema
    alert("Você precisa estar logado para enviar mensagens.");
  }
});

// Exibir mensagens em tempo real
const chatMessages = document.getElementById("chat-messages");
const q = query(collection(db, "chat"), orderBy("timestamp"));
onSnapshot(q, (snapshot) => {
  chatMessages.innerHTML = "";
  snapshot.forEach((doc) => {
    const msg = doc.data();
    const div = document.createElement("div");
    div.innerHTML = `<strong>${msg.user}:</strong> ${msg.text}`;
    chatMessages.appendChild(div);
  });
  chatMessages.scrollTop = chatMessages.scrollHeight;
});

