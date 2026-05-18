from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
from fastapi import FastAPI, Depends, HTTPException
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse # <- Nuevo
from sqlalchemy.orm import Session
import models
import schemas
from database import engine, get_db

models.Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="API Finanzas PWA",
    description="Motor backend para la gestión financiera personal",
    version="0.5.0"
)
app.mount("/static", StaticFiles(directory="static"), name="static")

# Montamos la carpeta estática
app.mount("/static", StaticFiles(directory="static"), name="static")

# Cambiamos la ruta principal para que sirva tu HTML
@app.get("/", tags=["Interfaz"])
def leer_raiz():
    return FileResponse("static/index.html")

# --- NUEVO ENDPOINT PARA LEER CUENTAS ---
@app.get("/cuentas/", response_model=list[schemas.Cuenta], tags=["Cuentas"])
def obtener_cuentas(db: Session = Depends(get_db)):
    cuentas = db.query(models.Cuenta).all()
    return cuentas

@app.get("/categorias/", response_model=list[schemas.Categoria], tags=["Categorías"])
def obtener_categorias(db: Session = Depends(get_db)):
    categorias = db.query(models.Categoria).all()
    return categorias

# ... (Aquí debajo dejas los @app.post de cuentas, categorias y transacciones que ya tenías)

# --- RUTAS (ENDPOINTS) ---

# --- RUTAS DE CUENTAS ---

@app.post("/cuentas/", response_model=schemas.Cuenta, tags=["Cuentas"])
def crear_cuenta(cuenta: schemas.CuentaCreate, db: Session = Depends(get_db)):
    # REGLA DE PREVENCIÓN: Buscar si ya existe una cuenta con ese nombre (ignorando mayúsculas/minúsculas)
    cuenta_existente = db.query(models.Cuenta).filter(models.Cuenta.nombre.ilike(cuenta.nombre)).first()
    if cuenta_existente:
        raise HTTPException(status_code=400, detail="Error: Ya tienes una cuenta registrada con este nombre.")
        
    db_cuenta = models.Cuenta(**cuenta.model_dump())
    db.add(db_cuenta)
    db.commit()
    db.refresh(db_cuenta)
    return db_cuenta

@app.delete("/cuentas/{cuenta_id}", tags=["Cuentas"])
def eliminar_cuenta(cuenta_id: int, db: Session = Depends(get_db)):
    # CORRECCIÓN: Buscar la cuenta por su ID y borrarla
    cuenta = db.query(models.Cuenta).filter(models.Cuenta.id == cuenta_id).first()
    if not cuenta:
        raise HTTPException(status_code=404, detail="Cuenta no encontrada")
    
    db.delete(cuenta)
    db.commit()
    return {"mensaje": f"La cuenta {cuenta.nombre} ha sido eliminada exitosamente"}

@app.post("/categorias/", response_model=schemas.Categoria, tags=["Categorías"])
def crear_categoria(categoria: schemas.CategoriaCreate, db: Session = Depends(get_db)):
    db_categoria = models.Categoria(**categoria.model_dump())
    db.add(db_categoria)
    db.commit()
    db.refresh(db_categoria)
    return db_categoria

@app.post("/transacciones/", response_model=schemas.Transaccion, tags=["Transacciones"])
def obtener_transacciones(db: Session = Depends(get_db)):
    # Traemos las transacciones ordenadas por ID de forma descendente (las más nuevas primero)
    transacciones = db.query(models.Transaccion).order_by(models.Transaccion.id.desc()).limit(20).all()
    return transacciones
def crear_transaccion(transaccion: schemas.TransaccionCreate, db: Session = Depends(get_db)):
    # 1. Verificar que la cuenta y la categoría existen
    cuenta = db.query(models.Cuenta).filter(models.Cuenta.id == transaccion.cuenta_id).first()
    if not cuenta:
        raise HTTPException(status_code=404, detail="Cuenta no encontrada")
        
    categoria = db.query(models.Categoria).filter(models.Categoria.id == transaccion.categoria_id).first()
    if not categoria:
        raise HTTPException(status_code=404, detail="Categoría no encontrada")

    # 2. Crear el registro de la transacción
    db_transaccion = models.Transaccion(**transaccion.model_dump())
    db.add(db_transaccion)

    # 3. Actualizar el saldo de la cuenta automáticamente
    if transaccion.tipo.lower() == "gasto":
        cuenta.saldo_actual -= transaccion.monto
    elif transaccion.tipo.lower() == "ingreso":
        cuenta.saldo_actual += transaccion.monto

    # 4. Guardar todos los cambios en la base de datos
    db.commit()
    db.refresh(db_transaccion)
    return db_transaccion