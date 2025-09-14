import { initializeApp } from "https://www.gstatic.com/firebasejs/11.9.1/firebase-app.js";
import { getAuth, sendPasswordResetEmail } from "https://www.gstatic.com/firebasejs/11.9.1/firebase-auth.js";

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
const auth = getAuth(app);

document.getElementById("resetForm").addEventListener("submit", function(e) {
  e.preventDefault();
  const email = document.getElementById("resetEmail").value;
  sendPasswordResetEmail(auth, email)
    .then(() => {
      alert("Se este email estiver cadastrado, você receberá um link para redefinir sua senha.");
      window.location.href = "index.html";
    })
    .catch(() => {
    
      alert("Se este email estiver cadastrado, você receberá um link para redefinir sua senha.");
      window.location.href = "index.html";
    });
});