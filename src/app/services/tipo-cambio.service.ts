import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { BehaviorSubject } from 'rxjs';
import { catchError, map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class TipoCambioService {
  private readonly API_URL = '/api/tipo-de-cambio';
  
  private tipoCambioSubject = new BehaviorSubject<number>(3.37);
  public tipoCambio$ = this.tipoCambioSubject.asObservable();

  constructor(private http: HttpClient) {
    this.obtenerTipoCambio();
  }

  // Consulta el tipo de cambio del día actual en la API
  obtenerTipoCambio(): void {
    const headers = new HttpHeaders({
      'Accept': 'application/json',
      'Content-Type': 'application/json'
    });

    // Fecha reciente de noviembre 2025
    const body = { fecha: '2025-11-15' };

    this.http.post<any>(this.API_URL, body, { headers }).pipe(
      map(response => {
        console.log('Respuesta tipo cambio:', response);
        
        if (response?.success && response?.data?.compra) {
          return parseFloat(response.data.compra.toFixed(3));
        }
        if (response?.data?.compra) {
          return parseFloat(response.data.compra.toFixed(3));
        }
        return 3.37;
      }),
      catchError((error) => {
        console.error('Error tipo cambio:', error);
        return [3.37];
      })
    ).subscribe(tipo => {
      console.log('Tipo de cambio final:', tipo);
      this.tipoCambioSubject.next(tipo);
    });
  }

  obtenerTipoCambioActual(): number {
    return this.tipoCambioSubject.value;
  }

  convertirSolesADolares(soles: number): number {
    return parseFloat((soles / this.tipoCambioSubject.value).toFixed(2));
  }

  convertirDolaresASoles(dolares: number): number {
    return parseFloat((dolares * this.tipoCambioSubject.value).toFixed(2));
  }
}