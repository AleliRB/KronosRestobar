import { Routes } from '@angular/router';
import { InicioComponent } from './inicio/inicio.component';
import { ConocenosComponent } from './conocenos/conocenos.component';
import { ContactanosComponent } from './contactanos/contactanos.component';

import { ProductosComponent } from './productos/productos.component';
import { LoginComponent } from './login/login.component';
import { RegistroComponent } from './registro/registro.component';
import { CarritoComponent } from './carrito/carrito.component';
import { BoletaComponent } from './boleta/boleta.component';
import { NotFoundComponent } from './not-found/not-found.component';

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
        path: 'conocenos',
        component: ConocenosComponent
    },
    {
        path: 'contactanos',
        component: ContactanosComponent
    },
 
    {
        path: '**', // Ruta 404 - DEBE IR AL FINAL
        component: NotFoundComponent
    }
];