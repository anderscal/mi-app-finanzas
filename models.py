from sqlalchemy import Column, Integer, String, Float, Date, ForeignKey
from sqlalchemy.orm import relationship
from database import Base

class Cuenta(Base):
    __tablename__ = "cuentas"

    id = Column(Integer, primary_key=True, index=True)
    nombre = Column(String, unique=True, index=True) # Ej: "Nequi", "Bancolombia", "Efectivo"
    tipo = Column(String) # Ej: "Ahorro", "Corriente"
    saldo_actual = Column(Float, default=0.0)

    # Relación con las transacciones
    transacciones = relationship("Transaccion", back_populates="cuenta")

class Categoria(Base):
    __tablename__ = "categorias"

    id = Column(Integer, primary_key=True, index=True)
    nombre = Column(String,unique=True, index=True) # Ej: "Gastos Hormiga", "Universidad", "Transporte"
    tipo = Column(String) # "Ingreso" o "Gasto"

    # Relación con transacciones
    transacciones = relationship("Transaccion", back_populates="categoria")

class Transaccion(Base):
    __tablename__ = "transacciones"

    id = Column(Integer, primary_key=True, index=True)
    monto = Column(Float, nullable=False)
    fecha = Column(Date, nullable=False)
    descripcion = Column(String)
    tipo = Column(String) # "Ingreso" o "Gasto"
    
    # Llaves foráneas que conectan el gasto con su cuenta y categoría
    cuenta_id = Column(Integer, ForeignKey("cuentas.id"))
    categoria_id = Column(Integer, ForeignKey("categorias.id"))

    # Relaciones
    cuenta = relationship("Cuenta", back_populates="transacciones")
    categoria = relationship("Categoria", back_populates="transacciones")