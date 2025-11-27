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
  rol: 'admin' | 'usuario';
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private readonly STORAGE_KEY = 'burgerica_usuarios';
  private readonly SESSION_KEY = 'burgerica_usuario_actual';
  
  // Credenciales del administrador del sistema
  private readonly ADMIN_USER: Usuario = {
    id: 0,
    dni: '00000000',
    nombres: 'ADMINISTRADOR',
    apellidos: 'SISTEMA',
    correo: 'admin@burgerica.com',
    usuario: 'admin',
    contrasena: 'admin123',
    fechaRegistro: new Date().toISOString(),
    rol: 'admin'
  };
  
  private usuarioActualSubject = new BehaviorSubject<Usuario | null>(null);
  public usuarioActual$ = this.usuarioActualSubject.asObservable();

  constructor() {
    this.cargarSesion();
  }

  private cargarSesion(): void {
    const sesion = localStorage.getItem(this.SESSION_KEY);
    if (sesion) {
      this.usuarioActualSubject.next(JSON.parse(sesion));
    }
  }

  private obtenerUsuarios(): Usuario[] {
    const usuarios = localStorage.getItem(this.STORAGE_KEY);
    return usuarios ? JSON.parse(usuarios) : [];
  }

  private guardarUsuarios(usuarios: Usuario[]): void {
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(usuarios));
  }

  // Registra nuevos usuarios siempre con rol 'usuario'
  registrar(datosUsuario: Omit<Usuario, 'id' | 'fechaRegistro' | 'rol'>): { success: boolean; message: string } {
    const usuarios = this.obtenerUsuarios();

    if (usuarios.some(u => u.dni === datosUsuario.dni)) {
      return { success: false, message: 'Este DNI ya está registrado' };
    }

    if (usuarios.some(u => u.usuario === datosUsuario.usuario)) {
      return { success: false, message: 'Este nombre de usuario ya existe' };
    }

    if (usuarios.some(u => u.correo === datosUsuario.correo)) {
      return { success: false, message: 'Este correo ya está registrado' };
    }

    const nuevoUsuario: Usuario = {
      ...datosUsuario,
      id: usuarios.length > 0 ? Math.max(...usuarios.map(u => u.id)) + 1 : 1,
      fechaRegistro: new Date().toISOString(),
      rol: 'usuario'
    };

    usuarios.push(nuevoUsuario);
    this.guardarUsuarios(usuarios);

    return { success: true, message: 'Usuario registrado exitosamente' };
  }

  // Verifica primero credenciales de admin, luego usuarios registrados
  login(usuario: string, contrasena: string): { success: boolean; message: string } {
    if (usuario === this.ADMIN_USER.usuario && contrasena === this.ADMIN_USER.contrasena) {
      localStorage.setItem(this.SESSION_KEY, JSON.stringify(this.ADMIN_USER));
      this.usuarioActualSubject.next(this.ADMIN_USER);
      return { success: true, message: 'Bienvenido Administrador' };
    }

    const usuarios = this.obtenerUsuarios();
    const usuarioEncontrado = usuarios.find(
      u => u.usuario === usuario && u.contrasena === contrasena
    );

    if (usuarioEncontrado) {
      localStorage.setItem(this.SESSION_KEY, JSON.stringify(usuarioEncontrado));
      this.usuarioActualSubject.next(usuarioEncontrado);
      return { success: true, message: 'Inicio de sesión exitoso' };
    }

    return { success: false, message: 'Usuario o contraseña incorrectos' };
  }

  logout(): void {
    localStorage.removeItem(this.SESSION_KEY);
    this.usuarioActualSubject.next(null);
  }

  estaAutenticado(): boolean {
    return this.usuarioActualSubject.value !== null;
  }

  obtenerUsuarioActual(): Usuario | null {
    return this.usuarioActualSubject.value;
  }

  esAdmin(): boolean {
    const usuario = this.usuarioActualSubject.value;
    return usuario !== null && usuario.rol === 'admin';
  }

  esUsuario(): boolean {
    const usuario = this.usuarioActualSubject.value;
    return usuario !== null && usuario.rol === 'usuario';
  }

  // Valida que la contraseña cumpla requisitos mínimos de seguridad
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