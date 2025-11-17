import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

export interface Producto {
  id: number;
  nombre: string;
  descripcion: string;
  imagen: string;
  precioSoles: number;
  precioDolares: number;
  categoria: string;
  tipoCategoria?: string;
  stock: number;
}

@Injectable({
  providedIn: 'root'
})
export class ProductosService {
  private readonly STORAGE_KEY = 'burgerica_productos';
  private readonly TIPO_CAMBIO = 3.80; // Tasa de cambio S/ a $
  
  private productosSubject = new BehaviorSubject<Producto[]>([]);
  public productos$ = this.productosSubject.asObservable();

  constructor() {
    this.cargarProductos();
  }

  /**
   * Carga productos desde LocalStorage o inicializa datos de ejemplo
   */
  private cargarProductos(): void {
    const productosGuardados = localStorage.getItem(this.STORAGE_KEY);
    
    if (productosGuardados) {
      this.productosSubject.next(JSON.parse(productosGuardados));
    } else {
      // Productos iniciales
      const productosIniciales: Producto[] = [
  {
    id: 1,
    nombre: 'Alitas BBQ',
    descripcion: 'Alitas de pollo bañadas en salsa barbacoa, acompañadas de papas fritas',
    imagen: 'https://www.unileverfoodsolutions.com.co/dam/global-ufs/mcos/NOLA/calcmenu/recipes/col-recipies/fruco/ALITAS-SALSA-1024X1024-px.jpg',
    precioSoles: 22.00,
    precioDolares: this.convertirADolares(22.00),
    categoria: 'Especial',
    tipoCategoria: 'Platos',
    stock: 50
  },
  {
    id: 2,
    nombre: 'Tequeños medianos',
    descripcion: 'Palitos de masa rellenos de queso, fritos y servidos con guacamole',
    imagen: 'https://comedera.com/wp-content/uploads/sites/9/2022/06/tequenos-peruanos.jpg?fit=720,480&crop=0px,38px,720px,404px',
    precioSoles: 16.00,
    precioDolares: this.convertirADolares(16.00),
    categoria: 'Clásica',
    tipoCategoria: 'Platos',
    stock: 48
  },
  {
    id: 3,
    nombre: 'Nachos con queso y guacamole',
    descripcion: 'Totopos de maíz con queso fundido y guacamole fresco',
    imagen: 'https://www.quesosmanchegos.com/wp-content/uploads/2023/07/Nachos-gratinados-con-queso-manchego-y-guacamole.jpg',
    precioSoles: 18.00,
    precioDolares: this.convertirADolares(18.00),
    categoria: 'Especial',
    tipoCategoria: 'Platos',
    stock: 30
  },
  {
    id: 4,
    nombre: 'Brochetas de pollo',
    descripcion: 'Pinchos de pollo a la parrilla con verduras',
    imagen: 'https://granddeligourmet.net/wp-content/uploads/2012/03/brochetas-de-pollo.jpg',
    precioSoles: 14.00,
    precioDolares: this.convertirADolares(14.00),
    categoria: 'Clásica',
    tipoCategoria: 'Platos',
    stock: 35
  },
  {
    id: 5,
    nombre: 'Anticuchos',
    descripcion: 'Corazón de res marinado, servido con papa dorada y ají',
    imagen: 'https://peru21.pe/sites/default/efsfiles/2024-10/anticuchos.jpg',
    precioSoles: 24.00,
    precioDolares: this.convertirADolares(24.00),
    categoria: 'Clásica',
    tipoCategoria: 'Platos',
    stock: 45
  },
  {
    id: 6,
    nombre: 'Quesadillas',
    descripcion: 'Tortillas rellenas de queso fundido y pollo, doradas a la plancha',
    imagen: 'https://i.ytimg.com/vi/7J5JqSOP-1s/maxresdefault.jpg',
    precioSoles: 15.00,
    precioDolares: this.convertirADolares(15.00),
    categoria: 'Especial',
    tipoCategoria: 'Platos',
    stock: 27
  },
  {
    id: 7,
    nombre: 'Chicken fingers',
    descripcion: 'Tiras de pollo empanizadas y fritas, servidas con salsas',
    imagen: 'https://media.istockphoto.com/id/1360189900/es/foto/tiras-de-pollo-frito-servidas-con-salsas-y-papas-fritas-de-cerca-en-una-bandeja-de-madera.jpg?s=612x612&w=0&k=20&c=S-yfmDXg9SeQMQwBZAy5wICmb42gTeWaCxpgSF_yPME=',
    precioSoles: 19.00,
    precioDolares: this.convertirADolares(19.00),
    categoria: 'Clásica',
    tipoCategoria: 'Platos',
    stock: 32
  },
  {
    id: 8,
    nombre: 'Salchipapas especiales',
    descripcion: 'Papas fritas con salchicha, carne, pollo, queso y salsas',
    imagen: 'https://peruvianfood.top/wp-content/uploads/2025/08/peruvian-salchipapa-1024x683.png',
    precioSoles: 20.00,
    precioDolares: this.convertirADolares(20.00),
    categoria: 'Especial',
    tipoCategoria: 'Platos',
    stock: 48
  },
  {
    id: 9,
    nombre: 'Hamburguesa clásica',
    descripcion: 'Papas fritas con salchicha, carne, pollo, queso y salsas',
    imagen: 'https://us.123rf.com/450wm/starush/starush2306/starush230600433/206003436-una-hamburguesa-y-papas-fritas-en-una-tabla-de-cortar-imagen-generativa-de-ai.jpg?ver=6',
    precioSoles: 15.00,
    precioDolares: this.convertirADolares(15.00),
    categoria: 'Clásica',
    tipoCategoria: 'Platos',
    stock: 40
  },
  {
    id: 10,
    nombre: 'Hamburguesa doble carne',
    descripcion: 'Pan artesanal con doble carne de res, queso cheddar, lechuga y tomate',
    imagen: 'https://img.freepik.com/foto-gratis/vista-lateral-hamburguesa-queso-doble-empanadas-carne-parrilla-queso-hoja-lechuga-panes-hamburger_141793-4883.jpg',
    precioSoles: 24.00,
    precioDolares: this.convertirADolares(24.00),
    categoria: 'Premium',
    tipoCategoria: 'Platos',
    stock: 55
  },
  {
    id: 11,
    nombre: 'Tacos mixtos',
    descripcion: 'Tortillas rellenas de carne y pollo sazonados, con guacamole y pico de gallo',
    imagen: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTk820DFdQ9zOZzFgBJEwpqsjCN0QfQqn7GXg&s',
    precioSoles: 19.00,
    precioDolares: this.convertirADolares(19.00),
    categoria: 'Especial',
    tipoCategoria: 'Platos',
    stock: 20
  },
  {
    id: 12,
    nombre: 'Sándwich de pollo a la plancha',
    descripcion: 'Pan artesanal con pechuga de pollo, lechuga, tomate y mayonesa',
    imagen: 'https://cloudfront-us-east-1.images.arcpublishing.com/elespectador/VJ6JDP2TSFCQJGXORDM66DH5CQ.jpg',
    precioSoles: 14.00,
    precioDolares: this.convertirADolares(14.00),
    categoria: 'Clásica',
    tipoCategoria: 'Platos',
    stock: 28
  },
  {
    id: 13,
    nombre: 'Wrap de pollo',
    descripcion: 'Tortilla rellena de pollo, vegetales frescos y salsa ligera',
    imagen: 'https://resuelveconbimbo-com-v2-assets.s3.amazonaws.com/s3fs-public/2024-01/Banner%20Desktop_Wrap%20de%20Pollo.webp?VersionId=Gi5bWLFSfFnCTn80o5DrZEklPfhs8l3q',
    precioSoles: 17.00,
    precioDolares: this.convertirADolares(17.00),
    categoria: 'Especial',
    tipoCategoria: 'Platos',
    stock: 17
  },
  {
    id: 14,
    nombre: 'Pollo crispy con papas',
    descripcion: 'Tiras de pollo empanizadas y fritas, acompañadas de papas crocantes',
    imagen: 'https://i.pinimg.com/1200x/02/72/63/027263cdc3f4d1493c40e8a45d4e01c1.jpg',
    precioSoles: 19.00,
    precioDolares: this.convertirADolares(19.00),
    categoria: 'Clásica',
    tipoCategoria: 'Platos',
    stock: 29
  },
  {
    id: 15,
    nombre: 'Ensalada con queso y nueces',
    descripcion: 'Lechuga, queso de cabra, nueces y vinagreta de miel',
    imagen: 'https://valledearas.com/wordpress/wp-content/uploads/2022/11/ensalada-de-queso-de-cabra-y-nueces.jpg',
    precioSoles: 16.00,
    precioDolares: this.convertirADolares(16.00),
    categoria: 'Premium',
    tipoCategoria: 'Platos',
    stock: 42
  },
  {
    id: 16,
    nombre: 'Pisco Sour',
    descripcion: 'Cóctel peruano con pisco, limón, clara de huevo y amargo de angostura',
    imagen: 'https://perupationline.com/wp-content/uploads/2021/02/PISCO-SOUR.jpg',
    precioSoles: 25.00,
    precioDolares: this.convertirADolares(25.00),
    categoria: 'Premium',
    tipoCategoria: 'Bebidas',
    stock: 48
  },
  {
    id: 17,
    nombre: 'Maracuyá Sou',
    descripcion: 'Variante del pisco sour con jugo de maracuyá natural, pisco, clara de huevo y amargo de angostura',
    imagen: 'https://mirecetadehoy.com/assets/images/maracuya-sour_800x534.webp',
    precioSoles: 26.00,
    precioDolares: this.convertirADolares(26.00),
    categoria: 'Especial',
    tipoCategoria: 'Bebidas',
    stock: 45
  },
  {
    id: 18,
    nombre: 'Mojito',
    descripcion: 'Ron blanco, hierbabuena, azúcar, limón y soda, servido con hielo',
    imagen: 'https://www.juomavinkki.fi/wp-content/uploads/2024/06/Mojito_cocktail.jpg',
    precioSoles: 24.00,
    precioDolares: this.convertirADolares(24.00),
    categoria: 'Premium',
    tipoCategoria: 'Bebidas',
    stock: 35
  },
  {
    id: 19,
    nombre: 'Chilcano clásico',
    descripcion: 'Pisco, ginger ale, limón y gotas de amargo de angostura',
    imagen: 'https://buenazo.cronosmedia.glr.pe/original/2020/09/17/5f63c4e9f0bf3c6db767471a.jpg',
    precioSoles: 22.00,
    precioDolares: this.convertirADolares(22.00),
    categoria: 'Clásica',
    tipoCategoria: 'Bebidas',
    stock: 28
  },
  {
    id: 20,
    nombre: 'Cuba Libre',
    descripcion: 'Ron oscuro, gaseosa de cola y limón, servido con hielo',
    imagen: 'https://theswissstandard.com/cdn/shop/articles/cuba-libre.jpg?v=1740354831&width=1100',
    precioSoles: 24.00,
    precioDolares: this.convertirADolares(24.00),
    categoria: 'Clásica',
    tipoCategoria: 'Bebidas',
    stock: 36
  },
  {
    id: 21,
    nombre: 'Gin Tonic',
    descripcion: 'Ginebra y agua tónica con rodajas de limón o pepino',
    imagen: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQhzKuWzkWUbgXLz0QdBe7rTrNzEOBUb8ilkCs9peJ-5wnzgK_oCeHtvGQCRzUJrHe99ug&usqp=CAU',
    precioSoles: 23.00,
    precioDolares: this.convertirADolares(23.00),
    categoria: 'Premium',
    tipoCategoria: 'Bebidas',
    stock: 50
  },
  {
    id: 22,
    nombre: 'Daiquirí',
    descripcion: 'Ron blanco, jugo de limón y azúcar, servido frappé o en las rocas',
    imagen: 'https://hosteleriaecuador.com/wp-content/uploads/Daiquiri.jpg',
    precioSoles: 26.00,
    precioDolares: this.convertirADolares(26.00),
    categoria: 'Especial',
    tipoCategoria: 'Bebidas',
    stock: 42
  },
  {
    id: 23,
    nombre: 'Cerveza Cusqueña',
    descripcion: 'Cerveza peruana premium, disponible en variedades dorada, negra y trigo',
    imagen: 'https://barbusiness.es/wp-content/uploads/2021/10/Cusquen%CC%83a-Co%CC%81ctel-Chelada-Iberlicor-Bar-Business.jpg',
    precioSoles: 18.00,
    precioDolares: this.convertirADolares(18.00),
    categoria: 'Premium',
    tipoCategoria: 'Bebidas',
    stock: 55
  },
  {
    id: 24,
    nombre: 'Jugo de maracuyá',
    descripcion: 'Jugo natural de maracuyá, servido frío con azúcar y hielo',
    imagen: 'https://www.clarin.com/2024/06/28/-f2M6O9wV_2000x1500__1.jpg',
    precioSoles: 7.00,
    precioDolares: this.convertirADolares(7.00),
    categoria: 'Clásica',
    tipoCategoria: 'Bebidas',
    stock: 75
  },
  {
    id: 25,
    nombre: 'Agua con gas',
    descripcion: 'Agua mineral con gas, servida fría',
    imagen: 'https://phantom-elmundo.unidadeditorial.es/f650ecc8d3da0fefba675b7ddbc4bb7a/crop/0x0/2731x2048/resize/1200/f/jpg/assets/multimedia/imagenes/2023/08/03/16910529417869.jpg',
    precioSoles: 5.00,
    precioDolares: this.convertirADolares(5.00),
    categoria: 'Clásica',
    tipoCategoria: 'Bebidas',
    stock: 60
  },
  {
    id: 26,
    nombre: 'Gaseosas',
    descripcion: 'Inka Kola, Coca-Cola, Sprite, Fanta y otras bebidas carbonatadas',
    imagen: 'https://media.istockphoto.com/id/477567550/es/foto/bebidas-helada.jpg?s=612x612&w=0&k=20&c=utvO5blVI8Ti37mn4vHsxxDo5ZvWlQO1RV6mh5e_Uvs=',
    precioSoles: 6.00,
    precioDolares: this.convertirADolares(6.00),
    categoria: 'Clásica',
    tipoCategoria: 'Bebidas',
    stock: 200
  },
  {
    id: 27,
    nombre: 'Cheesecake de fresa',
    descripcion: 'Tarta fría de queso crema con base de galleta y cobertura de fresa natural',
    imagen: 'https://www.splenda.com/wp-content/themes/bistrotheme/assets/recipe-images/strawberry-topped-cheesecake.jpg',
    precioSoles: 14.00,
    precioDolares: this.convertirADolares(14.00),
    categoria: 'Clásica',
    tipoCategoria: 'Postres',
    stock: 35
  },
  {
    id: 28,
    nombre: 'Cheesecake de maracuyá',
    descripcion: 'Cheesecake con cobertura de maracuyá natural, base de galleta y textura cremosa',
    imagen: 'https://i0.wp.com/recetaskwa.com/wp-content/uploads/2024/01/Cheescake-Maracuya_2.jpg?ssl=1',
    precioSoles: 14.50,
    precioDolares: this.convertirADolares(14.50),
    categoria: 'Especial',
    tipoCategoria: 'Postres',
    stock: 45
  },
  {
    id: 29,
    nombre: 'Brownie con helado',
    descripcion: 'Brownie de chocolate tibio con bola de helado de vainilla y salsa de chocolate',
    imagen: 'https://www.johaprato.com/files/brownie_y_helado.jpg',
    precioSoles: 15.00,
    precioDolares: this.convertirADolares(15.00),
    categoria: 'Premium',
    tipoCategoria: 'Postres',
    stock: 50
  },
  {
    id: 30,
    nombre: 'Pie de limón',
    descripcion: 'Tarta fría de limón con base de galleta y merengue',
    imagen: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSg1ExgigC2ZPGGje2y8ujw6HM_m3c8qxU2gB6OK223U3Q9MkhnaBBX7VSTgxkCLeOUTs8&usqp=CAU',
    precioSoles: 12.00,
    precioDolares: this.convertirADolares(12.00),
    categoria: 'Clásica',
    tipoCategoria: 'Postres',
    stock: 110
  },
  {
    id: 31,
    nombre: 'Helado artesanal',
    descripcion: 'Helado casero de sabores naturales como lúcuma, fresa o chocolate',
    imagen: 'https://www.horeca.pe/sites/default/files/boletin%20octubre%2021-13%20%286%29_1.png',
    precioSoles: 10.00,
    precioDolares: this.convertirADolares(10.00),
    categoria: 'Especial',
    tipoCategoria: 'Postres',
    stock: 200
  },
  {
    id: 32,
    nombre: 'Crepe dulce',
    descripcion: 'Crepe relleno de frutas y crema, servido con salsa de chocolate',
    imagen: 'https://www.laespanolaaceites.com/wp-content/uploads/2019/06/crepes-dulces-1080x671.jpg',
    precioSoles: 13.00,
    precioDolares: this.convertirADolares(13.00),
    categoria: 'Especial',
    tipoCategoria: 'Postres',
    stock: 80
  },
  {
    id: 33,
    nombre: 'Tiramisú',
    descripcion: 'Postre italiano con capas de bizcocho, café y crema de mascarpone',
    imagen: 'https://www.paulinacocina.net/wp-content/uploads/2020/01/receta-de-tiramisu-facil-y-economico-1740483918.jpg',
    precioSoles: 20.00,
    precioDolares: this.convertirADolares(20.00),
    categoria: 'Premium',
    tipoCategoria: 'Postres',
    stock: 40
  },
  {
    id: 34,
    nombre: 'Tarta tres leches',
    descripcion: 'Bizcocho bañado en mezcla de tres leches, con crema chantilly"',
    imagen: 'https://i.ytimg.com/vi/vv2FErMhEVQ/hq720.jpg?sqp=-oaymwEhCK4FEIIDSFryq4qpAxMIARUAAAAAGAElAADIQj0AgKJD&rs=AOn4CLAsyJKnPlHkpYKFgjJptd9pc0F7sA',
    precioSoles: 13.00,
    precioDolares: this.convertirADolares(13.00),
    categoria: 'Clásica',
    tipoCategoria: 'Postres',
    stock: 60
  },
  {
    id: 35,
    nombre: 'Mousse de chocolate',
    descripcion: 'Postre frío de chocolate con textura ligera y cremosa',
    imagen: 'https://www.recetasnestlecam.com/sites/default/files/srh_recipes/369562012750bd46ceaeef5d59a23229.jpg',
    precioSoles: 12.00,
    precioDolares: this.convertirADolares(12.00),
    categoria: 'Especial',
    tipoCategoria: 'Postres',
    stock: 50
  }
];
      
      this.guardarProductos(productosIniciales);
    }
  }

  /**
   * Convierte precio de soles a dólares
   */
  private convertirADolares(soles: number): number {
    return parseFloat((soles / this.TIPO_CAMBIO).toFixed(2));
  }

  /**
   * Guarda productos en LocalStorage
   */
  private guardarProductos(productos: Producto[]): void {
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(productos));
    this.productosSubject.next(productos);
  }

  /**
   * Obtiene todos los productos
   */
  obtenerProductos(): Producto[] {
    return this.productosSubject.value;
  }

  /**
   * Obtiene un producto por ID
   */
  obtenerProductoPorId(id: number): Producto | undefined {
    return this.productosSubject.value.find(p => p.id === id);
  }

  /**
   * Crea un nuevo producto
   */
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

  /**
   * Actualiza un producto existente
   */
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

  /**
   * Elimina un producto
   */
  eliminarProducto(id: number): boolean {
    const productos = this.productosSubject.value;
    const productosFiltrados = productos.filter(p => p.id !== id);
    
    if (productosFiltrados.length === productos.length) return false;
    
    this.guardarProductos(productosFiltrados);
    return true;
  }

  /**
   * Actualiza el tipo de cambio y recalcula precios
   */
  actualizarTipoCambio(nuevoTipoCambio: number): void {
    const productos = this.productosSubject.value.map(p => ({
      ...p,
      precioDolares: parseFloat((p.precioSoles / nuevoTipoCambio).toFixed(2))
    }));
    
    this.guardarProductos(productos);
  }
}