import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';

export interface SunatRucResponse {
  ruc: string;
  razonSocial: string;
  direccion: string;
}

@Injectable({
  providedIn: 'root'
})
export class SunatService {
  private readonly API_URL = '/api/ruc';
  private readonly TOKEN = '47ed608cf2038e49755c8ce4a83bc8e2f456723fbf4c72eed6a0379687d1b32b';

  constructor(private http: HttpClient) {}

  // Consulta datos de empresa en SUNAT usando RUC
  buscarRuc(ruc: string): Observable<SunatRucResponse | null> {
    if (!ruc || ruc.length !== 11 || !/^\d+$/.test(ruc)) {
      return of(null);
    }

    const headers = new HttpHeaders({
      'Authorization': `Bearer ${this.TOKEN}`,
      'Content-Type': 'application/json'
    });

    const body = { ruc: ruc };

    return this.http.get<any>(`${this.API_URL}/${ruc}`).pipe(
      map(response => {
        if (response && response.data) {
          return {
            ruc: response.data.ruc,
            razonSocial: response.data.nombre_o_razon_social,
            direccion: response.data.direccion_completa
          };
        }
        return null;
      }),
      catchError(() => of(null))
    );
  }
} 