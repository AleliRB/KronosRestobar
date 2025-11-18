import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CarritoService } from '../services/carrito.service';
import { AuthService, Usuario } from '../services/auth.service';
import { Router } from '@angular/router';
@Component({
  selector: 'app-footer',
  standalone: true,
  imports: [CommonModule, ],
  templateUrl: './footer.component.html',
  styleUrl: './footer.component.css'
})
export class FooterComponent implements OnInit{
   title = 'BurgerIca';
  cantidadCarrito: number = 0;
  usuarioActual: Usuario | null = null;

  constructor(
    private carritoService: CarritoService,
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    // Suscribirse a cambios en el carrito
    this.carritoService.items$.subscribe(() => {
      this.cantidadCarrito = this.carritoService.obtenerCantidadTotal();
    });

    // Suscribirse a cambios en la autenticación
    this.authService.usuarioActual$.subscribe(usuario => {
      this.usuarioActual = usuario;
    });
  }

  /**
   * Cierra sesión
   */
  cerrarSesion(): void {
    if (confirm('¿Deseas cerrar sesión?')) {
      this.authService.logout();
      this.router.navigate(['/login']);
    }
  }

  /**
   * Verifica si el usuario está autenticado
   */
  estaAutenticado(): boolean {
    return this.authService.estaAutenticado();
  }

}
