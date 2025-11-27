import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { VentasService, Venta } from '../services/ventas.service';
import { HeaderComponent } from "../header/header.component";
import { FooterComponent } from "../footer/footer.component";

@Component({
  selector: 'app-historial-ventas',
  standalone: true,
  imports: [CommonModule, HeaderComponent, FooterComponent],
  templateUrl: './historial-ventas.component.html',
  styleUrl: './historial-ventas.component.css'
})
export class HistorialVentasComponent implements OnInit {
  ventas: Venta[] = [];
  totalVentas: number = 0;
  estadisticas = {
    recojo: 0,
    delivery: 0
  };

  constructor(
    private ventasService: VentasService,
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    // Verificar que sea admin
    if (!this.authService.esAdmin()) {
      alert('Acceso denegado. Solo administradores.');
      this.router.navigate(['/']);
      return;
    }

    this.cargarDatos();
  }

  cargarDatos(): void {
    this.ventasService.ventas$.subscribe(ventas => {
      this.ventas = ventas;
      this.totalVentas = this.ventasService.calcularTotalVentas();
      this.estadisticas = this.ventasService.contarVentasPorTipo();
    });
  }

  getTipoEntregaTexto(tipo: string): string {
    return tipo === 'recojo' ? 'Recojo en Tienda' : 'Delivery';
  }

  getTipoEntregaClass(tipo: string): string {
    return tipo === 'recojo' ? 'badge bg-info' : 'badge bg-warning text-dark';
  }
}