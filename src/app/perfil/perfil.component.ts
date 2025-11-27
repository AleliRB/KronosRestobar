import { Component,  OnInit } from '@angular/core';
import { FooterComponent } from "../footer/footer.component";
import { HeaderComponent } from "../header/header.component";
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService, Usuario } from '../services/auth.service';
import { TarjetasService, Tarjeta } from '../services/tarjetas.service';
import { VentasService, Venta } from '../services/ventas.service';

@Component({
  selector: 'app-perfil',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, HeaderComponent,FooterComponent],
  templateUrl: './perfil.component.html',
  styleUrl: './perfil.component.css'
})
export class PerfilComponent implements OnInit {
  usuarioActual: Usuario | null = null;
  tarjetas: Tarjeta[] = [];
  misPedidos: Venta[] = [];
  
  mostrarFormTarjeta: boolean = false;
  tarjetaForm: FormGroup;
  
  vistaActual: 'datos' | 'tarjetas' | 'pedidos' = 'datos';

  constructor(
    private authService: AuthService,
    private tarjetasService: TarjetasService,
    private ventasService: VentasService,
    private fb: FormBuilder,
    private router: Router
  ) {
    this.tarjetaForm = this.fb.group({
      numeroTarjeta: ['', [Validators.required, Validators.pattern(/^\d{16}$/)]],
      titular: ['', Validators.required],
      tipo: ['debito', Validators.required],
      vencimiento: ['', [Validators.required, Validators.pattern(/^(0[1-9]|1[0-2])\/\d{2}$/)]],
      cvv: ['', [Validators.required, Validators.pattern(/^\d{3,4}$/)]]
    });
  }

  ngOnInit(): void {
    if (!this.authService.estaAutenticado()) {
      alert('Debes iniciar sesión');
      this.router.navigate(['/login']);
      return;
    }

    this.usuarioActual = this.authService.obtenerUsuarioActual();
    this.cargarTarjetas();
    this.cargarPedidos();
  }

  cargarTarjetas(): void {
    if (this.usuarioActual) {
      this.tarjetas = this.tarjetasService.obtenerTarjetasUsuario(this.usuarioActual.dni);
    }
  }

  cargarPedidos(): void {
    if (this.usuarioActual) {
      this.misPedidos = this.ventasService.obtenerVentasUsuario(this.usuarioActual.dni);
    }
  }

  cambiarVista(vista: 'datos' | 'tarjetas' | 'pedidos'): void {
    this.vistaActual = vista;
  }

  toggleFormTarjeta(): void {
    this.mostrarFormTarjeta = !this.mostrarFormTarjeta;
    if (!this.mostrarFormTarjeta) {
      this.tarjetaForm.reset({ tipo: 'debito' });
    }
  }

  agregarTarjeta(): void {
    if (this.tarjetaForm.invalid) {
      alert('Completa todos los campos correctamente');
      return;
    }

    const formValue = this.tarjetaForm.value;
    
    this.tarjetasService.agregarTarjeta({
      usuarioDni: this.usuarioActual!.dni,
      numeroTarjeta: this.tarjetasService.enmascarar(formValue.numeroTarjeta),
      titular: formValue.titular,
      tipo: formValue.tipo,
      vencimiento: formValue.vencimiento,
      esPrincipal: this.tarjetas.length === 0
    });

    alert('Tarjeta agregada exitosamente');
    this.cargarTarjetas();
    this.toggleFormTarjeta();
  }

  establecerPrincipal(tarjetaId: number): void {
    this.tarjetasService.establecerTarjetaPrincipal(tarjetaId, this.usuarioActual!.dni);
    this.cargarTarjetas();
  }

  eliminarTarjeta(tarjetaId: number): void {
    if (confirm('¿Estás seguro de eliminar esta tarjeta?')) {
      this.tarjetasService.eliminarTarjeta(tarjetaId);
      this.cargarTarjetas();
    }
  }

  formatearVencimiento(event: any): void {
    let valor = event.target.value.replace(/\D/g, '');
    if (valor.length >= 2) {
      valor = valor.substring(0, 2) + '/' + valor.substring(2, 4);
    }
    this.tarjetaForm.patchValue({ vencimiento: valor });
  }
}