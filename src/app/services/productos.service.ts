import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { TipoCambioService } from './tipo-cambio.service';

export interface Producto {
  id: number;
  nombre: string;
  descripcion: string;
  imagen: string;
  precioSoles: number;
  precioDolares: number;
  categoria: string;
  stock: number;
}

@Injectable({
  providedIn: 'root'
})
export class ProductosService {
  private readonly STORAGE_KEY = 'burgerica_productos';
  
  private productosSubject = new BehaviorSubject<Producto[]>([]);
  public productos$ = this.productosSubject.asObservable();

  constructor(private tipoCambioService: TipoCambioService) {
    this.cargarProductos();
    
    // Recalcula precios en dólares cuando el tipo de cambio cambia
    this.tipoCambioService.tipoCambio$.subscribe(() => {
      this.actualizarPreciosDolaresEnMemoria();
    });
  }

  private convertirADolares(soles: number): number {
    return this.tipoCambioService.convertirSolesADolares(soles);
  }

  // Actualiza precios en memoria sin afectar localStorage
  private actualizarPreciosDolaresEnMemoria(): void {
    const productos = this.productosSubject.value;
    const productosActualizados = productos.map(p => ({
      ...p,
      precioDolares: this.convertirADolares(p.precioSoles)
    }));
    this.productosSubject.next(productosActualizados);
  }

  private cargarProductos(): void {
    const productosGuardados = localStorage.getItem(this.STORAGE_KEY);
    
    if (productosGuardados) {
      const productos = JSON.parse(productosGuardados);
      const productosActualizados = productos.map((p: Producto) => ({
        ...p,
        precioDolares: this.convertirADolares(p.precioSoles)
      }));
      this.productosSubject.next(productosActualizados);
    } else {
      const productosIniciales: Producto[] = [
        {
          id: 1,
          nombre: 'Hamburguesa King',
          descripcion: 'Hamburguesa de carne de res con queso cheddar, lechuga, tomate y salsa especial',
          imagen: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=400',
          precioSoles: 18.00,
          precioDolares: this.convertirADolares(18.00),
          categoria: 'Premium',
          stock: 50
        },
        {
          id: 2,
          nombre: 'Hamburguesa Royale',
          descripcion: 'Doble carne, bacon crujiente, queso americano y cebolla caramelizada',
          imagen: 'https://images.unsplash.com/photo-1550547660-d9450f859349?w=400',
          precioSoles: 22.00,
          precioDolares: this.convertirADolares(22.00),
          categoria: 'Premium',
          stock: 40
        },
        {
          id: 3,
          nombre: 'Hamburguesa BBQ',
          descripcion: 'Carne ahumada con salsa BBQ, aros de cebolla y queso pepper jack',
          imagen: 'https://images.unsplash.com/photo-1553979459-d2229ba7433b?w=400',
          precioSoles: 20.00,
          precioDolares: this.convertirADolares(20.00),
          categoria: 'Especial',
          stock: 35
        },
        {
          id: 4,
          nombre: 'Hamburguesa Clásica',
          descripcion: 'La tradicional con carne de res, lechuga, tomate y mayonesa',
          imagen: 'https://images.unsplash.com/photo-1586190848861-99aa4a171e90?w=400',
          precioSoles: 15.00,
          precioDolares: this.convertirADolares(15.00),
          categoria: 'Clásica',
          stock: 60
        },
        {
          id: 5,
          nombre: 'Hamburguesa Picante',
          descripcion: 'Con jalapeños, salsa picante y queso pepper jack',
          imagen: 'https://images.unsplash.com/photo-1594212699903-ec8a3eca50f5?w=400',
          precioSoles: 19.00,
          precioDolares: this.convertirADolares(19.00),
          categoria: 'Especial',
          stock: 45
        },
        {
          id: 6,
          nombre: 'Hamburguesa Vegetariana',
          descripcion: 'Hamburguesa de lentejas con vegetales frescos y salsa de yogurt',
          imagen: 'https://images.unsplash.com/photo-1520072959219-c595dc870360?w=400',
          precioSoles: 16.00,
          precioDolares: this.convertirADolares(16.00),
          categoria: 'Vegetariana',
          stock: 30
        }
      ];
      
      this.guardarProductos(productosIniciales);
    }
  }

  // Solo guarda precio en soles, el precio en dólares se calcula dinámicamente
  private guardarProductos(productos: Producto[]): void {
    const productosParaGuardar = productos.map(({ precioDolares, ...resto }) => resto);
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(productosParaGuardar));
    this.productosSubject.next(productos);
  }

  obtenerProductos(): Producto[] {
    return this.productosSubject.value;
  }

  obtenerProductoPorId(id: number): Producto | undefined {
    return this.productosSubject.value.find(p => p.id === id);
  }

  crearProducto(producto: Omit<Producto, 'id'>): Producto {
    const productos = this.productosSubject.value;
    const nuevoId = productos.length > 0 ? Math.max(...productos.map(p => p.id)) + 1 : 1;
    
    const nuevoProducto: Producto = {
      ...producto,
      id: nuevoId,
      precioDolares: this.convertirADolares(producto.precioSoles)
    };
    
    const productosActualizados = [...productos, nuevoProducto];
    this.guardarProductos(productosActualizados);
    
    return nuevoProducto;
  }

  actualizarProducto(id: number, productoActualizado: Partial<Producto>): boolean {
    const productos = this.productosSubject.value;
    const index = productos.findIndex(p => p.id === id);
    
    if (index === -1) return false;
    
    productos[index] = {
      ...productos[index],
      ...productoActualizado,
      precioDolares: productoActualizado.precioSoles 
        ? this.convertirADolares(productoActualizado.precioSoles)
        : productos[index].precioDolares
    };
    
    this.guardarProductos(productos);
    return true;
  }

  eliminarProducto(id: number): boolean {
    const productos = this.productosSubject.value;
    const productosFiltrados = productos.filter(p => p.id !== id);
    
    if (productosFiltrados.length === productos.length) return false;
    
    this.guardarProductos(productosFiltrados);
    return true;
  }
}