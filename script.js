// SISTEMA COAPE - GESTIÓN APÍCOLA COMPLETA
const sistemaCoape = {
  // CONFIGURACIÓN JSONBIN
  config: {
    jsonbinId: '68f445ed43b1c97be9701261',
    jsonbinApiKey: '$2a$10$Uwte524/p56MUpYn79uOsuzSVBP6VU8AqNKw8figIKdsE1PrtnCLi'
  },

  // GUARDAR DATOS DE APICULTOR
  async guardarApicultor() {
    const nombre = prompt("🐝 Nombre del apicultor:");
    if (!nombre) return; // Si cancela, salimos
    
    const telefono = prompt("📞 Teléfono:");
    const activo = confirm("¿Es productor ACTIVO?\\n\\nOK = Sí\\nCancelar = No");
    const colmenas = parseInt(prompt("¿Cuántas colmenas tiene?") || "0");
    const ubicacion = prompt("📍 Ubicación de las colmenas:");
    
    const ultimaCura = prompt("🏥 Última cura aplicada (fecha):");
    const proximaCura = prompt("📅 Próxima cura programada:");
    
    const cuotaAlDia = confirm("¿Cuota societaria AL DÍA?\\n\\nOK = Sí\\nCancelar = No");
    const deudaMaquinaria = parseFloat(prompt("Deuda por maquinaria (en kg):") || "0");
    const produccion = parseFloat(prompt("🍯 Producción última cosecha (kg):") || "0");

    const apicultor = {
      id: Date.now(),
      fechaRegistro: new Date().toISOString(),
      
      // DATOS PERSONALES
      nombre: nombre,
      telefono: telefono,
      activo: activo,
      
      // DATOS PRODUCTIVOS
      colmenas: colmenas,
      ubicacion: ubicacion,
      
      // SALUD DE COLMENAS
      ultimaCura: ultimaCura,
      proximaCura: proximaCura,
      
      // DATOS ECONÓMICOS
      cuotaAlDia: cuotaAlDia,
      deudaMaquinaria: deudaMaquinaria,
      produccionUltima: produccion,
      
      // ESTADO
      estado: activo ? 'ACTIVO' : 'INACTIVO'
    };

    // GUARDAR EN LA NUBE
    try {
      const resultado = document.getElementById('resultado');
      resultado.innerHTML = '<p>🔄 Guardando en la nube...</p>';
      
      // OBTENER DATOS EXISTENTES
      const apicultoresExistentes = await this.obtenerApicultores();
      
      const response = await fetch(`https://api.jsonbin.io/v3/b/${this.config.jsonbinId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'X-Master-Key': this.config.jsonbinApiKey
        },
        body: JSON.stringify({
          sistema: "Coapé Apícola - Gestión Completa",
          ultimaActualizacion: new Date().toISOString(),
          totalApicultores: apicultoresExistentes.length + 1,
          apicultores: [...apicultoresExistentes, apicultor]
        })
      });

      if (response.ok) {
        const resumen = this.generarResumen(apicultor);
        resultado.innerHTML = `
          <div style="background: #d4edda; padding: 15px; border-radius: 10px; border: 2px solid #28a745;">
            <h3 style="color: #155724; margin-top: 0;">✅ APICULTOR REGISTRADO EXITOSAMENTE</h3>
            <pre style="background: white; padding: 10px; border-radius: 5px;">${resumen}</pre>
            <p style="color: #155724;"><strong>🎯 ¡SISTEMA FUNCIONANDO! Ya podés gestionar todos los apicultores.</strong></p>
          </div>
        `;
        console.log("🐝 NUEVO APICULTOR:", apicultor);
      } else {
        resultado.innerHTML = '<p style="color: red;">❌ Error al guardar</p>';
      }
    } catch (error) {
      document.getElementById('resultado').innerHTML = '<p style="color: red;">❌ Error de conexión</p>';
      console.error("💥 Error:", error);
    }
  },

  // OBTENER APICULTORES EXISTENTES
  async obtenerApicultores() {
    try {
      const response = await fetch(`https://api.jsonbin.io/v3/b/${this.config.jsonbinId}`, {
        headers: {'X-Master-Key': this.config.jsonbinApiKey}
      });
      const data = await response.json();
      return data.record.apicultores || [];
    } catch (error) {
      console.log("⚠️ No hay datos previos, empezando desde cero");
      return [];
    }
  },

  // GENERAR RESUMEN BONITO
  generarResumen(apicultor) {
    return `
🐝 FICHA APÍCOLA CARGADA:
──────────────────────────
👤 NOMBRE: ${apicultor.nombre}
📞 TELÉFONO: ${apicultor.telefono}
📍 UBICACIÓN: ${apicultor.ubicacion}

📊 DATOS PRODUCTIVOS:
• Colmenas: ${apicultor.colmenas}
• Producción: ${apicultor.produccionUltima} kg
• Estado: ${apicultor.activo ? 'ACTIVO 🟢' : 'NO ACTIVO 🟡'}

🏥 CALENDARIO SANITARIO:
• Última cura: ${apicultor.ultimaCura}
• Próxima cura: ${apicultor.proximaCura}

💰 SITUACIÓN ECONÓMICA:
• Cuota societaria: ${apicultor.cuotaAlDia ? 'AL DÍA ✅' : 'PENDIENTE ❌'}
• Deuda maquinaria: ${apicultor.deudaMaquinaria} kg
──────────────────────────
    `.trim();
  },

  // VER TODOS LOS APICULTORES
  async verApicultores() {
    try {
      const apicultores = await this.obtenerApicultores();
      const resultado = document.getElementById('resultado');
      
      if (apicultores.length === 0) {
        resultado.innerHTML = '<p>📭 No hay apicultores registrados todavía.</p>';
        return;
      }

      let html = `<div style="background: #e9ecef; padding: 15px; border-radius: 10px;">
                    <h3>👥 LISTA DE APICULTORES (${apicultores.length})</h3>`;
      
      apicultores.forEach(apicultor => {
        html += `
          <div style="background: white; margin: 10px 0; padding: 10px; border-radius: 5px; border-left: 4px solid ${apicultor.activo ? '#28a745' : '#ffc107'}">
            <strong>${apicultor.nombre}</strong> - ${apicultor.telefono}<br>
            <small>${apicultor.colmenas} colmenas | ${apicultor.activo ? 'ACTIVO' : 'INACTIVO'} | ${apicultor.cuotaAlDia ? 'Cuota OK' : 'Cuota PENDIENTE'}</small>
          </div>
        `;
      });
      
      html += '</div>';
      resultado.innerHTML = html;
      
    } catch (error) {
      document.getElementById('resultado').innerHTML = '<p style="color: red;">❌ Error al cargar datos</p>';
    }
  }
};

// FUNCIONES GLOBALES PARA LOS BOTONES
function registrarApicultor() {
  sistemaCoape.guardarApicultor();
}

function verApicultores() {
  sistemaCoape.verApicultores();
}

// INICIALIZACIÓN
console.log('🚀 Sistema Coapé cargado y listo!');