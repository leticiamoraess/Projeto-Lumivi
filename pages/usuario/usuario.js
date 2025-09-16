import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { getFirestore, doc, setDoc, getDoc } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";
import {signOut } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";
// 🚀 Firebase config
const firebaseConfig = {
  apiKey: "AIzaSyBUxLcOvtCClJ0XMAXsDQusme7PS7Xeo9g",
  authDomain: "callppo.firebaseapp.com",
  projectId: "callppo",
  storageBucket: "callppo.firebasestorage.app",
  messagingSenderId: "631386689899",
  appId: "1:631386689899:web:6fca2231e749797458bc2e",
  measurementId: "G-4N3FPFY63T"
};

// 🔧 Inicializar Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

// 🔗 Selecionar elementos
const photoInput = document.getElementById("upload-pic");
const profilePic = document.getElementById("profile-pic");
const nameInput = document.getElementById("display-name");
const bioInput = document.getElementById("user-bio");
const saveBtn = document.getElementById("save-profile");

let base64Image = "";
let currentUserId = "";

// 🖼️ Preview de imagem e conversão para base64
photoInput.addEventListener("change", function () {
  const file = photoInput.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = function (e) {
    base64Image = e.target.result;
    profilePic.src = base64Image;
  };
  reader.readAsDataURL(file);
});

// 👤 Detectar usuário logado
onAuthStateChanged(auth, (user) => {
  if (user) {
    currentUserId = user.uid;
    carregarPerfil(currentUserId);
  } else {
    alert("Você precisa estar logado para acessar essa página.");
    window.location.href = "../../auth/login.html";
  }
});

// 🔁 Carregar dados do perfil (se existir)
async function carregarPerfil(uid) {
  try {
    const docRef = doc(db, "usuarios", uid);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      const data = docSnap.data();
      if (data.nome) nameInput.value = data.nome;
      if (data.descricao) bioInput.value = data.descricao;
      if (data.fotoBase64) {
        profilePic.src = data.fotoBase64;
        base64Image = data.fotoBase64;
      }
    }
  } catch (error) {
    console.error("Erro ao carregar perfil:", error);
  }
}

// 💾 Salvar perfil no Firestore
saveBtn.addEventListener("click", async () => {
  const nome = nameInput.value.trim();
  const descricao = bioInput.value.trim();

  if (!nome || !descricao) {
    alert("Preencha todos os campos!");
    return;
  }

  if (!currentUserId) {
    alert("Usuário não autenticado!");
    return;
  }

  try {
    await setDoc(doc(db, "usuarios", currentUserId), {
      nome: nome,
      descricao: descricao,
      fotoBase64: base64Image
    });
    alert("Perfil salvo com sucesso!");
  } catch (error) {
    console.error("Erro ao salvar perfil:", error);
    alert("Erro ao salvar perfil!");
  }
});

document.getElementById("logout-btn").addEventListener("click", async () => {
  const auth = getAuth();
  await signOut(auth);
  alert("Você saiu da sua conta!");
  window.location.href = "../../auth/login.html"; // Redireciona para a página de login
});