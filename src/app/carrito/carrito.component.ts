import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { CarritoService, ItemCarrito } from '../services/carrito.service';
@Component({
  selector: 'app-carrito',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './carrito.component.html',
  styleUrl: './carrito.component.css'
})
export class CarritoComponent implements OnInit {
items: ItemCarrito[] = [];
  totalSoles: number = 0;
  totalDolares: number = 0;
  cantidadTotal: number = 0;

  constructor(
    private carritoService: CarritoService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.cargarCarrito();
  }

  /**
   * Carga los items del carrito
   */
  cargarCarrito(): void {
    this.carritoService.items$.subscribe(items => {
      this.items = items;
      this.totalSoles = this.carritoService.obtenerTotalSoles();
      this.totalDolares = this.carritoService.obtenerTotalDolares();
      this.cantidadTotal = this.carritoService.obtenerCantidadTotal();
    });
  }

  /**
   * Aumenta la cantidad de un producto
   */
  aumentarCantidad(productoId: number): void {
    const item = this.items.find(i => i.producto.id === productoId);
    if (item) {
      this.carritoService.actualizarCantidad(productoId, item.cantidad + 1);
    }
  }

  /**
   * Disminuye la cantidad de un producto
   */
  disminuirCantidad(productoId: number): void {
    const item = this.items.find(i => i.producto.id === productoId);
    if (item && item.cantidad > 1) {
      this.carritoService.actualizarCantidad(productoId, item.cantidad - 1);
    }
  }

  /**
   * Elimina un producto del carrito
   */
  eliminarProducto(productoId: number): void {
    if (confirm('¿Estás seguro de eliminar este producto?')) {
      this.carritoService.eliminarProducto(productoId);
    }
  }

  /**
   * Vacía todo el carrito
   */
  vaciarCarrito(): void {
    if (confirm('¿Estás seguro de vaciar el carrito completo?')) {
      this.carritoService.vaciarCarrito();
    }
  }

  /**
   * Procede al checkout (boleta)
   */
  irABoleta(): void {
    if (this.items.length === 0) {
      alert('El carrito está vacío');
      return;
    }
    this.router.navigate(['/boleta']);
  }

  /**
   * Verifica si el carrito está vacío
   */
  carritoVacio(): boolean {
    return this.items.length === 0;
  }
}
