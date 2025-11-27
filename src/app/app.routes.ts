import { Routes } from '@angular/router';
import { InicioComponent } from './inicio/inicio.component';
import { ConocenosComponent } from './conocenos/conocenos.component';

import { PerfilComponent } from './perfil/perfil.component';
import { ProductosComponent } from './productos/productos.component';
import { LoginComponent } from './login/login.component';
import { RegistroComponent } from './registro/registro.component';
import { CarritoComponent } from './carrito/carrito.component';
import { BoletaComponent } from './boleta/boleta.component';
import { NotFoundComponent } from './not-found/not-found.component';
import { HistorialVentasComponent } from './historial-ventas/historial-ventas.component';

export const routes: Routes = [
    {
        path: '',
        component: InicioComponent
    },
    {
        path: 'login',
        component: LoginComponent
    },
    {
        path: 'registro',
        component: RegistroComponent
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
        path: 'historial-ventas', 
        component: HistorialVentasComponent
    },
    {   
        path: 'perfil', 
        component: PerfilComponent 
    },
    {
        path: 'conocenos',
        component: ConocenosComponent
    },
    
 
    {
        path: '**', // Ruta 404 
        component: NotFoundComponent
    }
];