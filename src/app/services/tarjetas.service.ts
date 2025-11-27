import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

export interface Tarjeta {
  id: number;
  usuarioDni: string;
  numeroTarjeta: string;
  titular: string;
  tipo: 'debito' | 'credito';
  vencimiento: string;
  esPrincipal: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class TarjetasService {
  private readonly STORAGE_KEY = 'burgerica_tarjetas';
  
  private tarjetasSubject = new BehaviorSubject<Tarjeta[]>([]);
  public tarjetas$ = this.tarjetasSubject.asObservable();

  constructor() {
    this.cargarTarjetas();
  }

  private cargarTarjetas(): void {
    const tarjetas = localStorage.getItem(this.STORAGE_KEY);
    if (tarjetas) {
      this.tarjetasSubject.next(JSON.parse(tarjetas));
    }
  }

  private guardarTarjetas(tarjetas: Tarjeta[]): void {
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(tarjetas));
    this.tarjetasSubject.next(tarjetas);
  }

  // La primera tarjeta del usuario se marca como principal automáticamente
  agregarTarjeta(tarjeta: Omit<Tarjeta, 'id'>): void {
    const tarjetas = this.tarjetasSubject.value;
    const esPrimera = tarjetas.filter(t => t.usuarioDni === tarjeta.usuarioDni).length === 0;
    
    const nuevaTarjeta: Tarjeta = {
      ...tarjeta,
      id: tarjetas.length > 0 ? Math.max(...tarjetas.map(t => t.id)) + 1 : 1,
      esPrincipal: esPrimera || tarjeta.esPrincipal
    };

    // Si la nueva tarjeta es principal, quita el flag de las demás del mismo usuario
    if (nuevaTarjeta.esPrincipal) {
      tarjetas.forEach(t => {
        if (t.usuarioDni === tarjeta.usuarioDni) {
          t.esPrincipal = false;
        }
      });
    }

    tarjetas.push(nuevaTarjeta);
    this.guardarTarjetas(tarjetas);
  }

  obtenerTarjetasUsuario(usuarioDni: string): Tarjeta[] {
    return this.tarjetasSubject.value.filter(t => t.usuarioDni === usuarioDni);
  }

  obtenerTarjetaPrincipal(usuarioDni: string): Tarjeta | undefined {
    return this.tarjetasSubject.value.find(t => t.usuarioDni === usuarioDni && t.esPrincipal);
  }

  establecerTarjetaPrincipal(tarjetaId: number, usuarioDni: string): void {
    const tarjetas = this.tarjetasSubject.value;
    
    tarjetas.forEach(t => {
      if (t.usuarioDni === usuarioDni) {
        t.esPrincipal = t.id === tarjetaId;
      }
    });

    this.guardarTarjetas(tarjetas);
  }

  eliminarTarjeta(tarjetaId: number): void {
    const tarjetas = this.tarjetasSubject.value.filter(t => t.id !== tarjetaId);
    this.guardarTarjetas(tarjetas);
  }

  // Validación básica usando algoritmo de Luhn simplificado
  validarNumeroTarjeta(numero: string): boolean {
    return numero.length === 16 && /^\d+$/.test(numero);
  }

  // Retorna solo los últimos 4 dígitos de la tarjeta
  enmascarar(numeroCompleto: string): string {
    return numeroCompleto.slice(-4);
  }
}