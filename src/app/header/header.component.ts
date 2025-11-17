import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';
import { CarritoService } from './services/carrito.service';
import { AuthService, Usuario } from './services/auth.service';
import { Router } from '@angular/router';
@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, RouterOutlet, RouterLink, RouterLinkActive],
  templateUrl: './header.component.html',
  styleUrl: './header.component.css'
})
export class HeaderComponent implements OnInit {
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
