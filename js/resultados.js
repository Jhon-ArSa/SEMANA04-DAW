/**
 * MÓDULO: RESULTADOS Y EXPORTACIÓN DEL SORTEO DE EQUIPOS
 * Rol: Jefferson (Pregunta 2.c y 2.d)
 * Conectado con el módulo de Juan (sorteo.equipos.js)
 */

document.addEventListener("DOMContentLoaded", () => {
  // Elementos de la interfaz
  const seccionConfiguracion = document.querySelector(".panel-sorteo");
  const seccionResultados = document.getElementById("pantalla-resultados-sorteo");
  const tituloResultados = document.getElementById("titulo-pantalla-resultados");
  const rejillaEquipos = document.getElementById("rejilla-equipos");
  const botonVolver = document.getElementById("boton-volver-configuracion");

  // Botones de acción (F4)
  const botonDescargarJpg = document.getElementById("boton-descargar-jpg");
  const botonCopiarPortapapeles = document.getElementById("boton-copiar-portapapeles");
  const botonCopiarColumnas = document.getElementById("boton-copiar-columnas");
  const notificacionToast = document.getElementById("notificacion-copiado");
  const lienzoCanvas = document.getElementById("lienzo-exportacion-jpg");

  // Estado del sorteo recibido desde el módulo de Juan
  let datosSorteoActual = null;
  let temporizadoresAnimacion = [];

  // Función utilitaria para avisos temporales
  function mostrarNotificacion(texto) {
    if (!notificacionToast) return;
    notificacionToast.textContent = texto;
    notificacionToast.style.display = "block";
    setTimeout(() => {
      notificacionToast.style.display = "none";
    }, 2500);
  }

  function cancelarAnimacionesEnCurso() {
    temporizadoresAnimacion.forEach((id) => clearTimeout(id));
    temporizadoresAnimacion = [];
  }

  // ==========================================================================
  // F3: PANTALLA 2, TARJETAS RECTANGULARES Y REVELACIÓN SECUENCIAL UNO A UNO
  // ==========================================================================
  function renderizarPantallaResultados(datos) {
    if (!datos || !datos.equipos || datos.equipos.length === 0) return;

    datosSorteoActual = datos;
    cancelarAnimacionesEnCurso();

    // Cambiar de pantalla
    if (seccionConfiguracion) seccionConfiguracion.style.display = "none";
    if (seccionResultados) seccionResultados.style.display = "block";

    // Asignar título generado por Juan
    if (tituloResultados) {
      tituloResultados.textContent = datos.titulo || "Sorteo de Equipos";
    }

    rejillaEquipos.innerHTML = "";
    const referenciasEquipos = [];

    // 1. Crear las tarjetas rectangulares con su subtítulo de equipo
    datos.equipos.forEach((equipo) => {
      const tarjeta = document.createElement("div");
      tarjeta.className = "tarjeta-equipo";

      const cabecera = document.createElement("div");
      cabecera.className = "tarjeta-equipo-encabezado";
      cabecera.textContent = equipo.nombreEquipo;

      const listaUl = document.createElement("ul");
      listaUl.className = "lista-integrantes";

      tarjeta.appendChild(cabecera);
      tarjeta.appendChild(listaUl);
      rejillaEquipos.appendChild(tarjeta);

      referenciasEquipos.push({
        contenedorUl: listaUl,
        integrantes: equipo.integrantes
      });
    });

    // 2. Animación secuencial: aparecer integrantes uno a uno alternando entre equipos
    let tiempoEspera = 100;
    let hayMasPorMostrar = true;
    let indiceParticipante = 0;

    while (hayMasPorMostrar) {
      hayMasPorMostrar = false;

      for (let i = 0; i < referenciasEquipos.length; i++) {
        const grupo = referenciasEquipos[i];

        if (indiceParticipante < grupo.integrantes.length) {
          hayMasPorMostrar = true;
          const integrante = grupo.integrantes[indiceParticipante];
          const listaDestino = grupo.contenedorUl;

          const temporizador = setTimeout(() => {
            const elementoLi = document.createElement("li");
            elementoLi.className = "item-integrante animacion-aparecer";

            if (integrante.esLider) {
              elementoLi.innerHTML = `<span class="etiqueta-lider">★</span> <strong>${integrante.nombre}</strong>`;
            } else {
              elementoLi.textContent = integrante.nombre;
            }

            listaDestino.appendChild(elementoLi);
          }, tiempoEspera);

          temporizadoresAnimacion.push(temporizador);
          tiempoEspera += 130; // Cadencia de aparición
        }
      }
      indiceParticipante++;
    }
  }

  // Botón para retornar a la pantalla de Juan
  if (botonVolver) {
    botonVolver.addEventListener("click", () => {
      cancelarAnimacionesEnCurso();
      if (seccionResultados) seccionResultados.style.display = "none";
      if (seccionConfiguracion) seccionConfiguracion.style.display = "grid";
    });
  }

  // ==========================================================================
  // F4: BOTÓN 1 - COPIAR AL PORTAPAPELES (TEXTO ESTRUCTURADO)
  // ==========================================================================
  if (botonCopiarPortapapeles) {
    botonCopiarPortapapeles.addEventListener("click", async () => {
      if (!datosSorteoActual) return;

      let salida = `${datosSorteoActual.titulo.toUpperCase()}\n`;
      salida += `${"=".repeat(datosSorteoActual.titulo.length)}\n\n`;

      datosSorteoActual.equipos.forEach((equipo) => {
        salida += `[ ${equipo.nombreEquipo} ]\n`;
        equipo.integrantes.forEach((integrante, idx) => {
          const marcaLider = integrante.esLider ? " (Líder)" : "";
          salida += `  ${idx + 1}. ${integrante.nombre}${marcaLider}\n`;
        });
        salida += "\n";
      });

      try {
        await navigator.clipboard.writeText(salida);
        mostrarNotificacion("¡Equipos copiados al portapapeles!");
      } catch (error) {
        alert("Error al copiar: " + error);
      }
    });
  }

  // ==========================================================================
  // F4: BOTÓN 2 - COPIAR EQUIPOS POR COLUMNAS (FORMATO TABULAR TSV)
  // ==========================================================================
  if (botonCopiarColumnas) {
    botonCopiarColumnas.addEventListener("click", async () => {
      if (!datosSorteoActual) return;

      const equipos = datosSorteoActual.equipos;
      const encabezado = equipos.map((e) => e.nombreEquipo).join("\t");
      const lineas = [encabezado];

      const maxIntegrantes = Math.max(...equipos.map((e) => e.integrantes.length));

      for (let f = 0; f < maxIntegrantes; f++) {
        const filaActual = [];
        for (let c = 0; c < equipos.length; c++) {
          const integrante = equipos[c].integrantes[f];
          if (integrante) {
            filaActual.push(integrante.esLider ? `*${integrante.nombre}` : integrante.nombre);
          } else {
            filaActual.push("");
          }
        }
        lineas.push(filaActual.join("\t"));
      }

      try {
        await navigator.clipboard.writeText(lineas.join("\n"));
        mostrarNotificacion("¡Columnas copiadas! Listo para pegar en Excel.");
      } catch (error) {
        alert("Error al copiar columnas: " + error);
      }
    });
  }

  // ==========================================================================
  // F4: BOTÓN 3 - DESCARGAR EN JPG MEDIANTE CANVAS NATIVO (SIN LIBRERÍAS)
  // ==========================================================================
  if (botonDescargarJpg) {
    botonDescargarJpg.addEventListener("click", () => {
      if (!datosSorteoActual || !lienzoCanvas) return;

      const equipos = datosSorteoActual.equipos;
      const totalEquipos = equipos.length;
      const columnas = Math.min(totalEquipos, 4);
      const filas = Math.ceil(totalEquipos / columnas);

      const anchoTarjeta = 230;
      const altoCabecera = 40;
      const altoFilaTexto = 24;
      const margen = 30;
      const separacion = 20;

      const maxIntegrantes = Math.max(...equipos.map((e) => e.integrantes.length));
      const altoTarjeta = altoCabecera + (maxIntegrantes * altoFilaTexto) + 20;

      const anchoLienzo = (margen * 2) + (columnas * anchoTarjeta) + ((columnas - 1) * separacion);
      const altoLienzo = 110 + (filas * altoTarjeta) + ((filas - 1) * separacion) + margen;

      lienzoCanvas.width = anchoLienzo;
      lienzoCanvas.height = altoLienzo;
      const ctx = lienzoCanvas.getContext("2d");

      // Fondo blanco del lienzo
      ctx.fillStyle = "#ffffff";
      ctx.fillRect(0, 0, anchoLienzo, altoLienzo);

      // Título
      ctx.fillStyle = "#db2777";
      ctx.font = "bold 22px Arial, sans-serif";
      ctx.textAlign = "center";
      ctx.fillText(datosSorteoActual.titulo, anchoLienzo / 2, 45);

      // Subtítulo
      ctx.fillStyle = "#6b7280";
      ctx.font = "12px Arial, sans-serif";
      ctx.fillText("UNCP - Desarrollo de Aplicaciones Web", anchoLienzo / 2, 70);

      // Dibujar tarjetas
      equipos.forEach((equipo, idx) => {
        const c = idx % columnas;
        const f = Math.floor(idx / columnas);
        const x = margen + c * (anchoTarjeta + separacion);
        const y = 95 + f * (altoTarjeta + separacion);

        // Caja
        ctx.fillStyle = "#ffffff";
        ctx.strokeStyle = "#e5e7eb";
        ctx.lineWidth = 1.5;
        ctx.fillRect(x, y, anchoTarjeta, altoTarjeta);
        ctx.strokeRect(x, y, anchoTarjeta, altoTarjeta);

        // Cabecera rosa
        ctx.fillStyle = "#fdf2f8";
        ctx.fillRect(x, y, anchoTarjeta, altoCabecera);
        ctx.strokeStyle = "#fbcfe8";
        ctx.beginPath();
        ctx.moveTo(x, y + altoCabecera);
        ctx.lineTo(x + anchoTarjeta, y + altoCabecera);
        ctx.stroke();

        // Subtítulo del equipo
        ctx.fillStyle = "#be185d";
        ctx.font = "bold 14px Arial, sans-serif";
        ctx.textAlign = "left";
        ctx.fillText(equipo.nombreEquipo, x + 12, y + 25);

        // Lista de integrantes
        ctx.font = "13px Arial, sans-serif";
        equipo.integrantes.forEach((integrante, pIdx) => {
          const lineaY = y + altoCabecera + 22 + (pIdx * altoFilaTexto);
          if (integrante.esLider) {
            ctx.fillStyle = "#d97706";
            ctx.fillText("★ ", x + 12, lineaY);
            ctx.fillStyle = "#111827";
            ctx.font = "bold 13px Arial, sans-serif";
            ctx.fillText(integrante.nombre, x + 28, lineaY);
            ctx.font = "13px Arial, sans-serif";
          } else {
            ctx.fillStyle = "#374151";
            ctx.fillText(`${pIdx + 1}. ${integrante.nombre}`, x + 12, lineaY);
          }
        });
      });

      // Descarga directa del archivo JPG
      const enlace = document.createElement("a");
      enlace.download = `${datosSorteoActual.titulo.replace(/\s+/g, "_")}.jpg`;
      enlace.href = lienzoCanvas.toDataURL("image/jpeg", 0.95);
      enlace.click();
      mostrarNotificacion("Descargando imagen JPG...");
    });
  }

  // ==========================================================================
  // CONEXIÓN DIRECTA CON EL MÓDULO DE JUAN
  // ==========================================================================
  // Escucha el evento CustomEvent que emite el script de Juan al pulsar 'Generar equipos'
  window.addEventListener("equiposGenerados", (evento) => {
    renderizarPantallaResultados(evento.detail);
  });
});