import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { ProductosService, Producto } from '../services/productos.service';
import { CarritoService } from '../services/carrito.service';
import { AuthService } from '../services/auth.service';
import { FooterComponent } from "../footer/footer.component";
import { HeaderComponent } from "../header/header.component";

@Component({
  selector: 'app-productos',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FooterComponent, HeaderComponent],
  templateUrl: './productos.component.html',
  styleUrls: ['./productos.component.css']
})
export class ProductosComponent implements OnInit, OnDestroy {
  // Subject utilizado para gestionar la cancelación de suscripciones activas
  // Previene memory leaks al destruir el componente
  private destroy$ = new Subject<void>();

  productos: Producto[] = [];
  productoForm: FormGroup;
  modoEdicion: boolean = false;
  productoEditandoId: number | null = null;
  mostrarFormulario: boolean = false;

  constructor(
    private productosService: ProductosService,
    private carritoService: CarritoService,
    private authService: AuthService,
    private fb: FormBuilder
  ) {
    this.productoForm = this.fb.group({
      nombre: ['', Validators.required],
      descripcion: ['', Validators.required],
      imagen: ['', Validators.required],
      precioSoles: ['', [Validators.required, Validators.min(0)]],
      categoria: ['', Validators.required],
      stock: ['', [Validators.required, Validators.min(0)]]
    });
  }

  /**
   * Lifecycle Hook: Inicialización del componente
   * Carga la lista de productos disponibles
   */
  ngOnInit(): void {
    this.cargarProductos();
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
   * Carga la lista de productos con gestión automática de suscripción
   */
  cargarProductos(): void {
    this.productosService.productos$
      .pipe(takeUntil(this.destroy$))
      .subscribe(productos => {
        this.productos = productos;
      });
  }

  esAdmin(): boolean {
    return this.authService.esAdmin();
  }

  agregarAlCarrito(producto: Producto): void {
    if (producto.stock > 0) {
      this.carritoService.agregarProducto(producto, 1);
      alert(`${producto.nombre} agregado al carrito`);
    } else {
      alert('Producto sin stock');
    }
  }

  toggleFormulario(): void {
    if (!this.esAdmin()) {
      alert('No tienes permisos para realizar esta acción');
      return;
    }
    
    this.mostrarFormulario = !this.mostrarFormulario;
    if (!this.mostrarFormulario) {
      this.cancelarEdicion();
    }
  }

  guardarProducto(): void {
    if (!this.esAdmin()) {
      alert('No tienes permisos para realizar esta acción');
      return;
    }

    if (this.productoForm.invalid) {
      alert('Por favor, completa todos los campos correctamente');
      return;
    }

    const datosProducto = this.productoForm.value;

    if (this.modoEdicion && this.productoEditandoId) {
      this.productosService.actualizarProducto(this.productoEditandoId, datosProducto);
      alert('Producto actualizado exitosamente');
    } else {
      this.productosService.crearProducto(datosProducto);
      alert('Producto creado exitosamente');
    }

    this.cancelarEdicion();
    this.mostrarFormulario = false;
  }

  editarProducto(producto: Producto): void {
    if (!this.esAdmin()) {
      alert('No tienes permisos para realizar esta acción');
      return;
    }

    this.modoEdicion = true;
    this.productoEditandoId = producto.id;
    this.mostrarFormulario = true;

    this.productoForm.patchValue({
      nombre: producto.nombre,
      descripcion: producto.descripcion,
      imagen: producto.imagen,
      precioSoles: producto.precioSoles,
      categoria: producto.categoria,
      stock: producto.stock
    });

    setTimeout(() => {
      document.getElementById('formulario-producto')?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  }

  eliminarProducto(producto: Producto): void {
    if (!this.esAdmin()) {
      alert('No tienes permisos para realizar esta acción');
      return;
    }

    if (confirm(`¿Estás seguro de eliminar "${producto.nombre}"?`)) {
      this.productosService.eliminarProducto(producto.id);
      alert('Producto eliminado exitosamente');
    }
  }

  cancelarEdicion(): void {
    this.modoEdicion = false;
    this.productoEditandoId = null;
    this.productoForm.reset();
  }
}