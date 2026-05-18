from pydantic import BaseModel, ConfigDict
from datetime import date
from typing import Optional
# Asegúrate de que pydantic importe 'date' añadiendo la línea de arriba si no está.

# --- ESQUEMAS PARA CATEGORÍAS ---
class CategoriaBase(BaseModel):
    nombre: str # Ej: "Gastos Hormiga", "Universidad"
    tipo: str   # "Ingreso" o "Gasto"

class CategoriaCreate(CategoriaBase):
    pass

class Categoria(CategoriaBase):
    id: int
    # Esto permite que Pydantic lea los datos de SQLAlchemy
    model_config = ConfigDict(from_attributes=True)


# --- ESQUEMAS PARA CUENTAS ---
class CuentaBase(BaseModel):
    nombre: str
    tipo: str
    saldo_actual: float = 0.0

class CuentaCreate(CuentaBase):
    pass

class Cuenta(CuentaBase):
    id: int
    model_config = ConfigDict(from_attributes=True)


# --- ESQUEMAS PARA TRANSACCIONES ---
class TransaccionBase(BaseModel):
    monto: float
    fecha: date
    descripcion: str
    tipo: str
    # Agregamos Optional para evitar errores 500 con registros viejos o nulos
    cuenta_id: Optional[int] = None
    categoria_id: Optional[int] = None

class TransaccionCreate(TransaccionBase):
    pass

class Transaccion(TransaccionBase):
    id: int
    model_config = ConfigDict(from_attributes=True)

# --- ESQUEMA PARA TRANSFERENCIAS ---
class TransferenciaCreate(BaseModel):
    cuenta_origen_id: int
    cuenta_destino_id: int
    monto: float
    fecha: date
    descripcion: str