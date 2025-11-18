import { Component } from '@angular/core';
import { ReactiveFormsModule,FormControl,FormGroup } from '@angular/forms';
@Component({
  selector: 'app-contactanos',
  imports: [ReactiveFormsModule],
  templateUrl: './contactanos.component.html',
  styleUrl: './contactanos.component.css'
})
export class ContactanosComponent {
userForm= new FormGroup({
  nombre:new FormControl(''),
  apellido: new FormControl (''),
  direccion: new FormGroup({
    distrito:new FormControl(''),
    provincia: new FormControl,
    }),
  });
  guardar(){
    console.log(this.userForm.value);
  }
}
