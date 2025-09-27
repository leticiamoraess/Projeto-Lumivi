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
  
  // Validar email
  if (!email || !email.includes('@')) {
    Swal.fire({
      title: 'Email inválido',
      text: 'Por favor, informe um email válido.',
      icon: 'warning',
      confirmButtonText: 'OK',
      confirmButtonColor: '#f36c9c'
    });
    return;
  }

  // Mostrar loading
  Swal.fire({
    title: 'Enviando email...',
    allowOutsideClick: false,
    allowEscapeKey: false,
    showConfirmButton: false,
    willOpen: () => {
      Swal.showLoading();
    }
  });

  sendPasswordResetEmail(auth, email)
    .then(() => {
      Swal.close();
      Swal.fire({
        title: 'Email enviado!',
        text: 'Se este email estiver cadastrado, você receberá um link para redefinir sua senha.',
        icon: 'success',
        confirmButtonText: 'OK',
        confirmButtonColor: '#ADB447'
      }).then(() => {
        window.location.href = "login.html";
      });
    })
    .catch((error) => {
      Swal.close();
      Swal.fire({
        title: 'Erro',
        text: 'Ocorreu um erro ao enviar o email de redefinição. Por favor, tente novamente.',
        icon: 'error',
        confirmButtonText: 'OK',
        confirmButtonColor: '#f36c9c'
      });
    });
});