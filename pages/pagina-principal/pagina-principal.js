function atualizarHora() {
    var agora = new Date();
    var horas = agora.getHours();
    var minutos = agora.getMinutes();
    var segundos = agora.getSeconds();

    horas = (horas < 10 ? "0" : "") + horas;
    minutos = (minutos < 10 ? "0" : "") + minutos;
    segundos = (segundos < 10 ? "0" : "") + segundos;

    var horario = horas + ":" + minutos + ":" + segundos;

    document.getElementById("hora").innerHTML = horario;
}

setInterval(atualizarHora, 1000);
atualizarHora();

// Atualizar o toggle de tema para funcionar com o novo design
document.getElementById('toggle-theme').onclick = function() {
    document.body.classList.toggle('dark-mode');
    const icon = this.querySelector('i');
    if (document.body.classList.contains('dark-mode')) {
        icon.className = 'fa-solid fa-sun';
        icon.style.color = '#FFD43B';
    } else {
        icon.className = 'fa-solid fa-moon';
        icon.style.color = '#ffffff';
    }
};

// Atualizar o botão de som para funcionar com o novo design
document.getElementById('sound-btn').onclick = function() {
    const img = document.getElementById('sound-img');
    const player = document.getElementById('player');
    if (player.muted) {
        player.muted = false;
        img.src = 'img/sound.png';
    } else {
        player.muted = true;
        img.src = 'img/sound-off.png';
    }
};
const player = document.getElementById('player');
player.volume = 0.2;
player.play();

document.getElementById('radio-img').onclick = function() {
    const player = document.getElementById('player');
    if (player.paused) {
        player.play();
    } else {
        player.pause();
    }
};

function loadJitsiMeet() {
  // Mostrar confirmação antes de entrar no canal de voz
  Swal.fire({
    title: 'Entrar no Canal de Voz',
    text: 'Você está prestes a entrar no canal de voz. Deseja continuar?',
    icon: 'question',
    showCancelButton: true,
    confirmButtonColor: '#ADB447',
    cancelButtonColor: '#f36c9c',
    confirmButtonText: 'Sim, entrar',
    cancelButtonText: 'Cancelar'
  }).then((result) => {
    if (result.isConfirmed) {
      const script = document.createElement('script');
      script.src = 'https://meet.jit.si/external_api.js';
      script.onload = function() {
        const domain = "meet.jit.si";
        const options = {
          roomName: "TCCSalaDaBarbara",
          width: "100%",
          height: 500,
          parentNode: document.querySelector('#jitsi-container'),
          configOverwrite: {
            startWithVideoMuted: true,
            startWithAudioMuted: true
          },
          interfaceConfigOverwrite: {
            SHOW_JITSI_WATERMARK: false,
            SHOW_BRAND_WATERMARK: false,
            TOOLBAR_BUTTONS: [
              'microphone', 'hangup', 'chat', 'settings'
            ]
          }
        };
        
        const joinButton = document.getElementById('join-voice-channel');
        if (joinButton) {
          joinButton.remove();
        }
        
        const api = new JitsiMeetExternalAPI(domain, options);
      };
      
      document.head.appendChild(script);
    }
  });
}

document.addEventListener('DOMContentLoaded', function() {
  const voiceBox = document.querySelector('.voice-box');
  const joinButton = document.createElement('button');
  joinButton.id = 'join-voice-channel';
  joinButton.textContent = 'Entrar no Canal de Voz';
  joinButton.style.padding = '10px';
  joinButton.style.margin = '10px auto';
  joinButton.style.display = 'block';
  joinButton.style.backgroundColor = '#ADB447';
  joinButton.style.color = 'white';
  joinButton.style.border = 'none';
  joinButton.style.borderRadius = '10px';
  joinButton.style.cursor = 'pointer';
  
  joinButton.addEventListener('click', loadJitsiMeet);
  
  voiceBox.appendChild(joinButton);

  // Função para expandir containers
  const overlay = document.getElementById('container-overlay');
  const chatBox = document.querySelector('.chat-box');
  const calendarBox = document.querySelector('.calendar-box');
  const voiceBoxElement = document.querySelector('.voice-box');
  
  // Função para fechar qualquer container expandido
  function closeExpandedContainer() {
    const expandedBoxes = document.querySelectorAll('.box.expanded');
    expandedBoxes.forEach(box => {
      box.classList.remove('expanded');
      // Remove o botão de fechar se existir
      const closeBtn = box.querySelector('.close-btn');
      if (closeBtn) {
        closeBtn.remove();
      }
    });
    overlay.classList.remove('show');
  }
  
  // Impede que cliques no overlay fechem o container - o fechamento só ocorre ao clicar no botão X
  overlay.addEventListener('click', function(e) {
    // Não fazer nada quando o overlay for clicado
    e.stopPropagation();
  });
  function expandContainer(container) {
    // Fecha qualquer container expandido antes
    closeExpandedContainer();
    
    // Adiciona a classe de expansão ao container clicado
    container.classList.add('expanded');
    
    // Cria e adiciona o botão de fechar
    const closeBtn = document.createElement('button');
    closeBtn.classList.add('close-btn');
    closeBtn.innerHTML = '&times;'; // símbolo de "X"
    closeBtn.setAttribute('aria-label', 'Fechar');
    
    // Adiciona evento de clique para fechar o container
    closeBtn.addEventListener('click', function(e) {
      e.stopPropagation(); // Evita que o clique no botão dispare outros eventos
      closeExpandedContainer();
    });
    
    container.appendChild(closeBtn);
    
    // Mostra o overlay com transição suave
    setTimeout(() => {
      overlay.classList.add('show');
    }, 10); // Pequeno delay para garantir a transição suave
  }
  
  // Adiciona eventos de clique aos containers
  if (chatBox) {
    chatBox.addEventListener('click', function(e) {
      // Não expandir se o clique for no input ou botão de envio da mensagem
      if (!e.target.closest('#chat-form') && !e.target.closest('#chat-messages')) {
        expandContainer(chatBox);
      }
    });
  }
  
  if (calendarBox) {
    calendarBox.addEventListener('click', function(e) {
      // Não expandir se o clique for em um elemento interno específico
      if (!e.target.closest('.fc-button') && !e.target.closest('.fc-event')) {
        expandContainer(calendarBox);
      }
    });
  }
  
  if (voiceBoxElement) {
    voiceBoxElement.addEventListener('click', function(e) {
      // Não expandir se o clique for no botão do canal de voz ou no container do Jitsi
      if (!e.target.closest('#join-voice-channel') && !e.target.closest('#jitsi-container')) {
        expandContainer(voiceBoxElement);
      }
    });
  }
});