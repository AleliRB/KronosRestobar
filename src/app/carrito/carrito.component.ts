import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { CarritoService, ItemCarrito } from '../services/carrito.service';
import { AuthService } from '../services/auth.service';
import { FooterComponent } from "../footer/footer.component";
import { HeaderComponent } from "../header/header.component";

@Component({
  selector: 'app-carrito',
  standalone: true,
  imports: [CommonModule, RouterLink, FooterComponent, HeaderComponent],
  templateUrl: './carrito.component.html',
  styleUrl: './carrito.component.css'
})
export class CarritoComponent implements OnInit, OnDestroy {
  // Subject utilizado para gestionar la cancelación de suscripciones activas
  // Previene memory leaks al destruir el componente
  private destroy$ = new Subject<void>();

  items: ItemCarrito[] = [];
  totalSoles: number = 0;
  totalDolares: number = 0;
  cantidadTotal: number = 0;

  constructor(
    private carritoService: CarritoService,
    private authService: AuthService,
    private router: Router
  ) {}

  /**
   * Lifecycle Hook: Inicialización del componente
   * Carga los items del carrito de compras
   */
  ngOnInit(): void {
    this.cargarCarrito();
  }

  /**
   * Lifecycle Hook: Limpieza al destruir el componente
   * Cancela todas las suscripciones activas para prevenir memory leaks
   */
  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  /**
   * Carga el contenido del carrito con gestión automática de suscripción
   */
  cargarCarrito(): void {
    this.carritoService.items$
      .pipe(takeUntil(this.destroy$))
      .subscribe(items => {
        this.items = items;
        this.totalSoles = this.carritoService.obtenerTotalSoles();
        this.totalDolares = this.carritoService.obtenerTotalDolares();
        this.cantidadTotal = this.carritoService.obtenerCantidadTotal();
      });
  }

  aumentarCantidad(productoId: number): void {
    const item = this.items.find(i => i.producto.id === productoId);
    if (item) {
      this.carritoService.actualizarCantidad(productoId, item.cantidad + 1);
    }
  }

  disminuirCantidad(productoId: number): void {
    const item = this.items.find(i => i.producto.id === productoId);
    if (item && item.cantidad > 1) {
      this.carritoService.actualizarCantidad(productoId, item.cantidad - 1);
    }
  }

  eliminarProducto(productoId: number): void {
    if (confirm('¿Estás seguro de eliminar este producto?')) {
      this.carritoService.eliminarProducto(productoId);
    }
  }

  vaciarCarrito(): void {
    if (confirm('¿Estás seguro de vaciar el carrito completo?')) {
      this.carritoService.vaciarCarrito();
    }
  }

  irABoleta(): void {
    if (this.items.length === 0) {
      alert('El carrito está vacío');
      return;
    }

    if (!this.authService.estaAutenticado()) {
      if (confirm('Debes iniciar sesión para generar la boleta. ¿Ir al login?')) {
        this.router.navigate(['/login']);
      }
      return;
    }

    this.router.navigate(['/boleta']);
  }

  carritoVacio(): boolean {
    return this.items.length === 0;
  }
}