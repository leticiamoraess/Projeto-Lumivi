// alertas.js
// Funções de utilidade para alertas do SweetAlert

// Inicializar SweetAlert
function mostrarAlerta(titulo, texto, tipo) {
  return Swal.fire({
    title: titulo,
    text: texto,
    icon: tipo,
    confirmButtonText: 'OK',
    confirmButtonColor: '#ADB447',
    customClass: {
      popup: 'lumivi-swal-popup',
      title: 'lumivi-swal-title',
      content: 'lumivi-swal-content',
      confirmButton: 'lumivi-swal-confirm'
    }
  });
}

function mostrarAlertaSucesso(titulo, texto) {
  return mostrarAlerta(titulo, texto, 'success');
}

function mostrarAlertaErro(titulo, texto) {
  return mostrarAlerta(titulo, texto, 'error');
}

function mostrarAlertaAviso(titulo, texto) {
  return mostrarAlerta(titulo, texto, 'warning');
}

function mostrarAlertaConfirmacao(titulo, texto, textoConfirmacao = 'Sim', textoCancelamento = 'Cancelar') {
  return Swal.fire({
    title: titulo,
    text: texto,
    icon: 'question',
    showCancelButton: true,
    confirmButtonColor: '#ADB447',
    cancelButtonColor: '#f36c9c',
    confirmButtonText: textoConfirmacao,
    cancelButtonText: textoCancelamento,
    customClass: {
      popup: 'lumivi-swal-popup',
      title: 'lumivi-swal-title',
      content: 'lumivi-swal-content',
      confirmButton: 'lumivi-swal-confirm',
      cancelButton: 'lumivi-swal-cancel'
    }
  });
}

// Exportar funções
export {
  mostrarAlerta,
  mostrarAlertaSucesso,
  mostrarAlertaErro,
  mostrarAlertaAviso,
  mostrarAlertaConfirmacao
};