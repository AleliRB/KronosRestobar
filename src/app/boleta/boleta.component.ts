import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { CarritoService, ItemCarrito } from '../services/carrito.service';
import { AuthService, Usuario } from '../services/auth.service';
import { VentasService } from '../services/ventas.service';
import { TarjetasService, Tarjeta } from '../services/tarjetas.service';
import { SunatService } from '../services/sunat.service';
import { TipoCambioService } from '../services/tipo-cambio.service';
import { FooterComponent } from "../footer/footer.component";
import { HeaderComponent } from "../header/header.component";
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

@Component({
  selector: 'app-boleta',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule,FooterComponent, HeaderComponent],
  templateUrl: './boleta.component.html',
  styleUrl: './boleta.component.css'
})
export class BoletaComponent implements OnInit, OnDestroy {
  // Subject utilizado para gestionar la cancelación de suscripciones activas
  // Previene memory leaks al destruir el componente
  private destroy$ = new Subject<void>();

  items: ItemCarrito[] = [];
  totalSoles: number = 0;
  totalDolares: number = 0;
  compraRealizada: boolean = false;
  numeroBoleta: string = '';
  fechaBoleta: string = '';
  usuarioActual: Usuario | null = null;
  esAdmin: boolean = false;
  
  // Configuración de tipo de comprobante
  tipoComprobante: 'boleta' | 'factura' = 'boleta';
  rucCliente: string = '';
  razonSocial: string = '';
  direccion: string = '';
  consultandoRUC: boolean = false;
  
  // Configuración de entrega
  tipoEntrega: 'recojo' | 'delivery' | null = null;
  direccionEntrega: string = '';
  costoDelivery: number = 5.00;
  
  // Cálculos de totales
  totalFinal: number = 0;
  totalFinalDolares: number = 0;
  tipoCambioActual: number = 3.80;
  
  // Configuración de pago
  metodoPago: 'efectivo' | 'tarjeta' | null = null;
  tarjetas: Tarjeta[] = [];
  tarjetaSeleccionada: Tarjeta | null = null;
  mostrarFormTarjeta: boolean = false;
  tarjetaForm: FormGroup;
  
  constructor(
    private carritoService: CarritoService,
    private authService: AuthService,
    private ventasService: VentasService,
    private tarjetasService: TarjetasService,
    private tipoCambioService: TipoCambioService,
    private sunatService: SunatService,
    private fb: FormBuilder,
    private router: Router
  ) {
    // Validaciones del formulario de tarjeta
    this.tarjetaForm = this.fb.group({
      numeroTarjeta: ['', [Validators.required, Validators.pattern(/^\d{16}$/)]],
      titular: ['', Validators.required],
      tipo: ['debito', Validators.required],
      vencimiento: ['', [Validators.required, Validators.pattern(/^(0[1-9]|1[0-2])\/\d{2}$/)]],
      cvv: ['', [Validators.required, Validators.pattern(/^\d{3,4}$/)]]
    });
  }

  /**
   * Lifecycle Hook: Inicialización del componente
   * Verifica autenticación, carga datos del carrito y suscribe a cambios del tipo de cambio
   */
  ngOnInit(): void {
    if (!this.authService.estaAutenticado()) {
      alert('Debes iniciar sesión para ver la boleta');
      this.router.navigate(['/login']);
      return;
    }

    this.usuarioActual = this.authService.obtenerUsuarioActual();
    this.esAdmin = this.authService.esAdmin();
    this.items = this.carritoService.obtenerItems();
    
    if (this.items.length === 0) {
      alert('El carrito está vacío');
      this.router.navigate(['/productos']);
      return;
    }

    this.totalSoles = this.carritoService.obtenerTotalSoles();
    this.totalDolares = this.carritoService.obtenerTotalDolares();
    
    // Suscripción al tipo de cambio con gestión automática de limpieza
    this.tipoCambioService.tipoCambio$
      .pipe(takeUntil(this.destroy$))
      .subscribe(tipo => {
        this.tipoCambioActual = tipo;
        this.calcularTotalFinal();
      });
    
    this.cargarTarjetas();
  }

  /**
   * Lifecycle Hook: Limpieza al destruir el componente
   * Cancela todas las suscripciones activas para prevenir memory leaks
   */
  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  cargarTarjetas(): void {
    if (this.usuarioActual) {
      this.tarjetas = this.tarjetasService.obtenerTarjetasUsuario(this.usuarioActual.dni);
      const principal = this.tarjetasService.obtenerTarjetaPrincipal(this.usuarioActual.dni);
      if (principal) {
        this.tarjetaSeleccionada = principal;
      }
    }
  }

  seleccionarTipoEntrega(tipo: 'recojo' | 'delivery'): void {
    this.tipoEntrega = tipo;
    if (tipo === 'recojo') {
      this.direccionEntrega = '';
    }
    this.calcularTotalFinal();
  }

  seleccionarTipoComprobante(tipo: 'boleta' | 'factura'): void {
    this.tipoComprobante = tipo;
    if (tipo === 'boleta') {
      this.rucCliente = '';
      this.razonSocial = '';
    }
  }

  /**
   * Consulta datos de empresa en SUNAT usando API
   * Utiliza takeUntil para gestionar la cancelación de la petición HTTP
   */
  consultarRUC(): void {
    if (!this.rucCliente || this.rucCliente.length !== 11) {
      alert("Ingrese un RUC válido de 11 dígitos");
      return;
    }

    this.consultandoRUC = true;

    this.sunatService.buscarRuc(this.rucCliente)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (data) => {
          if (data) {
            this.razonSocial = data.razonSocial || '';
            this.direccion = data.direccion || '';
          } else {
            alert("RUC no encontrado");
          }
        },
        error: (err) => {
          console.error("Error consultando RUC:", err);
          alert("No se pudo consultar el RUC");
        },
        complete: () => {
          this.consultandoRUC = false;
        }
      });
  }

  seleccionarMetodoPago(metodo: 'efectivo' | 'tarjeta'): void {
    this.metodoPago = metodo;
    if (metodo === 'tarjeta' && this.tarjetas.length === 0) {
      this.mostrarFormTarjeta = true;
    }
  }

  seleccionarTarjeta(tarjeta: Tarjeta): void {
    this.tarjetaSeleccionada = tarjeta;
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

  // Formatea automáticamente el campo de vencimiento mientras el usuario escribe (MM/YY)
  formatearVencimiento(event: any): void {
    let valor = event.target.value.replace(/\D/g, '');
    if (valor.length >= 2) {
      valor = valor.substring(0, 2) + '/' + valor.substring(2, 4);
    }
    this.tarjetaForm.patchValue({ vencimiento: valor });
  }

  // Recalcula el total considerando el costo de delivery si aplica
  calcularTotalFinal(): void {
    const costoExtra = this.tipoEntrega === 'delivery' ? this.costoDelivery : 0;
    this.totalFinal = this.totalSoles + costoExtra;
    this.totalFinalDolares = this.tipoCambioService.convertirSolesADolares(this.totalFinal);
  }

  // Procesa la compra después de validar todos los campos requeridos
  realizarCompra(): void {
    if (!this.tipoEntrega) {
      alert('Selecciona un tipo de entrega');
      return;
    }

    if (this.tipoEntrega === 'delivery' && !this.direccionEntrega.trim()) {
      alert('Ingresa la dirección de entrega');
      return;
    }

    if (!this.metodoPago) {
      alert('Selecciona un método de pago');
      return;
    }

    if (this.metodoPago === 'tarjeta' && !this.tarjetaSeleccionada) {
      alert('Selecciona una tarjeta o agrega una nueva');
      return;
    }
    
    if (this.tipoComprobante === 'factura' && (!this.rucCliente || !this.razonSocial)) {
      alert('Debes consultar un RUC válido para factura electrónica');
      return;
    }

    // Generar número de comprobante con prefijo según tipo (B=Boleta, F=Factura)
    const prefix = this.tipoComprobante === 'factura' ? 'F' : 'B';
    this.numeroBoleta = prefix + Date.now().toString().slice(-10);

    const ahora = new Date();
    this.fechaBoleta = ahora.toLocaleDateString('es-PE', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });

    // Registrar venta con todos los datos (incluye info de factura si aplica)
    this.ventasService.registrarVenta({
      numeroBoleta: this.numeroBoleta,
      fecha: this.fechaBoleta,
      tipoComprobante: this.tipoComprobante,
      clienteDni: this.usuarioActual!.dni,
      clienteNombre: `${this.usuarioActual!.nombres} ${this.usuarioActual!.apellidos}`,
      rucCliente: this.tipoComprobante === 'factura' ? this.rucCliente : undefined,
      razonSocial: this.tipoComprobante === 'factura' ? this.razonSocial : undefined,
      direccionFiscal: this.tipoComprobante === 'factura' ? this.direccion : undefined,
      items: this.items.map(item => ({
        producto: item.producto.nombre,
        cantidad: item.cantidad,
        precioUnitario: item.producto.precioSoles,
        subtotal: item.subtotalSoles
      })),
      totalSoles: this.totalFinal,
      totalDolares: this.totalFinalDolares,
      tipoEntrega: this.tipoEntrega!,
      direccionEntrega: this.tipoEntrega === 'delivery' ? this.direccionEntrega : undefined,
      costoDelivery: this.tipoEntrega === 'delivery' ? this.costoDelivery : 0,
      metodoPago: this.metodoPago!,
      tarjetaUsada: this.metodoPago === 'tarjeta' ? this.tarjetaSeleccionada?.numeroTarjeta : undefined
    });

    this.carritoService.vaciarCarrito();
    this.compraRealizada = true;
    alert('¡Compra realizada exitosamente!');
  }

  // Genera PDF de la boleta o factura usando jsPDF y autoTable
  imprimirBoleta(): void {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    
    // Header con logo y datos de la empresa
    doc.setFontSize(26);
    doc.setTextColor(212, 175, 55);
    doc.setFont('helvetica', 'bold');
    doc.text('Cronos', pageWidth / 2, 20, { align: 'center' });
    
    doc.setFontSize(9);
    doc.setTextColor(80);
    doc.setFont('helvetica', 'normal');
    doc.text('Calle Principal 123, Ica', pageWidth / 2, 27, { align: 'center' });
    doc.text('Tel: (056) 123-456', pageWidth / 2, 32, { align: 'center' });
    
    doc.setDrawColor(200);
    doc.setLineWidth(0.5);
    doc.line(15, 36, pageWidth - 15, 36);
    
    // Título dinámico según tipo de comprobante
    doc.setFontSize(18);
    doc.setTextColor(0);
    doc.setFont('helvetica', 'bold');
    const tituloComprobante = this.tipoComprobante === 'boleta' ? 'BOLETA DE VENTA ELECTRÓNICA' : 'FACTURA DE VENTA ELECTRÓNICA';
    doc.text(tituloComprobante, pageWidth / 2, 45, { align: 'center' });
    
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text(`N°: ${this.numeroBoleta}`, pageWidth / 2, 52, { align: 'center' });
    doc.text(`Fecha: ${this.fechaBoleta}`, pageWidth / 2, 58, { align: 'center' });
    
    let yPosition = 70;
    
    // Datos del cliente o empresa según tipo de comprobante
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    const tituloCliente = this.tipoComprobante === 'boleta' ? 'Datos del Cliente:' : 'Datos de la Empresa:';
    doc.text(tituloCliente, 15, yPosition);
    
    yPosition += 7;
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    
    if (this.tipoComprobante === 'boleta') {
      doc.text(`DNI: ${this.usuarioActual?.dni}`, 15, yPosition);
      yPosition += 6;
      doc.text(`Cliente: ${this.usuarioActual?.nombres} ${this.usuarioActual?.apellidos}`, 15, yPosition);
    } else {
      doc.text(`RUC: ${this.rucCliente}`, 15, yPosition);
      yPosition += 6;
      doc.text(`Razón Social: ${this.razonSocial}`, 15, yPosition);
      yPosition += 6;
      const direccionLineas = doc.splitTextToSize(`Dirección Fiscal: ${this.direccion}`, 170);
      doc.text(direccionLineas, 15, yPosition);
      yPosition += (direccionLineas.length * 5);
    }
    
    // Tipo de entrega con fondo de color
    yPosition += 12;
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('Tipo de Entrega:', 15, yPosition);
    
    yPosition += 7;
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    
    if (this.tipoEntrega === 'recojo') {
      doc.setFillColor(217, 237, 247);
      doc.rect(15, yPosition - 5, 50, 8, 'F');
      doc.text('Recojo en Tienda', 17, yPosition);
    } else {
      doc.setFillColor(252, 248, 227);
      doc.rect(15, yPosition - 5, 30, 8, 'F');
      doc.text('Delivery', 17, yPosition);
    }
    
    if (this.tipoEntrega === 'delivery' && this.direccionEntrega) {
      yPosition += 8;
      doc.setFont('helvetica', 'bold');
      doc.text('Dirección:', 15, yPosition);
      doc.setFont('helvetica', 'normal');
      const maxWidth = 150;
      const direccionLineas = doc.splitTextToSize(this.direccionEntrega, maxWidth);
      doc.text(direccionLineas, 37, yPosition);
      yPosition += (direccionLineas.length - 1) * 5;
    }
    
    // Método de pago
    yPosition += 10;
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('Método de Pago:', 15, yPosition);
    
    yPosition += 7;
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    
    if (this.metodoPago === 'efectivo') {
      doc.setFillColor(220, 252, 231);
      doc.rect(15, yPosition - 5, 25, 8, 'F');
      doc.text('Efectivo', 17, yPosition);
    } else {
      doc.setFillColor(255, 243, 205);
      doc.rect(15, yPosition - 5, 70, 8, 'F');
      doc.text(`Tarjeta **** ${this.tarjetaSeleccionada?.numeroTarjeta}`, 17, yPosition);
    }
    
    yPosition += 12;
    
    // Preparar datos de productos para la tabla
    const productosData = this.items.map(item => [
      item.producto.nombre,
      item.cantidad.toString(),
      `S/ ${item.producto.precioSoles.toFixed(2)}`,
      `S/ ${item.subtotalSoles.toFixed(2)}`
    ]);
    
    if (this.tipoEntrega === 'delivery') {
      productosData.push([
        'Costo de Delivery',
        '1',
        `S/ ${this.costoDelivery.toFixed(2)}`,
        `S/ ${this.costoDelivery.toFixed(2)}`
      ]);
    }
    
    // Tabla de productos con autoTable
    autoTable(doc, {
      startY: yPosition,
      head: [['Producto', 'Cant.', 'P. Unitario', 'Subtotal']],
      body: productosData,
      theme: 'grid',
      headStyles: {
        fillColor: [212, 175, 55],
        textColor: 255,
        fontStyle: 'bold',
        halign: 'center'
      },
      columnStyles: {
        0: { cellWidth: 80 },
        1: { halign: 'center', cellWidth: 20 },
        2: { halign: 'right', cellWidth: 35 },
        3: { halign: 'right', cellWidth: 35 }
      },
      styles: {
        fontSize: 10,
        cellPadding: 5
      },
      foot: [[
        { content: 'TOTAL:', colSpan: 3, styles: { halign: 'right', fontStyle: 'bold', fontSize: 12 } },
        { content: `S/ ${this.totalFinal.toFixed(2)}`, styles: { textColor: [212, 175, 55], fontStyle: 'bold', fontSize: 12, halign: 'right' } }
      ]],
      footStyles: {
        fillColor: [240, 240, 240],
        textColor: 0
      }
    });
    
    // Información adicional y footer
    const finalY = (doc as any).lastAutoTable.finalY + 10;
    doc.setFontSize(8);
    doc.setTextColor(100);
    doc.text(`Tipo de cambio: S/ ${this.tipoCambioActual.toFixed(3)} = $ 1.00`, 15, finalY);
    doc.text(`Total en dólares: $ ${this.totalFinalDolares.toFixed(2)}`, 15, finalY + 5);
    
    doc.setDrawColor(200);
    doc.setLineWidth(0.5);
    doc.line(15, finalY + 10, pageWidth - 15, finalY + 10);
    
    doc.setFontSize(10);
    doc.setTextColor(100);
    doc.setFont('helvetica', 'italic');
    doc.text('¡Gracias por tu compra!', pageWidth / 2, finalY + 17, { align: 'center' });
    
    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    doc.text('Cronos - Sabores que conquistan', pageWidth / 2, finalY + 23, { align: 'center' });
    
    // Guardar con nombre dinámico según tipo
    const nombreArchivo = this.tipoComprobante === 'boleta' ? 'Boleta' : 'Factura';
    doc.save(`${nombreArchivo}_${this.numeroBoleta}.pdf`);
  }

  volverAProductos(): void {
    this.router.navigate(['/productos']);
  }

  cancelar(): void {
    this.router.navigate(['/carrito']);
  }
}