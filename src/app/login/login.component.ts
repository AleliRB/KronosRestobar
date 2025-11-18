import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { FooterComponent } from "../footer/footer.component";
import { HeaderComponent } from "../header/header.component";
@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink, FooterComponent, HeaderComponent],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})
export class LoginComponent {
loginForm: FormGroup;
  mensajeError: string = '';
  cargando: boolean = false;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) {
    this.loginForm = this.fb.group({
      usuario: ['', [Validators.required, Validators.minLength(3)]],
      contrasena: ['', [Validators.required, Validators.minLength(6)]]
    });
  }
   /**
   * Inicia sesión
   */
  onLogin(): void {
    if (this.loginForm.invalid) {
      this.mensajeError = 'Por favor, completa todos los campos correctamente';
      return;
    }

    this.cargando = true;
    this.mensajeError = '';

    const { usuario, contrasena } = this.loginForm.value;
    
    // Simular delay de red
    setTimeout(() => {
      const resultado = this.authService.login(usuario, contrasena);
      
      this.cargando = false;

      if (resultado.success) {
        this.router.navigate(['/productos']);
      } else {
        this.mensajeError = resultado.message;
      }
    }, 500);
  }
  /**
   * Verifica si un campo es inválido y ha sido tocado
   */
  campoInvalido(campo: string): boolean {
    const control = this.loginForm.get(campo);
    return !!(control && control.invalid && control.touched);
  }
}
