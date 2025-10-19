// CONFIGURACIÓN
const CONFIG = {
    jsonbinId: '68f445ed43b1c97be9701261',
    jsonbinApiKey: '$2a$10$Uwte524/p56MUpYn79uOsuzSVBP6VU8AqNKw8figIKdsE1PrtnCLi'
};

let socios = [];

// CARGAR SOCIOS AL INICIAR
document.addEventListener('DOMContentLoaded', function() {
    console.log('🚀 Dashboard Admin cargado');
    cargarSocios();
});

// CARGAR LISTA DE SOCIOS
async function cargarSocios() {
    try {
        const response = await fetch(`https://api.jsonbin.io/v3/b/${CONFIG.jsonbinId}`, {
            headers: {'X-Master-Key': CONFIG.jsonbinApiKey}
        });
        
        if (response.ok) {
            const data = await response.json();
            socios = data.record.apicultores || [];
            actualizarEstadisticas();
            mostrarSocios();
        }
    } catch (error) {
        console.error('Error cargando socios:', error);
        alert('Error al cargar los datos');
    }
}

// ACTUALIZAR ESTADÍSTICAS
function actualizarEstadisticas() {
    const totalSocios = socios.length;
    const sociosActivos = socios.filter(s => s.activo).length;
    const totalColmenas = socios.reduce((sum, s) => sum + (s.colmenas || 0), 0);
    const produccionTotal = socios.reduce((sum, s) => sum + (s.produccionUltima || 0), 0);

    document.getElementById('total-socios').textContent = totalSocios;
    document.getElementById('socios-activos').textContent = sociosActivos;
    document.getElementById('total-colmenas').textContent = totalColmenas;
    document.getElementById('produccion-total').textContent = produccionTotal + ' kg';
}

// MOSTRAR SOCIOS EN LA GRILLA
function mostrarSocios() {
    const container = document.getElementById('lista-socios');
    container.innerHTML = '';

    socios.forEach(socio => {
        const card = document.createElement('div');
        card.className = `socio-card ${socio.activo ? '' : 'inactivo'}`;
        
        // Determinar estado
        let estado = 'activo';
        let estadoText = 'ACTIVO';
        if (!socio.activo) {
            estado = 'inactivo';
            estadoText = 'INACTIVO';
        } else if (!socio.cuotaAlDia) {
            estado = 'deudor';
            estadoText = 'DEUDOR';
        }

        card.innerHTML = `
            <h3>
                ${socio.nombre}
                <span class="estado-badge ${estado}">${estadoText}</span>
            </h3>
            <div class="socio-info">
                <p>📞 ${socio.telefono}</p>
                <p>📍 ${socio.ubicacion || 'Sin ubicación'}</p>
                <p>📅 Registro: ${new Date(socio.fechaRegistro).toLocaleDateString()}</p>
            </div>
            <div class="socio-stats">
                <div class="stat">
                    <div class="number">${socio.colmenas || 0}</div>
                    <div class="label">Colmenas</div>
                </div>
                <div class="stat">
                    <div class="number">${socio.produccionUltima || 0}</div>
                    <div class="label">kg Miel</div>
                </div>
                <div class="stat">
                    <div class="number">${socio.deudaMaquinaria || 0}</div>
                    <div class="label">kg Deuda</div>
                </div>
            </div>
            <p><strong>Última cura:</strong> ${socio.ultimaCura || 'No registrada'}</p>
            <p><strong>Próxima cura:</strong> ${socio.proximaCura || 'No programada'}</p>
            <button class="btn-editar" onclick="editarSocio(${socio.id})">
                ✏️ Editar Socio
            </button>
        `;
        
        container.appendChild(card);
    });
}

// MOSTRAR FORMULARIO NUEVO SOCIO
function mostrarFormularioNuevo() {
    document.getElementById('formulario-nuevo').classList.remove('hidden');
}

// OCULTAR FORMULARIO
function ocultarFormulario() {
    document.getElementById('formulario-nuevo').classList.add('hidden');
}

// GUARDAR NUEVO SOCIO
async function guardarNuevoSocio() {
    const nombre = document.getElementById('nuevo-nombre').value;
    const telefono = document.getElementById('nuevo-telefono').value;
    const colmenas = parseInt(document.getElementById('nuevo-colmenas').value) || 0;
    const ubicacion = document.getElementById('nuevo-ubicacion').value;

    if (!nombre || !telefono) {
        alert('❌ Nombre y teléfono son obligatorios');
        return;
    }

    const nuevoSocio = {
        id: Date.now(),
        fechaRegistro: new Date().toISOString(),
        nombre: nombre,
        telefono: telefono,
        activo: true,
        colmenas: colmenas,
        ubicacion: ubicacion,
        cuotaAlDia: true,
        deudaMaquinaria: 0,
        produccionUltima: 0,
        ultimaCura: '',
        proximaCura: ''
    };

    try {
        // Agregar a la lista existente
        const nuevosSocios = [...socios, nuevoSocio];
        
        const response = await fetch(`https://api.jsonbin.io/v3/b/${CONFIG.jsonbinId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'X-Master-Key': CONFIG.jsonbinApiKey
            },
            body: JSON.stringify({
                sistema: "Coapé Apícola - Gestión Completa",
                ultimaActualizacion: new Date().toISOString(),
                totalApicultores: nuevosSocios.length,
                apicultores: nuevosSocios
            })
        });

        if (response.ok) {
            alert('✅ Socio registrado exitosamente!');
            ocultarFormulario();
            // Limpiar formulario
            document.getElementById('nuevo-nombre').value = '';
            document.getElementById('nuevo-telefono').value = '';
            document.getElementById('nuevo-colmenas').value = '';
            document.getElementById('nuevo-ubicacion').value = '';
            
            // Recargar datos
            cargarSocios();
        }
    } catch (error) {
        alert('❌ Error al guardar el socio: ' + error.message);
    }
}

// EDITAR SOCIO (SIMPLIFICADO)
function editarSocio(id) {
    const socio = socios.find(s => s.id === id);
    if (socio) {
        // En una versión completa, aquí abrirías un modal de edición
        alert(`✏️ Editando a: ${socio.nombre}\n\n(En una versión completa, aquí se abriría un formulario de edición)`);
    }
}

// EXPORTAR DATOS
function exportarDatos() {
    const datos = {
        fechaExportacion: new Date().toISOString(),
        totalSocios: socios.length,
        socios: socios
    };
    
    const blob = new Blob([JSON.stringify(datos, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `coape-socios-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
}

// CERRAR SESIÓN
function cerrarSesion() {
    if (confirm('¿Está seguro de que desea cerrar sesión?')) {
        window.location.href = 'index.html';
    }
}