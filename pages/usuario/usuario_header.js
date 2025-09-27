// usuario_header.js
// Funções para o header profissional na página de usuário

// Alternar tema (escuro/claro)
document.addEventListener('DOMContentLoaded', () => {
  const themeToggle = document.getElementById('toggle-theme-profissional');
  const logoutBtnHeader = document.getElementById('logout-btn-header');
  
  if (themeToggle) {
    themeToggle.addEventListener('click', () => {
      document.body.classList.toggle('dark-mode');
      const icon = themeToggle.querySelector('i');
      if (document.body.classList.contains('dark-mode')) {
        icon.className = 'fa-solid fa-sun';
        icon.style.color = '#FFD43B';
      } else {
        icon.className = 'fa-solid fa-moon';
        icon.style.color = '#ffffff';
      }
    });
  }

  if (logoutBtnHeader) {
    logoutBtnHeader.addEventListener('click', async () => {
      // Redirecionar para o botão de logout principal
      document.getElementById('logout-btn').click();
    });
  }
});