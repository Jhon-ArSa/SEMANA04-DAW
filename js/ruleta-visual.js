// ============================================
// MÓDULO: MOTOR VISUAL DE LA RULETA
// Integrante: Gabriel (salazar-rojas)
// ============================================

// ---------- REFERENCIAS AL DOM ----------
const lienzo = document.getElementById('lienzoRuleta');
const contexto = lienzo.getContext('2d');

// ---------- CONFIGURACIÓN ----------
const TAMAÑO_CSS = 500;
let radioRuleta = TAMAÑO_CSS / 2;
let centroX = radioRuleta;
let centroY = radioRuleta;

const coloresBasicos = [
  '#FF6B6B', // rojo pastel
  '#51CF66', // verde
  '#4DABF7', // azul
  '#B197FC', // violeta
  '#FFD43B'  // amarillo pastel
];

// ---------- ESTADO ----------
let elementosRuleta = [];
let anguloActual = 0;
let girando = false;

// ---------- INICIALIZACIÓN ----------
/**
 * Configura el canvas para pantallas retina (evita borrosidad).
 */
function configurarLienzo() {
  const dpr = window.devicePixelRatio || 1;
  lienzo.style.width = TAMAÑO_CSS + 'px';
  lienzo.style.height = TAMAÑO_CSS + 'px';
  lienzo.width = TAMAÑO_CSS * dpr;
  lienzo.height = TAMAÑO_CSS * dpr;
  contexto.setTransform(dpr, 0, 0, dpr, 0, 0);
  radioRuleta = TAMAÑO_CSS / 2;
  centroX = radioRuleta;
  centroY = radioRuleta;
}

// ---------- DIBUJO PRINCIPAL ----------
/**
 * Dibuja la ruleta completa con sectores, textos y triángulo rojo.
 * @param {Array<string>} elementos
 */
function dibujarRuleta(elementos) {
  contexto.clearRect(0, 0, TAMAÑO_CSS, TAMAÑO_CSS);
  const cantidad = elementos.length;
  if (cantidad === 0) {
    dibujarMensajeVacio();
    return;
  }

  const anguloPorSector = (2 * Math.PI) / cantidad;

  // Sombra exterior
  contexto.save();
  contexto.shadowColor = 'rgba(0,0,0,0.25)';
  contexto.shadowBlur = 15;
  contexto.beginPath();
  contexto.arc(centroX, centroY, radioRuleta - 2, 0, 2 * Math.PI);
  contexto.fillStyle = '#FFFFFF';
  contexto.fill();
  contexto.restore();

  // Sectores
  for (let i = 0; i < cantidad; i++) {
    const anguloInicio = anguloActual + i * anguloPorSector;
    const anguloFin = anguloInicio + anguloPorSector;
    const color = coloresBasicos[i % coloresBasicos.length];

    contexto.beginPath();
    contexto.moveTo(centroX, centroY);
    contexto.arc(centroX, centroY, radioRuleta - 4, anguloInicio, anguloFin);
    contexto.closePath();
    contexto.fillStyle = color;
    contexto.fill();
    contexto.strokeStyle = '#FFFFFF';
    contexto.lineWidth = 2;
    contexto.stroke();

    dibujarTextoEnSector(elementos[i], anguloInicio + anguloPorSector / 2);
  }

  // Círculo central decorativo
  contexto.beginPath();
  contexto.arc(centroX, centroY, 30, 0, 2 * Math.PI);
  contexto.fillStyle = '#FFFFFF';
  contexto.fill();
  contexto.strokeStyle = '#333';
  contexto.lineWidth = 3;
  contexto.stroke();

  dibujarTrianguloRojo();
}

/**
 * Dibuja un mensaje cuando la ruleta está vacía.
 */
function dibujarMensajeVacio() {
  contexto.beginPath();
  contexto.arc(centroX, centroY, radioRuleta - 4, 0, 2 * Math.PI);
  contexto.fillStyle = '#EEEEEE';
  contexto.fill();
  contexto.strokeStyle = '#999';
  contexto.lineWidth = 2;
  contexto.stroke();

  contexto.fillStyle = '#666';
  contexto.font = 'bold 18px Arial';
  contexto.textAlign = 'center';
  contexto.textBaseline = 'middle';
  contexto.fillText('Sin elementos', centroX, centroY);
}

/**
 * Dibuja el texto de un sector, rotado radialmente.
 */
function dibujarTextoEnSector(texto, anguloMedio) {
  const cantidad = elementosRuleta.length;

  // Tamaño de fuente adaptativo
  let tamañoFuente = 20;
  if (cantidad > 12) tamañoFuente = 16;
  if (cantidad > 20) tamañoFuente = 13;
  if (cantidad > 30) tamañoFuente = 10;

  // Truncar textos largos
  let textoMostrar = String(texto);
  const maxCaracteres = cantidad > 20 ? 8 : 14;
  if (textoMostrar.length > maxCaracteres) {
    textoMostrar = textoMostrar.substring(0, maxCaracteres) + '…';
  }

  contexto.save();
  contexto.translate(centroX, centroY);
  contexto.rotate(anguloMedio);
  contexto.textAlign = 'right';
  contexto.textBaseline = 'middle';
  contexto.fillStyle = '#1A1A1A';
  contexto.font = `bold ${tamañoFuente}px Arial`;
  contexto.fillText(textoMostrar, radioRuleta - 25, 0);
  contexto.restore();
}

/**
 * Dibuja el triángulo rojo fijo (indicador de selección).
 */
function dibujarTrianguloRojo() {
  contexto.beginPath();
  contexto.moveTo(TAMAÑO_CSS - 2, centroY);
  contexto.lineTo(TAMAÑO_CSS - 40, centroY - 18);
  contexto.lineTo(TAMAÑO_CSS - 40, centroY + 18);
  contexto.closePath();
  contexto.fillStyle = '#FF0000';
  contexto.fill();
  contexto.strokeStyle = '#8B0000';
  contexto.lineWidth = 1;
  contexto.stroke();
}

// ---------- ANIMACIÓN DE GIRO ----------
/**
 * Gira la ruleta eligiendo el ganador ANTES de animar.
 * @param {Function} alTerminar - callback({indice, valor})
 */
function girarRuleta(alTerminar) {
  if (girando || elementosRuleta.length === 0) return;
  girando = true;

  const cantidad = elementosRuleta.length;
  const anguloPorSector = (2 * Math.PI) / cantidad;

  // Elegir ganador aleatorio
  const indiceGanador = Math.floor(Math.random() * cantidad);

  // Ángulo objetivo: centro del sector ganador mirando al triángulo (ángulo 0)
  const anguloObjetivoBase =
    (2 * Math.PI - indiceGanador * anguloPorSector - anguloPorSector / 2)
    % (2 * Math.PI);

  // Vueltas completas extra (5 a 7)
  const vueltas = 5 + Math.floor(Math.random() * 3);

  // Rotación actual normalizada
  const rotacionActual = ((anguloActual % (2 * Math.PI)) + 2 * Math.PI) % (2 * Math.PI);

  // Diferencia angular necesaria
  let diferencia = anguloObjetivoBase - rotacionActual;
  if (diferencia < 0) diferencia += 2 * Math.PI;

  const anguloFinal = anguloActual + vueltas * 2 * Math.PI + diferencia;
  const anguloInicial = anguloActual;

  const duracion = 4000; // 4 segundos
  const tiempoInicio = performance.now();

  function animar(tiempoActual) {
    const transcurrido = tiempoActual - tiempoInicio;
    const progreso = Math.min(transcurrido / duracion, 1);

    // Easing out cúbico (desaceleración suave)
    const suavizado = 1 - Math.pow(1 - progreso, 3);
    anguloActual = anguloInicial + (anguloFinal - anguloInicial) * suavizado;

    dibujarRuleta(elementosRuleta);

    if (progreso < 1) {
      requestAnimationFrame(animar);
    } else {
      girando = false;
      if (typeof alTerminar === 'function') {
        alTerminar({
          indice: indiceGanador,
          valor: elementosRuleta[indiceGanador]
        });
      }
    }
  }

  requestAnimationFrame(animar);
}

// ---------- API PÚBLICA ----------
/**
 * Actualiza los elementos de la ruleta y redibuja.
 * @param {Array<string>} nuevosElementos
 */
function actualizarElementosRuleta(nuevosElementos) {
  elementosRuleta = nuevosElementos || [];
  dibujarRuleta(elementosRuleta);
}

/**
 * Devuelve true si la ruleta está girando.
 */
function estaGirando() {
  return girando;
}

// ---------- INICIALIZACIÓN AUTOMÁTICA ----------
configurarLienzo();
dibujarRuleta(elementosRuleta);

// Redibujar al redimensionar ventana
window.addEventListener('resize', () => {
  configurarLienzo();
  dibujarRuleta(elementosRuleta);
});