import { initializeApp } from "https://www.gstatic.com/firebasejs/11.9.1/firebase-app.js";
import { getAuth, GoogleAuthProvider, signInWithPopup, createUserWithEmailAndPassword, signInWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/11.9.1/firebase-auth.js";

// Inicialização do Firebase
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

// Google Login
const provider = new GoogleAuthProvider();
function loginComGoogle() {
  signInWithPopup(auth, provider)
    .then((result) => {
      const user = result.user;
      alert("Login com Google realizado!\nBem-vindo, " + (user.displayName || user.email));
      window.location.href = "../pages/pagina-principal/pagina-principal.html";    })
    .catch((error) => {
      console.error("Erro no login:", error);
      alert("Erro ao fazer login com Google: " + error.message);
    });
}
window.loginComGoogle = loginComGoogle;

// Cadastro e Login com Email/Senha
document.addEventListener("DOMContentLoaded", () => {
  const cadastroForm = document.getElementById("cadastroForm");
  const loginForm = document.getElementById("loginForm");

  // Cadastro
  if (cadastroForm) {
    cadastroForm.addEventListener("submit", function (e) {
      e.preventDefault();
      const email = document.getElementById("cadastroEmail").value;
      const senha = document.getElementById("cadastroSenha").value;

      // Validação manual de senha
      if (senha.length < 6) {
        alert("A senha deve ter pelo menos 6 caracteres.");
        return;
      }
      if (!/[a-z]/.test(senha)) {
        alert("A senha deve conter pelo menos uma letra minúscula.");
        return;
      }
      if (!/[A-Z]/.test(senha)) {
        alert("A senha deve conter pelo menos uma letra maiúscula.");
        return;
      }
      if (!/[0-9]/.test(senha)) {
        alert("A senha deve conter pelo menos um número.");
        return;
      }

      createUserWithEmailAndPassword(auth, email, senha)
        .then((userCredential) => {
          alert("Cadastro feito com sucesso! Agora faça login.");
          window.location.href = "login.html";
        })
        .catch((error) => {
          alert("Erro ao cadastrar: " + error.message);
        });
    });
  }

  // Login
  if (loginForm) {
    loginForm.addEventListener("submit", function (e) {
      e.preventDefault();
      const email = document.getElementById("loginEmail").value;
      const senha = document.getElementById("loginSenha").value;

      signInWithEmailAndPassword(auth, email, senha)
        .then((userCredential) => {
          alert("Login bem-sucedido!");
          window.location.href = "../pages/pagina-principal/pagina-principal.html";
        })
        .catch((error) => {
          alert("Email ou senha inválidos.");
        });
    });
  }
});
// Alternar visualização da senha - Cadastro
const cadastroSenhaInput = document.getElementById("cadastroSenha");
const toggleCadastroSenha = document.getElementById("toggleCadastroSenha");
const iconeOlhoCadastro = document.getElementById("iconeOlhoCadastro");

if (cadastroSenhaInput && toggleCadastroSenha && iconeOlhoCadastro) {
  toggleCadastroSenha.addEventListener("click", () => {
    if (cadastroSenhaInput.type === "password") {
      cadastroSenhaInput.type = "text";
      iconeOlhoCadastro.src = "https://img.icons8.com/?size=100&id=102646&format=png&color=000000"; // Olho fechado 
      iconeOlhoCadastro.alt = "Ocultar senha";
    } else {
      cadastroSenhaInput.type = "password";
      iconeOlhoCadastro.src = "https://img.icons8.com/?size=100&id=118858&format=png&color=000000"; // Olho aberto
      iconeOlhoCadastro.alt = "Mostrar senha";
    }
  });
}
const loginSenhaInput = document.getElementById("loginSenha");
const toggleLoginSenha = document.getElementById("toggleLoginSenha");
const iconeOlhoLogin = document.getElementById("iconeOlhoLogin");

if (loginSenhaInput && toggleLoginSenha && iconeOlhoLogin) {
  toggleLoginSenha.addEventListener("click", () => {
    if (loginSenhaInput.type === "password") {
      loginSenhaInput.type = "text";
      iconeOlhoLogin.src = "https://img.icons8.com/?size=100&id=102646&format=png&color=000000"; // Olho fechado 
      iconeOlhoLogin.alt = "Ocultar senha";
    } else {
      loginSenhaInput.type = "password";
      iconeOlhoLogin.src = "https://img.icons8.com/?size=100&id=118858&format=png&color=000000"; // Olho aberto
      iconeOlhoLogin.alt = "Mostrar senha";
    }
  });
}

// Validação visual dos requisitos da senha - SÓ NO CADASTRO
const reqMin = document.getElementById("req-min");
const reqMinusc = document.getElementById("req-minusc");
const reqMaiusc = document.getElementById("req-maiusc");
const reqNum = document.getElementById("req-num");

if (cadastroSenhaInput && reqMin && reqMinusc && reqMaiusc && reqNum) {
  cadastroSenhaInput.addEventListener("input", () => {
    const senha = cadastroSenhaInput.value;

    reqMin.className = senha.length >= 6 ? "requisito-valido" : "requisito-invalido";
    reqMinusc.className = /[a-z]/.test(senha) ? "requisito-valido" : "requisito-invalido";
    reqMaiusc.className = /[A-Z]/.test(senha) ? "requisito-valido" : "requisito-invalido";
    reqNum.className = /[0-9]/.test(senha) ? "requisito-valido" : "requisito-invalido";
  });
}
