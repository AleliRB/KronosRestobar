import { Routes } from '@angular/router';
import { InicioComponent } from './inicio/inicio.component';
import { ConocenosComponent } from './conocenos/conocenos.component';
import { ProductosComponent } from './productos/productos.component';
import { LoginComponent } from './login/login.component';
import { CarritoComponent } from './carrito/carrito.component';
import { BoletaComponent } from './boleta/boleta.component';
import { NotFoundComponent } from './not-found/not-found.component';
import { RegistroComponent } from './registro/registro.component';


export const routes: Routes = [{
        path: '',
        component: InicioComponent
    },
    {
        path: 'login',
        component: LoginComponent
    },
 
    {
        path: 'productos',
        component: ProductosComponent
    },
    {
        path: 'carrito',
        component: CarritoComponent
    },
   
    {
        path: 'boleta',
        component: BoletaComponent
    },
    {
        path: 'conocenos',
        component: ConocenosComponent
    },
    {
    path:'registro',
    component:RegistroComponent
    },
  
 
    {
        path: '**', // Ruta 404 - DEBE IR AL FINAL
        component: NotFoundComponent
    }];
