import { Component } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatDividerModule } from '@angular/material/divider';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { UsersService } from '../services/users.service';
import { User } from '../models/user';
import { MessageService } from 'primeng/api';
import { CommonModule, NgOptimizedImage } from '@angular/common';
import { ToastModule } from 'primeng/toast';
import { Router } from '@angular/router';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [MatFormFieldModule, MatInputModule, MatIconModule,MatButtonModule, MatDividerModule,ReactiveFormsModule,ToastModule,CommonModule],
  providers: [MessageService],
  templateUrl: './register.component.html',
  styleUrl: './register.component.css'
})
export class RegisterComponent {
  formNew: FormGroup;

  hascreated:boolean = false;

  constructor(private UsersService: UsersService,private messageService: MessageService, private router: Router,formBuilder: FormBuilder){
    this.formNew = formBuilder.group({
      name: ['', [ Validators.required, Validators.minLength(5)]],
      email: ['', [Validators.required, Validators.email]],
      telephone: ['', [Validators.required,  Validators.pattern('^[0-9]{10}$')]],
      password: ['', [Validators.required, Validators.minLength(6)]],
    });
  }

  onSubmit(): void {
    if (this.formNew.valid) {
      const userData: User = this.formNew.value;
      this.UsersService.registerUser(userData).subscribe({
        next: this.handleUpdateResponse.bind(this),
        error: this.handleError.bind(this),
      });
    }
  }

  handleUpdateResponse(response: User): void {
    this.messageService.add({
      severity: 'info',
      summary: 'Confirmed',
      detail: 'You have created an account',
      life: 3000,
    });
    const userData: User = this.formNew.value;
    this.UsersService.login(userData).subscribe({
      next: this.handleCompletetion.bind(this),
      error: this.handleError.bind(this),
    });
  }

  handleCompletetion(response: any): void {
    this.UsersService.setResponse = response;
    console.log(response.statusCode)
    if (response.statusCode === 200) {
      console.log(response.data.name)
      const userName : string  = response.data.name.toString();
      sessionStorage.setItem('currentUser', JSON.stringify(response.data));
      if(response.data.role=== "Customer"){
        this.router.navigate(['']);
      }
    } else {
      alert(response.Message);
    }
   }


  handleError(error: any): void {
    console.error('Error handling user:', error);
    this.messageService.add({
      severity: 'error',
      summary: 'Rejected',
      detail: 'Techincal Error Occured',
      life: 3000,
    });
    this.hascreated = true;
    // Handle the error appropriately in your application
  }

}
