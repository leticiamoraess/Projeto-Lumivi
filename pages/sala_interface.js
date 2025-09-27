// sala_interface.js
// Lógica da interface de usuário para gerenciamento de salas

import { criarSala, obterSalasDoUsuario, entrarEmSalaPorCodigo } from './sala_backend.js';
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";
import { mostrarAlertaSucesso, mostrarAlertaErro, mostrarAlertaAviso, mostrarAlertaConfirmacao } from './alertas.js';

const auth = getAuth();

// Elementos do DOM
const createRoomForm = document.getElementById('createRoomForm');
const roomNameInput = document.getElementById('roomName');
const roomCapacityInput = document.getElementById('roomCapacity');
const requireApprovalCheckbox = document.getElementById('requireApproval');
const allowCodeJoinCheckbox = document.getElementById('allowCodeJoin');
const calendarPermissionsSelect = document.getElementById('calendarPermissions');
const chatOpenCheckbox = document.getElementById('chatOpen');
const roomCodeInput = document.getElementById('roomCode');
const joinRoomBtn = document.getElementById('joinRoomBtn');
const userRoomsList = document.getElementById('userRoomsList');

// Verificar autenticação do usuário
onAuthStateChanged(auth, (user) => {
  if (!user) {
    // Redirecionar para login se não estiver autenticado
    window.location.href = '../auth/login.html';
  } else {
    // Carregar salas do usuário
    carregarSalasDoUsuario();
  }
});

// Função para criar sala
createRoomForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  
  const usuario = auth.currentUser;
  if (!usuario) {
    await mostrarAlertaErro('Erro de autenticação', 'Você precisa estar autenticado para criar uma sala.');
    return;
  }

  // Validação do nome da sala
  if (!roomNameInput.value.trim()) {
    await mostrarAlertaAviso('Nome da sala inválido', 'Por favor, informe um nome para a sala.');
    return;
  }

  try {
    const configuracoes = {
      require_approval: requireApprovalCheckbox.checked,
      allow_code_join: allowCodeJoinCheckbox.checked,
      calendar_permissions: calendarPermissionsSelect.value,
      chat_open: chatOpenCheckbox.checked
    };

    // Mostrar loading
    Swal.fire({
      title: 'Criando sala...',
      allowOutsideClick: false,
      allowEscapeKey: false,
      showConfirmButton: false,
      willOpen: () => {
        Swal.showLoading();
      }
    });

    const sala = await criarSala(
      roomNameInput.value.trim(),
      parseInt(roomCapacityInput.value),
      configuracoes
    );

    Swal.close();
    
    await mostrarAlertaSucesso(
      'Sala criada com sucesso!', 
      `A sala "${sala.nome}" foi criada com sucesso! Código: ${sala.codigo}`
    );
    
    createRoomForm.reset();
    roomCapacityInput.value = 50;
    allowCodeJoinCheckbox.checked = true;
    chatOpenCheckbox.checked = true;
    calendarPermissionsSelect.value = 'admins_only';
    
    // Recarregar lista de salas
    setTimeout(() => carregarSalasDoUsuario(), 1000);
  } catch (error) {
    Swal.close();
    console.error('Erro ao criar sala:', error);
    await mostrarAlertaErro('Erro ao criar sala', error.message || 'Ocorreu um erro ao criar a sala. Tente novamente.');
  }
});

// Função para entrar em sala
joinRoomBtn.addEventListener('click', async () => {
  const codigo = roomCodeInput.value.trim().toUpperCase();
  
  if (codigo.length !== 8) {
    await mostrarAlertaAviso('Código inválido', 'O código da sala deve ter 8 caracteres.');
    return;
  }

  try {
    // Mostrar loading
    Swal.fire({
      title: 'Entrando na sala...',
      allowOutsideClick: false,
      allowEscapeKey: false,
      showConfirmButton: false,
      willOpen: () => {
        Swal.showLoading();
      }
    });

    const resultado = await entrarEmSalaPorCodigo(codigo);
    Swal.close();
    
    await mostrarAlertaSucesso('Sucesso!', resultado.message);
    
    if (resultado.success) {
      roomCodeInput.value = '';
      // Recarregar lista de salas
      setTimeout(() => carregarSalasDoUsuario(), 1000);
    }
  } catch (error) {
    Swal.close();
    console.error('Erro ao entrar na sala:', error);
    await mostrarAlertaErro('Erro ao entrar na sala', error.message || 'Ocorreu um erro ao entrar na sala. Tente novamente.');
  }
});

// Função para carregar e exibir salas do usuário
async function carregarSalasDoUsuario() {
  try {
    const usuario = auth.currentUser;
    if (!usuario) return;

    const salas = await obterSalasDoUsuario(usuario.uid);
    
    if (salas.length === 0) {
      userRoomsList.innerHTML = '<p>Você não faz parte de nenhuma sala ainda.</p>';
      return;
    }

    let salasHTML = '<ul class="rooms-list">';
    salas.forEach(sala => {
      salasHTML += `
        <li class="room-item">
          <div class="room-info">
            <h3>${sala.nome}</h3>
            <p>Código: ${sala.codigo}</p>
            <p>Capacidade: ${sala.capacidade}</p>
            <p>Criada em: ${sala.createdAt.toDate().toLocaleDateString()}</p>
            <p>Função: ${sala.role}</p>
          </div>
          <div class="room-actions">
            <a href="../pagina-principal/pagina-principal.html?room=${sala.id}" class="btn-primary">Acessar Sala</a>
          </div>
        </li>
      `;
    });
    salasHTML += '</ul>';
    
    userRoomsList.innerHTML = salasHTML;
  } catch (error) {
    console.error('Erro ao carregar salas do usuário:', error);
    userRoomsList.innerHTML = '<p>Erro ao carregar suas salas.</p>';
  }
}