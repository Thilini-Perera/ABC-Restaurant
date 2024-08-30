import { CookieService } from 'ngx-cookie-service';
import { Component } from '@angular/core';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import {MatDividerModule} from '@angular/material/divider';
import {MatButtonModule} from '@angular/material/button';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MessageService } from 'primeng/api';
import { UsersService } from '../services/users.service';
import { User } from '../models/user';
import { ToastModule } from 'primeng/toast';
import { Router } from '@angular/router';

interface LoginModel{
  email:string,
  password:string
}

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [MatFormFieldModule, MatInputModule, MatIconModule,MatButtonModule, MatDividerModule,ReactiveFormsModule,ToastModule],
  providers: [MessageService],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})

export class LoginComponent {
  formNew: FormGroup;

  constructor(private UsersService: UsersService,private messageService: MessageService,formBuilder: FormBuilder, private router: Router, private cookieService: CookieService){
    this.formNew = formBuilder.group({
      email: ['', Validators.required],
      password: ['', Validators.required],
    });
  }

  onSubmit(data:any): void {
    if (this.formNew.valid) {
      const loginData:LoginModel = this.formNew.value;
      this.UsersService.login(loginData).subscribe({
        next: this.handleUpdateResponse.bind(this),
        error: this.handleError.bind(this),
      });
    }
    else{
      this.messageService.add({
        severity: 'error',
        summary: 'Rejected',
        detail: "Your didn't fill the form",
        life: 3000,
      });
    }
  }


  handleUpdateResponse(response: any): void {
    this.UsersService.setResponse = response;
    console.log(response.statusCode)
    if (response.statusCode === 200) {
      console.log(response.data.name)
      const userName : string  = response.data.name.toString();
      sessionStorage.setItem('currentUser', JSON.stringify(response.data));
      this.cookieService.set('currentUser', JSON.stringify(response.data));

      if(response.data.role=== "Admin"){
        this.router.navigate(['users']);
      }
      if(response.data.role=== "Staff"){
        this.router.navigate(['reservations']);
      }
      if(response.data.role=== "Customer"){
        this.router.navigate(['']);
      }
    } else {
      alert(response.Message);
    }
    this.messageService.add({
      severity: 'success',
      summary: 'Success',
      detail: 'Welcome '+response.data.name,
      life: 3000,
    });
  }

  handleError(error: any): void {
    console.error('Error handling user:', error);
    this.messageService.add({
      severity: 'error',
      summary: 'Rejected',
      detail: 'Wrong User name or Password',
      life: 3000,
    });
    // Handle the error appropriately in your application
  }

}
