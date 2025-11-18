import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { Producto } from './productos.service';

export interface ItemCarrito {
  producto: Producto;
  cantidad: number;
  subtotalSoles: number;
  subtotalDolares: number;
}

@Injectable({
  providedIn: 'root'
})
export class CarritoService {
  private readonly STORAGE_KEY = 'burgerica_carrito';
  
  private itemsSubject = new BehaviorSubject<ItemCarrito[]>([]);
  public items$ = this.itemsSubject.asObservable();

  constructor() {
    this.cargarCarrito();
  }

  /**
   * Carga el carrito desde localStorage
   */
  private cargarCarrito(): void {
    const carritoGuardado = localStorage.getItem(this.STORAGE_KEY);
    if (carritoGuardado) {
      this.itemsSubject.next(JSON.parse(carritoGuardado));
    }
  }

  /**
   * Guarda el carrito en localStorage
   */
  private guardarCarrito(items: ItemCarrito[]): void {
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(items));
    this.itemsSubject.next(items);
  }

  /**
   * Agrega un producto al carrito
   */
  agregarProducto(producto: Producto, cantidad: number = 1): void {
    const items = this.itemsSubject.value;
    const itemExistente = items.find(item => item.producto.id === producto.id);

    if (itemExistente) {
      // Si ya existe, aumentar la cantidad
      itemExistente.cantidad += cantidad;
      itemExistente.subtotalSoles = itemExistente.cantidad * producto.precioSoles;
      itemExistente.subtotalDolares = itemExistente.cantidad * producto.precioDolares;
    } else {
      // Si no existe, agregar nuevo item
      const nuevoItem: ItemCarrito = {
        producto,
        cantidad,
        subtotalSoles: cantidad * producto.precioSoles,
        subtotalDolares: cantidad * producto.precioDolares
      };
      items.push(nuevoItem);
    }

    this.guardarCarrito(items);
  }

  /**
   * Actualiza la cantidad de un producto
   */
  actualizarCantidad(productoId: number, nuevaCantidad: number): void {
    if (nuevaCantidad <= 0) {
      this.eliminarProducto(productoId);
      return;
    }

    const items = this.itemsSubject.value;
    const item = items.find(i => i.producto.id === productoId);

    if (item) {
      item.cantidad = nuevaCantidad;
      item.subtotalSoles = nuevaCantidad * item.producto.precioSoles;
      item.subtotalDolares = nuevaCantidad * item.producto.precioDolares;
      this.guardarCarrito(items);
    }
  }

  /**
   * Elimina un producto del carrito
   */
  eliminarProducto(productoId: number): void {
    const items = this.itemsSubject.value.filter(item => item.producto.id !== productoId);
    this.guardarCarrito(items);
  }

  /**
   * Vacía el carrito
   */
  vaciarCarrito(): void {
    this.guardarCarrito([]);
  }

  /**
   * Obtiene los items del carrito
   */
  obtenerItems(): ItemCarrito[] {
    return this.itemsSubject.value;
  }

  /**
   * Calcula el total en soles
   */
  obtenerTotalSoles(): number {
    return this.itemsSubject.value.reduce((total, item) => total + item.subtotalSoles, 0);
  }

  /**
   * Calcula el total en dólares
   */
  obtenerTotalDolares(): number {
    return this.itemsSubject.value.reduce((total, item) => total + item.subtotalDolares, 0);
  }

  /**
   * Obtiene la cantidad total de productos
   */
  obtenerCantidadTotal(): number {
    return this.itemsSubject.value.reduce((total, item) => total + item.cantidad, 0);
  }

  /**
   * Verifica si el carrito está vacío
   */
  estaVacio(): boolean {
    return this.itemsSubject.value.length === 0;
  }
}