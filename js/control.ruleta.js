document.addEventListener("DOMContentLoaded", () => {
  const areaTextarea = document.getElementById('areaTextarea');
  const lienzoRuleta = document.getElementById('lienzoRuleta');
  const txtRespuesta = document.getElementById('respuesta');
  const cajaResultado = document.getElementById('cajaResultado');

  // Función para procesar y actualizar los elementos desde el textarea
  const actualizarDesdeTextarea = () => {
    if (!areaTextarea) return;
    
    const elementos = areaTextarea.value
      .split('\n')
      .map(l => l.trim())
      .filter(l => l !== '');

    if (typeof actualizarElementosRuleta === 'function') {
      actualizarElementosRuleta(elementos);
    }
  };

  // Inicialización al cargar la página
  actualizarDesdeTextarea();

  // Escuchar cambios en el textarea para agregar/quitar nombres en tiempo real
  if (areaTextarea) {
    areaTextarea.addEventListener('input', actualizarDesdeTextarea);
  }

  // Giro al hacer clic en la ruleta y reflejar el resultado en el apartado
  if (lienzoRuleta) {
    lienzoRuleta.addEventListener('click', () => {
      if (typeof girarRuleta === 'function') {
        girarRuleta((ganador) => {
          if (txtRespuesta) txtRespuesta.textContent = "Ganador: " + ganador.valor;
          if (cajaResultado) cajaResultado.textContent = ganador.valor;
        });
      }
    });
  }
});