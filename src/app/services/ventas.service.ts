import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

export interface ItemVenta {
  producto: string;
  cantidad: number;
  precioUnitario: number;
  subtotal: number;
}

// Información completa de una venta (boleta o factura electrónica)
export interface Venta {
  id: number;
  numeroBoleta: string;
  fecha: string;
  tipoComprobante: 'boleta' | 'factura';
  // Datos del cliente (para boletas)
  clienteDni: string;
  clienteNombre: string;
  // Datos de la empresa (para facturas)
  rucCliente?: string;
  razonSocial?: string;
  direccionFiscal?: string;
  // Detalle de productos comprados
  items: ItemVenta[];
  totalSoles: number;
  totalDolares: number;
  // Información de entrega
  tipoEntrega: 'recojo' | 'delivery';
  direccionEntrega?: string;
  costoDelivery: number;
  // Información de pago
  metodoPago: 'efectivo' | 'tarjeta';
  tarjetaUsada?: string;
}

@Injectable({
  providedIn: 'root'
})
export class VentasService {
  private readonly STORAGE_KEY = 'burgerica_ventas';
  
  private ventasSubject = new BehaviorSubject<Venta[]>([]);
  public ventas$ = this.ventasSubject.asObservable();

  constructor() {
    this.cargarVentas();
  }

  private cargarVentas(): void {
    const ventasGuardadas = localStorage.getItem(this.STORAGE_KEY);
    if (ventasGuardadas) {
      this.ventasSubject.next(JSON.parse(ventasGuardadas));
    }
  }

  private guardarVentas(ventas: Venta[]): void {
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(ventas));
    this.ventasSubject.next(ventas);
  }

  // Registra nueva venta con ID autoincrementable y la coloca al inicio del array
  registrarVenta(venta: Omit<Venta, 'id'>): void {
    const ventas = this.ventasSubject.value;
    const nuevaVenta: Venta = {
      ...venta,
      id: ventas.length > 0 ? Math.max(...ventas.map(v => v.id)) + 1 : 1
    };
    
    ventas.unshift(nuevaVenta);
    this.guardarVentas(ventas);
  }

  obtenerVentas(): Venta[] {
    return this.ventasSubject.value;
  }

  // Filtra las ventas de un cliente específico por DNI
  obtenerVentasUsuario(dni: string): Venta[] {
    return this.ventasSubject.value.filter(v => v.clienteDni === dni);
  }

  obtenerVentaPorId(id: number): Venta | undefined {
    return this.ventasSubject.value.find(v => v.id === id);
  }

  // Calcula el total acumulado de todas las ventas en soles
  calcularTotalVentas(): number {
    return this.ventasSubject.value.reduce((total, venta) => total + venta.totalSoles, 0);
  }

  // Cuenta cuántas ventas son recojo vs delivery
  contarVentasPorTipo(): { recojo: number; delivery: number } {
    const ventas = this.ventasSubject.value;
    return {
      recojo: ventas.filter(v => v.tipoEntrega === 'recojo').length,
      delivery: ventas.filter(v => v.tipoEntrega === 'delivery').length
    };
  }
}