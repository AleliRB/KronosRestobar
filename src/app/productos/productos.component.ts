import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ProductosService, Producto } from '../services/productos.service';
import { CarritoService } from '../services/carrito.service';

@Component({
  selector: 'app-productos',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './productos.component.html',
  styleUrls: ['./productos.component.css']
})
export class ProductosComponent implements OnInit {
  // Tab activo
  activeTab: string = 'Platos';
  
  // Productos
  todosProductos: Producto[] = [];
  productosFiltrados: Producto[] = [];
  
  // Formulario
  productoForm: FormGroup;
  modoEdicion: boolean = false;
  productoEditandoId: number | null = null;
  mostrarFormulario: boolean = false;

  // Categorías disponibles
  categorias = ['Platos', 'Bebidas', 'Postres'];

  constructor(
    private productosService: ProductosService,
    private carritoService: CarritoService,
    private fb: FormBuilder
  ) {
    this.productoForm = this.fb.group({
      nombre: ['', Validators.required],
      descripcion: ['', Validators.required],
      imagen: ['', Validators.required],
      precioSoles: ['', [Validators.required, Validators.min(0)]],
      categoria: ['', Validators.required],
      tipoCategoria: ['Platos', Validators.required], // Nueva categoría para tabs
      stock: ['', [Validators.required, Validators.min(0)]]
    });
  }

  ngOnInit(): void {
    this.cargarProductos();
  }

  //Carga los productos y filtra según tab activo
  cargarProductos(): void {
    this.productosService.productos$.subscribe(productos => {
      this.todosProductos = productos;
      this.filtrarProductosPorTab();
    });
  }

  cambiarTab(tab: string): void {
    this.activeTab = tab;
    this.filtrarProductosPorTab();
  }

  //Filtra productos según el tab activo
  filtrarProductosPorTab(): void {
    // Filtrar por tipo de categoría (Comida, Bebidas, Postres)
    this.productosFiltrados = this.todosProductos.filter(producto => {
      // Si el producto no tiene tipoCategoria, asumimos que es Comida por defecto
      const tipo = (producto as any).tipoCategoria || 'Platos';
      return tipo === this.activeTab;
    });
  }

  //Agrega un producto al carrito
  agregarAlCarrito(producto: Producto): void {
  if (producto.stock > 0) {
    this.carritoService.agregarProducto(producto, 1);
  }
}

  toggleFormulario(): void {
    this.mostrarFormulario = !this.mostrarFormulario;
    if (!this.mostrarFormulario) {
      this.cancelarEdicion();
    }
  }

  //Guarda un producto (crear o actualizar)
  guardarProducto(): void {
    if (this.productoForm.invalid) {
      alert('Por favor, completa todos los campos correctamente');
      return;
    }

    const datosProducto = this.productoForm.value;

    if (this.modoEdicion && this.productoEditandoId) {
      // Actualizar
      this.productosService.actualizarProducto(this.productoEditandoId, datosProducto);
      alert('Producto actualizado exitosamente');
    } else {
      // Crear
      this.productosService.crearProducto(datosProducto);
      alert('Producto creado exitosamente');
    }

    this.cancelarEdicion();
    this.mostrarFormulario = false;
  }

  //Prepara el formulario para editar
  editarProducto(producto: Producto): void {
    this.modoEdicion = true;
    this.productoEditandoId = producto.id;
    this.mostrarFormulario = true;

    this.productoForm.patchValue({
      nombre: producto.nombre,
      descripcion: producto.descripcion,
      imagen: producto.imagen,
      precioSoles: producto.precioSoles,
      categoria: producto.categoria,
      tipoCategoria: (producto as any).tipoCategoria || 'Platos',
      stock: producto.stock
    });

    // Scroll al formulario
    setTimeout(() => {
      document.getElementById('formulario-producto')?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  }

  // Elimina un producto
  eliminarProducto(producto: Producto): void {
    if (confirm(`¿Estás seguro de eliminar "${producto.nombre}"?`)) {
      this.productosService.eliminarProducto(producto.id);
      alert('Producto eliminado exitosamente');
    }
  }

  cancelarEdicion(): void {
    this.modoEdicion = false;
    this.productoEditandoId = null;
    this.productoForm.reset({
      tipoCategoria: this.activeTab
    });
  }
}