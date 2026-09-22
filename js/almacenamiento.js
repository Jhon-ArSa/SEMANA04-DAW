const CLAVE_PARTICIPANTES = "ruleta_participantes";

function guardarParticipantes(participantes) {
    localStorage.setItem(
        CLAVE_PARTICIPANTES,
        JSON.stringify(participantes)
    );
}

function cargarParticipantes() {
    const datosGuardados = localStorage.getItem(CLAVE_PARTICIPANTES);

    if (!datosGuardados) {
        return [];
    }

    try {
        const participantes = JSON.parse(datosGuardados);

        if (Array.isArray(participantes)) {
            return participantes;
        }

        return [];

    } catch (error) {
        console.error("Error al cargar los participantes:", error);
        return [];
    }
}