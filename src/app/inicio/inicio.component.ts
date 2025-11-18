import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { ProductosService, Producto } from '../services/productos.service';
import { CarritoService } from '../services/carrito.service';
import { FooterComponent } from "../footer/footer.component";
import { HeaderComponent } from "../header/header.component";
@Component({
  selector: 'app-inicio',
  standalone: true,
  imports: [CommonModule, RouterLink, FooterComponent, HeaderComponent],
  templateUrl: './inicio.component.html',
  styleUrl: './inicio.component.css'
})
export class InicioComponent {
 productosDestacados: Producto[] = [];

  constructor(
    private productosService: ProductosService,
    private carritoService: CarritoService
  ) {}


  ngOnInit(): void {
    // Obtener los primeros 4 productos como destacados
    this.productosService.productos$.subscribe(productos => {
      this.productosDestacados = productos.slice(0, 4);
    });
  }
  /**
   * Agrega un producto al carrito
   */
  agregarAlCarrito(producto: Producto): void {
    if (producto.stock > 0) {
      this.carritoService.agregarProducto(producto, 1);
      alert(`${producto.nombre} agregado al carrito`);
    } else {
      alert('Producto sin stock');
    }
  }
}
