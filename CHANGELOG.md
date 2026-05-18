# Changelog - Finanzas PWA

## [v0.1.0] - 2026-05-16
### Agregado
- Inicialización del proyecto.
- Configuración del entorno virtual (`env`).
- Instalación de dependencias base: `fastapi` y `uvicorn`.
- Creación de `main.py` con el endpoint raíz de prueba.
## [v0.2.0] - 2026-05-16
### Agregado
- Integración de SQLAlchemy y SQLite.
- Creación de `database.py` para gestionar la conexión.
- Creación de `models.py` con las tablas: `Cuenta`, `Categoria` y `Transaccion` estructuradas para análisis dimensional.
- Modificación en `main.py` para generar automáticamente las tablas al iniciar.
## [v0.3.0] - 2026-05-16
### Agregado
- Implementación de `schemas.py` utilizando Pydantic V2 para validación de datos.
- Creación de rutas POST en `main.py` para la creación de `Cuentas` y `Categorias`.
- Inyección exitosa de los primeros registros iniciales mediante Swagger UI.
## [v0.4.0] - 2026-05-16
### Agregado
- Importación de `date` en `schemas.py` y creación de los esquemas `Transaccion`.
- Creación de ruta POST `/transacciones/` en `main.py`.
- Implementación de lógica de negocio: verificación de llaves foráneas y actualización automática del `saldo_actual` en la tabla `cuentas` según el tipo de transacción.
## [v0.6.0] - 2026-05-16
### Agregado
- Endpoint `GET /categorias/` en `main.py` para alimentar las listas desplegables.
- Integración de ventana modal (Floating Action Button) en la PWA.
- Conexión del formulario de `index.html` con la base de datos vía `fetch` API.
- Actualización dinámica del DOM: el balance general se recalcula instantáneamente sin recargar la página tras registrar una transacción exitosa.
## [v0.7.0] - 2026-05-16
### Agregado
- Conversión de la web a PWA (Progressive Web App).
- Creación de `manifest.json` para configuración de instalación y display `standalone`.
- Creación de `sw.js` (Service Worker) para cacheo de la *App Shell*.
- Modificación en `index.html` agregando etiquetas meta de compatibilidad nativa para iOS (Safari).
## [v0.8.0] - 2026-05-17
### Modificado
- Refactorización del frontend aplicando separación de responsabilidades (HTML, CSS, JS).
- Creación de `static/styles.css` aislando la capa de presentación.
- Creación de `static/app.js` encapsulando la lógica asíncrona y manipulación del DOM.
### Agregado
- Botones de acción "Nueva Cuenta" y "Nueva Categoría" en el layout principal.
- Modales independientes para la creación de Cuentas y Categorías sin depender de Swagger.
## [v0.9.0] - 2026-05-17
### Agregado
- **Filtro Reactivo de Categorías:** Implementación en `app.js` para filtrar dinámicamente las categorías mostradas en el select (`categoria_id`) dependiendo de si la transacción es un "Ingreso" o "Gasto".
- **Corrección de Zona Horaria (UTC a Local):** Creación de la función `obtenerFechaLocal()` en JavaScript para prevenir el salto al día siguiente en los modales durante horas nocturnas.
- **Motor de Transferencias (Partida Doble):** - Creación del esquema `TransferenciaCreate` en `schemas.py`.
  - Implementación de ruta POST `/transferencias/` en `main.py` que crea simultáneamente un Gasto en la cuenta origen y un Ingreso en la cuenta destino bajo una misma transacción de base de datos.
  - Creación automática de la categoría "Transferencia Interna" para aislar analíticas.
- **Historial de Movimientos Bancarios:**
  - Endpoint GET `/transacciones/` en `main.py` ordenado cronológicamente de forma descendente.
  - Maquetación CSS y lógica JS (`cargarHistorial`) para renderizar un feed de transacciones similar a aplicaciones Fintech, con colores dinámicos (+ Verde / - Rojo) y traducción asíncrona de IDs a nombres de cuentas.