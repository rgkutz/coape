// 🐝 COAPÉ ESQUINA - Sistema de Gestión Apícola
// 📍 Esquina, Corrientes - Argentina

//console.log('🚀 Sistema de Login Coapé - Versión Administrativa Completa');

// ==================== CONFIGURACIÓN INICIAL ====================
const CONFIG = {
    version: '2.0',
    cooperativa: 'COAPÉ ESQUINA',
    ubicacion: 'Esquina, Corrientes, Argentina'
};

// ==================== BASE DE DATOS DE USUARIOS ====================
let usuariosCoape = JSON.parse(localStorage.getItem('usuariosCoape')) || {
    // Usuarios administrativos
    'admin': { 
        password: 'coape2025', 
        nombre: 'Administrador Principal', 
        rol: 'administrador',
        telefono: '-',
        zona: 'Cooperativa',
        colmenas: 0
    },
    'raúl': { 
        password: 'coape123', 
        nombre: 'Raúl Grandoli', 
        rol: 'directivo',
        telefono: '-',
        zona: 'Ruta 153',
        colmenas: 0
    },
    'patricia': { 
        password: 'coape123', 
        nombre: 'Patricia Piccolini', 
        rol: 'directivo', 
        telefono: '-',
        zona: 'Cooperativa',
        colmenas: 0
    },
    
    // Socios de ejemplo - DATOS COMPLETOS
    'gabriel': {
        password: 'coape123',
        nombre: 'Gabriel Kutz',
        rol: 'socio',
        telefono: '3764760385',
        zona: 'Centro',
        colmenas: 2,
        produccion: 5,
        estadoCuota: 'AL DÍA',
        deudaMaquinaria: 0,
        ultimaCura: '01/10/2024'
    },
    'juan': {
        password: 'coape123',
        nombre: 'Juan Pérez',
        rol: 'socio',
        telefono: '3764123456',
        zona: 'Ruta 153',
        colmenas: 5,
        produccion: 12,
        estadoCuota: 'AL DÍA',
        deudaMaquinaria: 2,
        ultimaCura: '01/09/2024'
    },
    'maria': {
        password: 'coape123',
        nombre: 'María González',
        rol: 'socio',
        telefono: '3764987654',
        zona: 'Río Corrientes',
        colmenas: 8,
        produccion: 20,
        estadoCuota: 'PENDIENTE',
        deudaMaquinaria: 0,
        ultimaCura: '01/08/2024'
    }
};

// ==================== FUNCIONES DEL LOGIN ====================
function seleccionarTipo(tipo) {
    document.querySelectorAll('.user-btn').forEach(btn => btn.classList.remove('active'));
    event.target.classList.add('active');
    
    document.getElementById('personal-form').classList.add('hidden');
    document.getElementById('socio-form').classList.add('hidden');
    document.getElementById(tipo + '-form').classList.remove('hidden');
}

function accederSistema() {
    const mensaje = document.getElementById('mensaje');
    mensaje.textContent = '';
    
    // Determinar qué formulario está activo
    const tipoPersonal = !document.getElementById('personal-form').classList.contains('hidden');
    
    let usuario, password;
    
    if (tipoPersonal) {
        usuario = document.getElementById('admin-usuario').value.trim().toLowerCase();
        password = document.getElementById('admin-password').value;
    } else {
        usuario = document.getElementById('socio-usuario').value.trim().toLowerCase();
        password = document.getElementById('socio-password').value;
    }
    
    // Validaciones
    if (!usuario || !password) {
        mensaje.textContent = '❌ Por favor complete todos los campos';
        return;
    }
    
    // Verificar credenciales
    if (usuariosCoape[usuario] && usuariosCoape[usuario].password === password) {
        const userData = usuariosCoape[usuario];
        
        // Guardar sesión - FORMATO COMPLETO
        localStorage.setItem('usuarioActual', JSON.stringify({
            usuario: usuario,
            nombre: userData.nombre,
            rol: userData.rol,
            telefono: userData.telefono,
            zona: userData.zona,
            colmenas: userData.colmenas,
            produccion: userData.produccion,
            estadoCuota: userData.estadoCuota,
            deudaMaquinaria: userData.deudaMaquinaria,
            ultimaCura: userData.ultimaCura
        }));
        
        mensaje.textContent = '✅ Acceso correcto, redirigiendo...';
        mensaje.style.color = 'green';
        
        // Redirigir según el rol
        setTimeout(() => {
            if (userData.rol === 'socio') {
                window.location.href = 'socio.html';
            } else {
                window.location.href = 'admin.html';
            }
        }, 1000);
        
    } else {
        mensaje.textContent = '❌ Usuario o contraseña incorrectos';
    }
}

function irAPanelAdmin() {
    window.location.href = 'admin.html';
}

// ==================== FUNCIONES DEL PANEL ADMINISTRATIVO ====================
function volverALogin() {
    window.location.href = 'index.html';
}

function agregarSocio() {
    const usuario = document.getElementById('nuevo-usuario').value.trim().toLowerCase();
    const password = document.getElementById('nueva-password').value;
    const nombre = document.getElementById('nombre-completo').value.trim();
    const telefono = document.getElementById('telefono').value.trim();
    const zona = document.getElementById('zona').value;
    const colmenas = parseInt(document.getElementById('colmenas').value) || 0;
    
    // Validaciones
    if (!usuario || !password || !nombre) {
        alert('❌ Complete usuario, contraseña y nombre');
        return;
    }
    
    if (usuariosCoape[usuario]) {
        alert('❌ Este usuario ya existe');
        return;
    }
    
    // Agregar nuevo socio con datos completos
    usuariosCoape[usuario] = {
        password: password,
        nombre: nombre,
        rol: 'socio',
        telefono: telefono,
        zona: zona,
        colmenas: colmenas,
        produccion: 0,
        estadoCuota: 'PENDIENTE',
        deudaMaquinaria: 0,
        ultimaCura: new Date().toLocaleDateString(),
        fechaRegistro: new Date().toLocaleDateString()
    };
    
    // Guardar en localStorage
    localStorage.setItem('usuariosCoape', JSON.stringify(usuariosCoape));
    
    // Limpiar formulario
    document.getElementById('nuevo-usuario').value = '';
    document.getElementById('nueva-password').value = '';
    document.getElementById('nombre-completo').value = '';
    document.getElementById('telefono').value = '';
    document.getElementById('colmenas').value = '0';
    
    // Actualizar lista
    cargarListaSocios();
    
    alert('✅ Socio agregado correctamente');
}

function cargarListaSocios() {
    const lista = document.getElementById('lista-socios');
    const buscar = document.getElementById('buscar-socio').value.toLowerCase();
    
    let html = '';
    let totalSocios = 0;
    let totalColmenas = 0;
    let sociosActivos = 0;
    
    Object.keys(usuariosCoape).forEach(usuario => {
        const socio = usuariosCoape[usuario];
        
        // Solo mostrar socios (no administradores)
        if (socio.rol === 'socio') {
            // Filtrar búsqueda
            if (buscar && !socio.nombre.toLowerCase().includes(buscar) && 
                !socio.zona.toLowerCase().includes(buscar)) {
                return;
            }
            
            totalSocios++;
            totalColmenas += socio.colmenas || 0;
            if (socio.colmenas > 0) sociosActivos++;
            
            html += `
                <div class="socio-item">
                    <div class="socio-info">
                        <strong>${socio.nombre}</strong>
                        <span>Usuario: ${usuario}</span>
                        <span>Tel: ${socio.telefono || '-'}</span>
                        <span>Zona: ${socio.zona}</span>
                        <span>Colmenas: ${socio.colmenas || 0}</span>
                        <span>Producción: ${socio.produccion || 0} kg</span>
                    </div>
                    <div class="socio-actions">
                        <button onclick="editarSocio('${usuario}')">✏️ Editar</button>
                        <button onclick="eliminarSocio('${usuario}')" class="btn-danger">🗑️ Eliminar</button>
                    </div>
                </div>
            `;
        }
    });
    
    lista.innerHTML = html || '<p>No hay socios registrados</p>';
    
    // Actualizar estadísticas
    document.getElementById('total-socios').textContent = totalSocios;
    document.getElementById('total-colmenas').textContent = totalColmenas;
    document.getElementById('socios-activos').textContent = sociosActivos;
}

function filtrarSocios() {
    cargarListaSocios();
}

function editarSocio(usuario) {
    const socio = usuariosCoape[usuario];
    
    document.getElementById('nuevo-usuario').value = usuario;
    document.getElementById('nueva-password').value = socio.password;
    document.getElementById('nombre-completo').value = socio.nombre;
    document.getElementById('telefono').value = socio.telefono || '';
    document.getElementById('zona').value = socio.zona;
    document.getElementById('colmenas').value = socio.colmenas || 0;
    
    alert(`✏️ Editando socio: ${socio.nombre}. Modifique los campos y haga clic en "Agregar Socio" para actualizar.`);
}

function eliminarSocio(usuario) {
    if (confirm(`¿Está seguro de eliminar al socio ${usuariosCoape[usuario].nombre}?`)) {
        delete usuariosCoape[usuario];
        localStorage.setItem('usuariosCoape', JSON.stringify(usuariosCoape));
        cargarListaSocios();
        alert('✅ Socio eliminado correctamente');
    }
}

// ==================== INICIALIZACIÓN ====================
document.addEventListener('DOMContentLoaded', function() {
    console.log('✅ Sistema Coapé inicializado');
    
    // Guardar la base de datos inicial si no existe
    if (!localStorage.getItem('usuariosCoape')) {
        localStorage.setItem('usuariosCoape', JSON.stringify(usuariosCoape));
    }
    
    // Si estamos en el panel administrativo, cargar datos
    if (window.location.pathname.includes('admin.html')) {
        cargarListaSocios();
    }
    
    // Verificar si hay usuario en sesión
    const usuarioActual = localStorage.getItem('usuarioActual');
    if (usuarioActual) {
        console.log('👤 Usuario en sesión:', JSON.parse(usuarioActual));
    }
});

console.log('✅ Login mejorado cargado completamente');