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
document.getElementById('sound-btn').onclick = function() {
    const img = document.getElementById('sound-img');
    if (img.src.includes('sound.png')) {
        img.src = 'img/sound-off.png';
    } else {
        img.src = 'img/sound.png';
    }
};

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
});

document.addEventListener('DOMContentLoaded', function() {
  const modal = document.createElement('div');
  modal.className = 'modal';
  modal.id = 'event-modal';
  modal.innerHTML = `
    <div class="modal-content">
      <div class="modal-header">
        <h2>Adicionar Evento</h2>
        <button class="close-modal">&times;</button>
      </div>
      <div class="modal-body">
        <label for="event-date">Data:</label>
        <input type="text" id="event-date" readonly>
        <label for="event-title">Evento:</label>
        <input type="text" id="event-title" placeholder="Digite o nome do evento">
      </div>
      <div class="modal-footer">
        <button class="btn-modal btn-cancel">Cancelar</button>
        <button class="btn-modal btn-save">Salvar</button>
      </div>
    </div>
  `;
  document.body.appendChild(modal);

  let selectedDate = null;

  var calendarEl = document.getElementById('calendar');
  var calendar = new FullCalendar.Calendar(calendarEl, {
    initialView: 'dayGridMonth',
    fixedWeekCount: false,
    expandRows: true,
    locale: 'pt-br',
    height: 'auto',
    selectable: true,
    showNonCurrentDates: false,
    dateClick: function(info) {
      selectedDate = info.dateStr;
      document.getElementById('event-date').value = info.dateStr;
      document.getElementById('event-title').value = '';
      document.getElementById('event-modal').style.display = 'flex';
    }
  });
  calendar.render();

  document.querySelector('.close-modal').addEventListener('click', function() {
    document.getElementById('event-modal').style.display = 'none';
  });

  document.querySelector('.btn-cancel').addEventListener('click', function() {
    document.getElementById('event-modal').style.display = 'none';
  });

  window.addEventListener('click', function(event) {
    const modal = document.getElementById('event-modal');
    if (event.target === modal) {
      modal.style.display = 'none';
    }
  });

  document.querySelector('.btn-save').addEventListener('click', function() {
    const title = document.getElementById('event-title').value.trim();
    if (title && selectedDate) {
      calendar.addEvent({
        title: title,
        start: selectedDate,
        allDay: true
      });
      document.getElementById('event-modal').style.display = 'none';
    } else {
      alert('Por favor, digite o nome do evento.');
    }
  });
});

    