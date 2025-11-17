import { Component,OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { CarritoService, ItemCarrito } from '../services/carrito.service';
import { ReniecService, ReniecResponse } from '../services/reniec.service';
@Component({
  selector: 'app-boleta',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './boleta.component.html',
  styleUrl: './boleta.component.css'
})
export class BoletaComponent implements OnInit{
 boletaForm: FormGroup;
  items: ItemCarrito[] = [];
  totalSoles: number = 0;
  totalDolares: number = 0;
  consultandoDNI: boolean = false;
  boletaGenerada: boolean = false;
  numeroBoleta: string = '';
  fechaBoleta: string = '';
  
  constructor(
    private fb: FormBuilder,
    private carritoService: CarritoService,
    private reniecService: ReniecService,
    private router: Router
  ) {
    this.boletaForm = this.fb.group({
      dni: ['', [Validators.required, Validators.pattern(/^\d{8}$/)]],
      nombres: [{ value: '', disabled: true }, Validators.required],
      apellidos: [{ value: '', disabled: true }, Validators.required]
    });
  }

  ngOnInit(): void {
    // Verificar si hay items en el carrito
    this.items = this.carritoService.obtenerItems();
    
    if (this.items.length === 0) {
      alert('El carrito está vacío');
      this.router.navigate(['/productos']);
      return;
    }

    this.totalSoles = this.carritoService.obtenerTotalSoles();
    this.totalDolares = this.carritoService.obtenerTotalDolares();
  }

  /**
   * Consulta DNI en RENIEC
   */
  onDNIBlur(): void {
    const dni = this.boletaForm.get('dni')?.value;
    
    if (dni && dni.length === 8 && /^\d{8}$/.test(dni)) {
      this.consultandoDNI = true;

      this.reniecService.consultarDNI(dni).subscribe({
        next: (data: ReniecResponse | null) => {
          this.consultandoDNI = false;
          
          if (data) {
            this.boletaForm.patchValue({
              nombres: data.nombres,
              apellidos: `${data.apellidoPaterno} ${data.apellidoMaterno}`
            });
          } else {
            alert('No se encontraron datos para este DNI');
          }
        },
        error: () => {
          this.consultandoDNI = false;
          alert('Error al consultar DNI');
        }
      });
    }
  }

  /**
   * Genera la boleta
   */
  generarBoleta(): void {
    if (this.boletaForm.invalid) {
      alert('Por favor, completa todos los campos correctamente');
      return;
    }

    // Generar número de boleta aleatorio
    this.numeroBoleta = 'B' + Date.now().toString().slice(-8);
    
    // Fecha actual
    const ahora = new Date();
    this.fechaBoleta = ahora.toLocaleDateString('es-PE', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });

    this.boletaGenerada = true;
  }

  /**
   * Imprime la boleta
   */
  imprimirBoleta(): void {
    window.print();
  }

  /**
   * Finaliza la compra y limpia el carrito
   */
  finalizarCompra(): void {
    if (confirm('¿Deseas finalizar la compra? El carrito se vaciará.')) {
      this.carritoService.vaciarCarrito();
      alert('¡Compra realizada exitosamente!');
      this.router.navigate(['/productos']);
    }
  }

  /**
   * Cancela y vuelve al carrito
   */
  cancelar(): void {
    this.router.navigate(['/carrito']);
  }
}
