document.addEventListener("DOMContentLoaded", () => {
  const MAXIMO_PARTICIPANTES = 100;
  const LONGITUD_MAXIMA_LINEA = 50;
  const CLAVE_LOCALSTORAGE = "datos_participantes_sorteo_uncp";
  const CLAVE_TITULO_STORAGE = "datos_titulo_sorteo_uncp";

  const areaTextoParticipantes = document.getElementById("texto-participantes");
  const contadorVisual = document.getElementById("contador-participantes");
  const mensajeError = document.getElementById("mensaje-error-participantes");
  const radiosModo = document.querySelectorAll('input[name="modo-division"]');
  const selectorCantidad = document.getElementById("selector-cantidad");
  const campoTitulo = document.getElementById("campo-titulo-sorteo");
  const botonLimpiar = document.getElementById("boton-limpiar-sorteo");
  const botonGenerar = document.getElementById("boton-generar-equipos");

  function recuperarDatosGuardados() {
    const textoGuardado = localStorage.getItem(CLAVE_LOCALSTORAGE);
    const tituloGuardado = localStorage.getItem(CLAVE_TITULO_STORAGE);

    if (textoGuardado !== null) areaTextoParticipantes.value = textoGuardado;
    if (tituloGuardado !== null) campoTitulo.value = tituloGuardado;
    procesarEntradaParticipantes();
  }

  function guardarEnLocalStorage() {
    localStorage.setItem(CLAVE_LOCALSTORAGE, areaTextoParticipantes.value);
    localStorage.setItem(CLAVE_TITULO_STORAGE, campoTitulo.value.trim());
  }

  function obtenerListaParticipantes() {
    const lineasCrudas = areaTextoParticipantes.value.split("\n");
    const listaValida = [];
    let erroresEncontrados = [];

    lineasCrudas.forEach((linea, indice) => {
      const lineaLimpia = linea.trim();
      if (lineaLimpia.length > 0) {
        if (lineaLimpia.length > LONGITUD_MAXIMA_LINEA) {
          erroresEncontrados.push(`Línea ${indice + 1}: Supera los ${LONGITUD_MAXIMA_LINEA} caracteres.`);
        } else {
          listaValida.push(lineaLimpia);
        }
      }
    });

    if (listaValida.length > MAXIMO_PARTICIPANTES) {
      erroresEncontrados.push(`Límite superado: Máximo ${MAXIMO_PARTICIPANTES} participantes.`);
    }

    return { participantes: listaValida, errores: erroresEncontrados };
  }

  function procesarEntradaParticipantes() {
    const resultado = obtenerListaParticipantes();
    contadorVisual.textContent = resultado.participantes.length;

    if (resultado.errores.length > 0) {
      mensajeError.innerHTML = resultado.errores.join("<br>");
      mensajeError.style.display = "block";
      botonGenerar.disabled = true;
    } else {
      mensajeError.style.display = "none";
      botonGenerar.disabled = false;
    }

    guardarEnLocalStorage();
    actualizarOpcionesSelector();
  }

  function obtenerModoSeleccionado() {
    const seleccionado = document.querySelector('input[name="modo-division"]:checked');
    return seleccionado ? seleccionado.value : "equipos";
  }

  function actualizarOpcionesSelector() {
    const totalParticipantes = obtenerListaParticipantes().participantes.length;
    const modo = obtenerModoSeleccionado();
    selectorCantidad.innerHTML = "";

    const valorMaximo = Math.max(totalParticipantes, 12);

    if (modo === "equipos") {
      for (let i = 2; i <= Math.min(valorMaximo, 50); i++) {
        const opcion = document.createElement("option");
        opcion.value = i;
        opcion.textContent = `${i} equipos`;
        selectorCantidad.appendChild(opcion);
      }
    } else {
      for (let i = 1; i <= Math.min(valorMaximo, 25); i++) {
        const opcion = document.createElement("option");
        opcion.value = i;
        opcion.textContent = `${i} participantes por equipo`;
        selectorCantidad.appendChild(opcion);
      }
    }
  }

  function barajarAleatoriamente(arreglo) {
    const copia = [...arreglo];
    for (let i = copia.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [copia[i], copia[j]] = [copia[j], copia[i]];
    }
    return copia;
  }

  function ejecutarSorteoEquipos() {
    const { participantes, errores } = obtenerListaParticipantes();
    if (errores.length > 0 || participantes.length === 0) {
      alert("Por favor ingresa participantes válidos.");
      return null;
    }

    const modo = obtenerModoSeleccionado();
    const valorSeleccionado = parseInt(selectorCantidad.value, 10);
    const tituloSorteo = campoTitulo.value.trim() || "Sorteo de Equipos";

    const lideres = [];
    const normales = [];

    participantes.forEach(nombre => {
      if (nombre.startsWith("*")) {
        lideres.push(nombre.substring(1).trim());
      } else {
        normales.push(nombre);
      }
    });

    const lideresMezclados = barajarAleatoriamente(lideres);
    const normalesMezclados = barajarAleatoriamente(normales);

    let cantidadEquipos = (modo === "equipos") 
      ? Math.min(valorSeleccionado, participantes.length) 
      : Math.ceil(participantes.length / valorSeleccionado);

    if (cantidadEquipos <= 0) cantidadEquipos = 1;

    const resultadoEquipos = Array.from({ length: cantidadEquipos }, (_, indice) => ({
      numero: indice + 1,
      nombreEquipo: `Equipo ${indice + 1}`,
      integrantes: []
    }));

    lideresMezclados.forEach((lider, index) => {
      resultadoEquipos[index % cantidadEquipos].integrantes.push({ nombre: lider, esLider: true });
    });

    let turnoEquipo = lideresMezclados.length % cantidadEquipos;
    normalesMezclados.forEach(participante => {
      resultadoEquipos[turnoEquipo].integrantes.push({ nombre: participante, esLider: false });
      turnoEquipo = (turnoEquipo + 1) % cantidadEquipos;
    });

    return { titulo: tituloSorteo, totalEquipos: cantidadEquipos, equipos: resultadoEquipos };
  }

  areaTextoParticipantes.addEventListener("input", procesarEntradaParticipantes);
  campoTitulo.addEventListener("input", guardarEnLocalStorage);
  radiosModo.forEach(radio => radio.addEventListener("change", actualizarOpcionesSelector));

  botonLimpiar.addEventListener("click", () => {
    if (confirm("¿Deseas limpiar todos los campos?")) {
      areaTextoParticipantes.value = "";
      campoTitulo.value = "";
      localStorage.removeItem(CLAVE_LOCALSTORAGE);
      localStorage.removeItem(CLAVE_TITULO_STORAGE);
      procesarEntradaParticipantes();
    }
  });

  botonGenerar.addEventListener("click", () => {
    const datosSorteo = ejecutarSorteoEquipos();
    if (!datosSorteo) return;

    window.dispatchEvent(new CustomEvent("equiposGenerados", { detail: datosSorteo }));
  });

  recuperarDatosGuardados();
});