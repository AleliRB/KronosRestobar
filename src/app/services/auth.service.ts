import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

export interface Usuario {
  id: number;
  dni: string;
  nombres: string;
  apellidos: string;
  correo: string;
  usuario: string;
  contrasena: string;
  fechaRegistro: string;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private readonly STORAGE_KEY = 'burgerica_usuarios';
  private readonly SESSION_KEY = 'burgerica_usuario_actual';
  
  private usuarioActualSubject = new BehaviorSubject<Usuario | null>(null);
  public usuarioActual$ = this.usuarioActualSubject.asObservable();

  constructor() {
    this.cargarSesion();
  }

  /**
   * Carga la sesión actual desde localStorage
   */
  private cargarSesion(): void {
    const sesion = localStorage.getItem(this.SESSION_KEY);
    if (sesion) {
      this.usuarioActualSubject.next(JSON.parse(sesion));
    }
  }

  /**
   * Obtiene todos los usuarios registrados
   */
  private obtenerUsuarios(): Usuario[] {
    const usuarios = localStorage.getItem(this.STORAGE_KEY);
    return usuarios ? JSON.parse(usuarios) : [];
  }

  /**
   * Guarda usuarios en localStorage
   */
  private guardarUsuarios(usuarios: Usuario[]): void {
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(usuarios));
  }

  /**
   * Registra un nuevo usuario
   */
  registrar(datosUsuario: Omit<Usuario, 'id' | 'fechaRegistro'>): { success: boolean; message: string } {
    const usuarios = this.obtenerUsuarios();

    // Validar si el DNI ya existe
    if (usuarios.some(u => u.dni === datosUsuario.dni)) {
      return { success: false, message: 'Este DNI ya está registrado' };
    }

    // Validar si el usuario ya existe
    if (usuarios.some(u => u.usuario === datosUsuario.usuario)) {
      return { success: false, message: 'Este nombre de usuario ya existe' };
    }

    // Validar si el correo ya existe
    if (usuarios.some(u => u.correo === datosUsuario.correo)) {
      return { success: false, message: 'Este correo ya está registrado' };
    }

    // Crear nuevo usuario
    const nuevoUsuario: Usuario = {
      ...datosUsuario,
      id: usuarios.length > 0 ? Math.max(...usuarios.map(u => u.id)) + 1 : 1,
      fechaRegistro: new Date().toISOString()
    };

    usuarios.push(nuevoUsuario);
    this.guardarUsuarios(usuarios);

    return { success: true, message: 'Usuario registrado exitosamente' };
  }

  /**
   * Inicia sesión
   */
  login(usuario: string, contrasena: string): { success: boolean; message: string } {
    const usuarios = this.obtenerUsuarios();
    
    const usuarioEncontrado = usuarios.find(
      u => u.usuario === usuario && u.contrasena === contrasena
    );

    if (usuarioEncontrado) {
      // Guardar sesión
      localStorage.setItem(this.SESSION_KEY, JSON.stringify(usuarioEncontrado));
      this.usuarioActualSubject.next(usuarioEncontrado);
      
      return { success: true, message: 'Inicio de sesión exitoso' };
    }

    return { success: false, message: 'Usuario o contraseña incorrectos' };
  }

  /**
   * Cierra sesión
   */
  logout(): void {
    localStorage.removeItem(this.SESSION_KEY);
    this.usuarioActualSubject.next(null);
  }

  /**
   * Verifica si hay un usuario autenticado
   */
  estaAutenticado(): boolean {
    return this.usuarioActualSubject.value !== null;
  }

  /**
   * Obtiene el usuario actual
   */
  obtenerUsuarioActual(): Usuario | null {
    return this.usuarioActualSubject.value;
  }

  /**
   * Valida formato de contraseña
   * Mínimo 6 caracteres, al menos una letra y un número
   */
  validarContrasena(contrasena: string): { valida: boolean; mensaje: string } {
    if (contrasena.length < 6) {
      return { valida: false, mensaje: 'La contraseña debe tener al menos 6 caracteres' };
    }

    if (!/[a-zA-Z]/.test(contrasena)) {
      return { valida: false, mensaje: 'La contraseña debe contener al menos una letra' };
    }

    if (!/[0-9]/.test(contrasena)) {
      return { valida: false, mensaje: 'La contraseña debe contener al menos un número' };
    }

    return { valida: true, mensaje: 'Contraseña válida' };
  }
}