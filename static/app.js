const formatearMoneda = (valor) => {
    return new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', minimumFractionDigits: 0 }).format(valor);
};
const obtenerFechaLocal = () => {
    const fecha = new Date();
    // Restamos la diferencia de la zona horaria local para que no se salte al día siguiente en la noche
    fecha.setMinutes(fecha.getMinutes() - fecha.getTimezoneOffset());
    return fecha.toISOString().slice(0, 10);
};
let categoriasGlobales = [];

// --- CARGA DE DATOS PRINCIPALES ---
async function cargarDatos() {
    try {
        const respuesta = await fetch('/cuentas/');
        const cuentas = await respuesta.json();
        let balanceTotal = 0;
        const contenedor = document.getElementById('accounts-container');
        contenedor.innerHTML = ''; 

        cuentas.forEach(cuenta => {
            balanceTotal += cuenta.saldo_actual;
            contenedor.innerHTML += `
                <div class="account-item">
                    <span class="account-name">${cuenta.nombre}</span>
                    <span class="account-balance">${formatearMoneda(cuenta.saldo_actual)}</span>
                </div>
            `;
        });
        document.getElementById('total-balance').textContent = formatearMoneda(balanceTotal);
    } catch (error) { 
        console.error("Error cargando datos:", error); 
    }
}

// --- GESTIÓN DE MODALES ---
function abrirModal(id) {
    document.getElementById(id).style.display = 'flex';
}

function cerrarModal(id) {
    document.getElementById(id).style.display = 'none';
}

// Modal Transacción (Precarga listas y filtra)
async function prepararModalTransaccion() {
    abrirModal('modal-transaccion');
    document.getElementById('fecha').value = obtenerFechaLocal();
document.getElementById('fecha_transferencia').value = obtenerFechaLocal();
    
    // Cargar Select de Cuentas
    const resCuentas = await fetch('/cuentas/');
    const cuentas = await resCuentas.json();
    const selectCuenta = document.getElementById('cuenta_id');
    selectCuenta.innerHTML = '';
    cuentas.forEach(c => selectCuenta.innerHTML += `<option value="${c.id}">${c.nombre}</option>`);

    // Descargar Categorías y guardarlas en memoria
    const resCat = await fetch('/categorias/');
    categoriasGlobales = await resCat.json();
    
    // Filtro inicial
    filtrarCategorias();
}

// Filtra las opciones según el tipo (Ingreso/Gasto)
function filtrarCategorias() {
    const tipoSeleccionado = document.getElementById('tipo').value;
    const selectCat = document.getElementById('categoria_id');
    selectCat.innerHTML = ''; 

    const categoriasFiltradas = categoriasGlobales.filter(c => c.tipo === tipoSeleccionado);

    categoriasFiltradas.forEach(c => {
        selectCat.innerHTML += `<option value="${c.id}">${c.nombre}</option>`;
    });
}

// --- ENVÍO DE DATOS (POST) ---
async function guardarTransaccion(event) {
    event.preventDefault();
    const data = {
        tipo: document.getElementById('tipo').value,
        monto: parseFloat(document.getElementById('monto').value),
        fecha: document.getElementById('fecha').value,
        descripcion: document.getElementById('descripcion').value,
        cuenta_id: parseInt(document.getElementById('cuenta_id').value),
        categoria_id: parseInt(document.getElementById('categoria_id').value)
    };

    try {
        const response = await fetch('/transacciones/', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });
        if (response.ok) {
            cerrarModal('modal-transaccion');
            document.getElementById('form-transaccion').reset();
            cargarDatos();
            cargarHistorial();
        } else { alert("Error al guardar la transacción."); }
    } catch (error) { console.error("Error:", error); }
}

async function guardarCuenta(event) {
    event.preventDefault();
    const data = {
        nombre: document.getElementById('nueva_cuenta_nombre').value,
        tipo: document.getElementById('nueva_cuenta_tipo').value,
        saldo_actual: parseFloat(document.getElementById('nueva_cuenta_saldo').value)
    };

    try {
        const response = await fetch('/cuentas/', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });
        if (response.ok) {
            cerrarModal('modal-cuenta');
            document.getElementById('form-cuenta').reset();
            cargarDatos(); 
        } else { alert("Error: Verifica que el nombre no esté repetido."); }
    } catch (error) { console.error("Error:", error); }
}

async function guardarCategoria(event) {
    event.preventDefault();
    const data = {
        nombre: document.getElementById('nueva_categoria_nombre').value,
        tipo: document.getElementById('nueva_categoria_tipo').value
    };

    try {
        const response = await fetch('/categorias/', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });
        if (response.ok) {
            cerrarModal('modal-categoria');
            document.getElementById('form-categoria').reset();
            alert("Categoría creada con éxito.");
        } else { alert("Error: Verifica que el nombre no esté repetido."); }
    } catch (error) { console.error("Error:", error); }
}

// --- CARGA DEL HISTORIAL BANCARIO ---
async function cargarHistorial() {
    try {
        // 1. Traemos las cuentas para poder traducir el ID al Nombre (Ej: 1 -> "Nequi")
        const resCuentas = await fetch('/cuentas/');
        const cuentas = await resCuentas.json();
        const mapaCuentas = {};
        cuentas.forEach(c => mapaCuentas[c.id] = c.nombre);

        // 2. Traemos las transacciones
        const resTx = await fetch('/transacciones/');
        const transacciones = await resTx.json();
        
        const contenedor = document.getElementById('history-container');
        contenedor.innerHTML = ''; // Limpiamos el mensaje de carga

        if (transacciones.length === 0) {
            contenedor.innerHTML = '<p style="text-align: center; color: #6b7280; font-size: 14px;">Aún no hay movimientos registrados.</p>';
            return;
        }

        // 3. Dibujamos cada transacción con estilo bancario
        transacciones.forEach(tx => {
            const esGasto = tx.tipo === 'Gasto';
            const signo = esGasto ? '-' : '+';
            const claseColor = esGasto ? 'tx-gasto' : 'tx-ingreso';
            const nombreCuenta = mapaCuentas[tx.cuenta_id] || 'Cuenta eliminada';
            
            contenedor.innerHTML += `
                <div class="tx-item">
                    <div class="tx-info">
                        <span class="tx-desc">${tx.descripcion}</span>
                        <span class="tx-date-account">${tx.fecha} • ${nombreCuenta}</span>
                    </div>
                    <span class="tx-amount ${claseColor}">${signo} ${formatearMoneda(tx.monto)}</span>
                </div>
            `;
        });
    } catch (error) {
        console.error("Error cargando el historial:", error);
    }
}
// --- LÓGICA DE TRANSFERENCIAS ---
async function prepararModalTransferencia() {
    abrirModal('modal-transferencia');
    document.getElementById('fecha').valueAsDate = obtenerFechaLocal();
document.getElementById('fecha_transferencia').valueAsDate = obtenerFechaLocal();
    
    // Cargar listas de cuentas para origen y destino
    const resCuentas = await fetch('/cuentas/');
    const cuentas = await resCuentas.json();
    
    const selectOrigen = document.getElementById('origen_id');
    const selectDestino = document.getElementById('destino_id');
    selectOrigen.innerHTML = '';
    selectDestino.innerHTML = '';
    
    cuentas.forEach(c => {
        const option = `<option value="${c.id}">${c.nombre} (${formatearMoneda(c.saldo_actual)})</option>`;
        selectOrigen.innerHTML += option;
        selectDestino.innerHTML += option;
    });
}

async function guardarTransferencia(event) {
    event.preventDefault();
    
    const data = {
        cuenta_origen_id: parseInt(document.getElementById('origen_id').value),
        cuenta_destino_id: parseInt(document.getElementById('destino_id').value),
        monto: parseFloat(document.getElementById('monto_transferencia').value),
        fecha: document.getElementById('fecha_transferencia').value,
        descripcion: document.getElementById('descripcion_transferencia').value
    };

    if (data.cuenta_origen_id === data.cuenta_destino_id) {
        alert("La cuenta de origen y destino no pueden ser la misma.");
        return;
    }

    try {
        const response = await fetch('/transferencias/', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });
        
        if (response.ok) {
            cerrarModal('modal-transferencia');
            document.getElementById('form-transferencia').reset();
            // Actualizamos los saldos y el historial
            cargarDatos();
            cargarHistorial();
        } else { 
            const errorData = await response.json();
            alert(`Error: ${errorData.detail}`); 
        }
    } catch (error) { 
        console.error("Error:", error); 
    }
}
// Iniciar la app
window.addEventListener('load', () => {
    cargarDatos();
    cargarHistorial();
    if ('serviceWorker' in navigator) {
        navigator.serviceWorker.register('/static/sw.js')
        .catch(err => console.log('Error en Service Worker:', err));
    }
});