const formatearMoneda = (valor) => {
    return new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', minimumFractionDigits: 0 }).format(valor);
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
    document.getElementById('fecha').valueAsDate = new Date();
    
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

// Iniciar la app
window.addEventListener('load', () => {
    cargarDatos();
    
    if ('serviceWorker' in navigator) {
        navigator.serviceWorker.register('/static/sw.js')
        .catch(err => console.log('Error en Service Worker:', err));
    }
});