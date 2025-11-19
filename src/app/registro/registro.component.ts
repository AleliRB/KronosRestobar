import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { ReniecService } from '../services/reniec.service';
import { FooterComponent } from "../footer/footer.component";
import { HeaderComponent } from "../header/header.component";
import { HttpClientModule } from '@angular/common/http';

@Component({
  selector: 'app-registro',
  standalone: true,
 imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterLink,
    FooterComponent,
    HeaderComponent,
    HttpClientModule  // ← OBLIGATORIO
  ],
  templateUrl: './registro.component.html',
  styleUrl: './registro.component.css'
})
export class RegistroComponent {
  registroForm: FormGroup;
  mensajeError: string = '';
  mensajeExito: string = '';
  cargando: boolean = false;
  consultandoDNI: boolean = false;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private reniecService: ReniecService,
    private router: Router
  ) {
    this.registroForm = this.fb.group({
      dni: ['', [Validators.required, Validators.pattern(/^\d{8}$/)]],
      nombres: [{ value: '', disabled: true }, Validators.required],
      apellidos: [{ value: '', disabled: true }, Validators.required],
      correo: ['', [Validators.required, Validators.email]],
      usuario: ['', [Validators.required, Validators.minLength(3)]],
      contrasena: ['', [Validators.required, Validators.minLength(6)]]
    });
  }

  /**
   * Consulta DNI en RENIEC cuando el campo pierde el foco
   */
  onDNIBlur(): void {
    const dni = this.registroForm.get('dni')?.value;
    
    if (dni && dni.length === 8 && /^\d{8}$/.test(dni)) {
      this.consultarDNI(dni);
    }
  }

  /**
   * Consulta los datos en RENIEC
   */
  private consultarDNI(dni: string): void {
    this.consultandoDNI = true;
    this.mensajeError = '';

    this.reniecService.consultarDNI(dni).subscribe({
      next: (data) => {
        this.consultandoDNI = false;
        
        if (data) {
          // Autocompletar campos
          this.registroForm.patchValue({
            nombres: data.nombres,
            apellidos: `${data.apellidoPaterno} ${data.apellidoMaterno}`
          });
          
          this.mensajeExito = '✓ Datos obtenidos de RENIEC correctamente';
          
          // Limpiar mensaje después de 3 segundos
          setTimeout(() => {
            this.mensajeExito = '';
          }, 3000);
        } else {
          this.mensajeError = 'No se encontraron datos para este DNI';
        }
      },
      error: (error) => {
        this.consultandoDNI = false;
        this.mensajeError = 'Error al consultar DNI. Intenta nuevamente.';
      }
    });
  }

  /**
   * Registra al usuario
   */
  onRegistrar(): void {
    if (this.registroForm.invalid) {
      this.mensajeError = 'Por favor, completa todos los campos correctamente';
      return;
    }

    // Validar contraseña
    const contrasena = this.registroForm.get('contrasena')?.value;
    const validacion = this.authService.validarContrasena(contrasena);
    
    if (!validacion.valida) {
      this.mensajeError = validacion.mensaje;
      return;
    }

    this.cargando = true;
    this.mensajeError = '';

    // Obtener valores del formulario (incluidos los disabled)
    const datosRegistro = {
      dni: this.registroForm.get('dni')?.value,
      nombres: this.registroForm.get('nombres')?.value,
      apellidos: this.registroForm.get('apellidos')?.value,
      correo: this.registroForm.get('correo')?.value,
      usuario: this.registroForm.get('usuario')?.value,
      contrasena: this.registroForm.get('contrasena')?.value
    };

    // Simular delay de red
    setTimeout(() => {
      const resultado = this.authService.registrar(datosRegistro);
      
      this.cargando = false;

      if (resultado.success) {
        this.mensajeExito = resultado.message;
        
        // Redirigir al login después de 2 segundos
        setTimeout(() => {
          this.router.navigate(['/login']);
        }, 2000);
      } else {
        this.mensajeError = resultado.message;
      }
    }, 500);
  }

  /**
   * Verifica si un campo es inválido y ha sido tocado
   */
  campoInvalido(campo: string): boolean {
    const control = this.registroForm.get(campo);
    return !!(control && control.invalid && control.touched);
  }
}
