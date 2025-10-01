// -------------------- IMPORTS --------------------
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { getFirestore, collection, query, where, orderBy, addDoc, onSnapshot, getDocs } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";

// -------------------- CONFIG FIREBASE --------------------
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

// -------------------- VARIÁVEIS --------------------
let currentUser = null;

// -------------------- CHECAR PERMISSÃO --------------------
async function usuarioPodeUsarChat(uid) {
  const q = query(
    collection(db, "memberships"),
    where("userId", "==", uid),
    where("roomId", "==", roomId)
  );
  const snap = await getDocs(q);
  if (snap.empty) return false;
  return snap.docs[0].data().status !== "banned";
}

// -------------------- AUTENTICAÇÃO --------------------
onAuthStateChanged(auth, (user) => {
  if (user) {
    currentUser = user;
    iniciarChat(); // Só inicia chat depois que o user estiver definido
  } else {
    alert("Faça login para acessar o chat.");
  }
});

// -------------------- FUNÇÃO ENVIAR --------------------
async function enviarMensagem(texto) {
  if (!currentUser) {
    alert("Você precisa estar logado.");
    return;
  }

  if (!roomId) {
    alert("Sala inválida. Recarregue a página com um roomId válido.");
    return;
  }

  if (!(await usuarioPodeUsarChat(currentUser.uid))) {
    alert("Você não tem permissão para usar o chat desta sala.");
    return;
  }

  await addDoc(collection(db, "chat"), {
    text: texto,
    userId: currentUser.uid,
    userName: currentUser.displayName || currentUser.email,
    roomId: roomId, // <-- garante que a mensagem é salva na sala correta
    timestamp: new Date()
  });
}

// -------------------- CHAT --------------------
function iniciarChat() {
  const chatMessages = document.getElementById("chat-messages");
  const chatForm = document.getElementById("chat-form");
  const chatInput = document.getElementById("chat-input");

  if (!chatMessages || !chatForm || !chatInput) {
    console.error("Elementos do chat não encontrados no DOM.");
    return;
  }

  // Limpa as mensagens anteriores
  chatMessages.innerHTML = "";

  // Listener para mensagens da sala atual
  const q = query(
    collection(db, "chat"),
    where("roomId", "==", roomId), // <-- só carrega as da sala atual
    orderBy("timestamp")
  );

  onSnapshot(q, (snapshot) => {
    chatMessages.innerHTML = "";
    snapshot.forEach(doc => {
      const msg = doc.data();
      const div = document.createElement("div");
      div.classList.add("msg");
      div.textContent = `${msg.userName}: ${msg.text}`;
      chatMessages.appendChild(div);
    });

    // Sempre rola até a última mensagem
    chatMessages.scrollTop = chatMessages.scrollHeight;
  });

  // Envio de mensagem
  chatForm.addEventListener("submit", async e => {
    e.preventDefault();
    const texto = chatInput.value.trim();
    if (texto) {
      await enviarMensagem(texto);
      chatInput.value = "";
    }
  });
}
