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