// CONFIGURACIÓN
const CONFIG = {
    jsonbinId: '68f445ed43b1c97be9701261',
    jsonbinApiKey: '$2a$10$Uwte524/p56MUpYn79uOsuzSVBP6VU8AqNKw8figIKdsE1PrtnCLi'
};

let socioActual = null;
let todosLosSocios = [];

// CARGAR DATOS AL INICIAR
document.addEventListener('DOMContentLoaded', function() {
    console.log('🚀 Vista Socio cargada');
    cargarDatosSocio();
});

// CARGAR DATOS DEL SOCIO ACTUAL
async function cargarDatosSocio() {
    const socioId = localStorage.getItem('socioActual');
    
    if (!socioId) {
        alert('❌ No se encontró información del socio. Redirigiendo al login...');
        window.location.href = 'index.html';
        return;
    }

    try {
        const response = await fetch(`https://api.jsonbin.io/v3/b/${CONFIG.jsonbinId}`, {
            headers: {'X-Master-Key': CONFIG.jsonbinApiKey}
        });
        
        if (response.ok) {
            const data = await response.json();
            todosLosSocios = data.record.apicultores || [];
            
            // Buscar el socio actual
            socioActual = todosLosSocios.find(s => s.id == socioId);
            
            if (socioActual) {
                mostrarDatosSocio();
                generarAlertas();
            } else {
                alert('❌ Socio no encontrado en los registros');
                window.location.href = 'index.html';
            }
        }
    } catch (error) {
        console.error('Error cargando datos:', error);
        alert('Error al cargar los datos del socio');
    }
}

// MOSTRAR DATOS DEL SOCIO EN LA INTERFAZ
function mostrarDatosSocio() {
    // Header
    document.getElementById('socio-nombre').textContent = socioActual.nombre;
    document.getElementById('socio-telefono').textContent = socioActual.telefono;
    
    // Banner de bienvenida
    document.getElementById('bienvenida-texto').textContent = `Bienvenido, ${socioActual.nombre.split(' ')[0]}`;
    
    // Estadísticas principales
    document.getElementById('stat-colmenas').textContent = socioActual.colmenas || 0;
    document.getElementById('stat-produccion').textContent = (socioActual.produccionUltima || 0) + ' kg';
    document.getElementById('stat-cuota').textContent = socioActual.cuotaAlDia ? 'AL DÍA ✅' : 'PENDIENTE ❌';
    document.getElementById('stat-deuda').textContent = (socioActual.deudaMaquinaria || 0) + ' kg';
    
    // Información personal
    document.getElementById('info-nombre').textContent = socioActual.nombre;
    document.getElementById('info-telefono').textContent = socioActual.telefono;
    document.getElementById('info-ubicacion').textContent = socioActual.ubicacion || 'No especificada';
    
    const estadoBadge = document.getElementById('info-estado');
    estadoBadge.textContent = socioActual.activo ? 'ACTIVO' : 'INACTIVO';
    estadoBadge.className = socioActual.activo ? 'badge' : 'badge danger';
    
    // Gestión apícola
    document.getElementById('info-total-colmenas').textContent = socioActual.colmenas || 0;
    document.getElementById('info-produccion').textContent = (socioActual.produccionUltima || 0) + ' kg';
    document.getElementById('info-ultima-cura').textContent = socioActual.ultimaCura || 'No registrada';
    document.getElementById('info-proxima-cura').textContent = socioActual.proximaCura || 'No programada';
    
    // Situación económica
    document.getElementById('info-cuota').innerHTML = socioActual.cuotaAlDia ? 
        '<span style="color: #27ae60;">AL DÍA ✅</span>' : 
        '<span style="color: #e74c3c;">PENDIENTE ❌</span>';
    
    document.getElementById('info-deuda-maquinaria').textContent = (socioActual.deudaMaquinaria || 0) + ' kg';
    
    // Calcular saldo (producción - deuda)
    const saldo = (socioActual.produccionUltima || 0) - (socioActual.deudaMaquinaria || 0);
    document.getElementById('info-saldo').innerHTML = saldo >= 0 ? 
        `<span style="color: #27ae60;">${saldo} kg ✅</span>` : 
        `<span style="color: #e74c3c;">${Math.abs(saldo)} kg ❌</span>`;
    
    document.getElementById('info-actualizacion').textContent = new Date(socioActual.fechaRegistro).toLocaleDateString();
    
    // Recordatorios
    document.getElementById('recordatorio-cura').textContent = socioActual.proximaCura || 'No programada';
    document.getElementById('recordatorio-cuota').textContent = socioActual.cuotaAlDia ? 'AL DÍA' : 'PENDIENTE';
}

// GENERAR ALERTAS IMPORTANTES
function generarAlertas() {
    const alertasContainer = document.getElementById('alertas-container');
    alertasContainer.innerHTML = '';
    
    const alertas = [];
    
    // Alerta de cuota pendiente
    if (!socioActual.cuotaAlDia) {
        alertas.push({
            tipo: 'warning',
            mensaje: '⚠️ Tu cuota societaria se encuentra pendiente de pago.',
            accion: 'Por favor, regulariza tu situación.'
        });
    }
    
    // Alerta de cura próxima
    if (socioActual.proximaCura) {
        const proximaCuraDate = new Date(socioActual.proximaCura);
        const hoy = new Date();
        const diasRestantes = Math.ceil((proximaCuraDate - hoy) / (1000 * 60 * 60 * 24));
        
        if (diasRestantes <= 7 && diasRestantes > 0) {
            alertas.push({
                tipo: 'warning',
                mensaje: `📅 Tu próxima cura está programada para dentro de ${diasRestantes} días.`,
                accion: 'Fecha: ' + socioActual.proximaCura
            });
        } else if (diasRestantes <= 0) {
            alertas.push({
                tipo: 'danger',
                mensaje: '❌ La fecha de tu próxima cura ya pasó.',
                accion: 'Por favor, programa una nueva cura.'
            });
        }
    }
    
    // Alerta de producción baja
    if ((socioActual.produccionUltima || 0) < 50 && (socioActual.colmenas || 0) > 10) {
        alertas.push({
            tipo: 'warning',
            mensaje: '🍯 Tu producción parece estar por debajo del promedio.',
            accion: 'Considerá consultar con el técnico apícola.'
        });
    }
    
    // Si no hay alertas, mostrar mensaje positivo
    if (alertas.length === 0) {
        alertas.push({
            tipo: 'success',
            mensaje: '✅ Todo en orden! Tu situación actual es favorable.',
            accion: '¡Seguí así!'
        });
    }
    
    // Mostrar alertas
    alertas.forEach(alerta => {
        const alertDiv = document.createElement('div');
        alertDiv.className = `alert ${alerta.tipo === 'danger' ? 'warning' : alerta.tipo}`;
        alertDiv.innerHTML = `
            <div style="flex: 1;">
                <strong>${alerta.mensaje}</strong>
                <div style="font-size: 14px; margin-top: 5px;">${alerta.accion}</div>
            </div>
        `;
        alertasContainer.appendChild(alertDiv);
    });
}

// FUNCIONES DE ACCIÓN (SIMULADAS)

function solicitarActualizacion() {
    alert('📞 Tu solicitud de actualización de datos ha sido enviada.\n\nEl administrador se contactará contigo pronto.');
}

function reportarProduccion() {
    const nuevaProduccion = prompt('🍯 Ingresá tu producción de la última cosecha (en kg):');
    if (nuevaProduccion && !isNaN(nuevaProduccion)) {
        alert(`✅ Producción de ${nuevaProduccion} kg reportada exitosamente.\n\nEl administrador actualizará tus registros.`);
    }
}

function consultarEstadoCuenta() {
    const estado = `
    💳 ESTADO DE CUENTA DETALLADO:

    👤 ${socioActual.nombre}
    📞 ${socioActual.telefono}

    📊 SITUACIÓN ACTUAL:
    • Colmenas: ${socioActual.colmenas || 0}
    • Producción última: ${socioActual.produccionUltima || 0} kg
    • Deuda maquinaria: ${socioActual.deudaMaquinaria || 0} kg
    • Saldo: ${(socioActual.produccionUltima || 0) - (socioActual.deudaMaquinaria || 0)} kg

    💰 CUOTA SOCIETARIA: ${socioActual.cuotaAlDia ? 'AL DÍA ✅' : 'PENDIENTE ❌'}

    🏥 ÚLTIMA CURA: ${socioActual.ultimaCura || 'No registrada'}
    📅 PRÓXIMA CURA: ${socioActual.proximaCura || 'No programada'}

    📍 Para más detalles, contactá a la administración.
    `.trim();
    
    alert(estado);
}

function verCalendarioCompleto() {
    alert('🗓️ CALENDARIO APÍCOLA COAPÉ:\n\n' +
          '• 3 Curas anuales recomendadas\n' +
          '• Época de cosecha: Octubre-Noviembre\n' +
          '• Reuniones: Primer sábado de cada mes\n' +
          '• Vencimiento cuotas: Fin de mes\n\n' +
          '📞 Consultá fechas específicas con administración.');
}

// CERRAR SESIÓN
function cerrarSesion() {
    if (confirm('¿Está seguro de que desea cerrar sesión?')) {
        localStorage.removeItem('socioActual');
        window.location.href = 'index.html';
    }
}