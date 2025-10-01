import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { getFirestore, collection, query, where, getDocs, updateDoc, doc, addDoc } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";

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

const statusDiv = document.getElementById("convite-status");

// Obtém o token da URL
const urlParams = new URLSearchParams(window.location.search);
const token = urlParams.get("token");

if (!token) {
  statusDiv.textContent = "Convite inválido.";
} else {
  onAuthStateChanged(auth, async (user) => {
    if (!user) {
      statusDiv.textContent = "Você precisa estar logado para aceitar o convite.";
      return;
    }

    // Busca o convite pelo token
    const q = query(collection(db, "invites"), where("token", "==", token));
    const snapshot = await getDocs(q);

    if (snapshot.empty) {
      statusDiv.textContent = "Convite não encontrado ou expirado.";
      return;
    }

    const conviteDoc = snapshot.docs[0];
    const convite = conviteDoc.data();

    // Verifica se já foi usado ou expirou
    if (convite.status !== "pending" || (convite.maxUses && convite.uses >= convite.maxUses)) {
      statusDiv.textContent = "Este convite já foi utilizado ou expirou.";
      return;
    }

    // Adiciona o usuário à sala
    try {
      await addDoc(collection(db, "memberships"), {
        userId: user.uid,
        roomId: convite.roomId,
        role: "member",
        status: "active",
        joinedAt: new Date()
      });
      // Atualiza o convite para marcar como usado
      await updateDoc(doc(db, "invites", conviteDoc.id), {
        uses: (convite.uses || 0) + 1,
        status: ((convite.maxUses && convite.uses + 1 >= convite.maxUses) ? "used" : "pending")
      });
      statusDiv.textContent = "Você entrou na sala com sucesso!";
      setTimeout(() => {
        window.location.href = `pagina-principal.html?roomId=${convite.roomId}`;
      }, 2000);
    } catch (e) {
      statusDiv.textContent = "Erro ao entrar na sala: " + e.message;
    }
  });
}