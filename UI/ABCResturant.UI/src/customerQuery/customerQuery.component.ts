import { ChangeDetectionStrategy, Component } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatDividerModule } from '@angular/material/divider';
import { MatIconModule } from '@angular/material/icon';
import { MessageService } from 'primeng/api';
import { ToastModule } from 'primeng/toast';
import { QueryService } from '../services/query.service';
import { UsersService } from '../services/users.service';
import { User } from '../models/user';
import { ChatRoom } from '../models/Query';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { CommonModule } from '@angular/common';
import { UseractivityService } from '../services/useractivity.service';
import { UserActivity } from '../models/UserActivity';

@Component({
  selector: 'app-customer-query',
  standalone: true,
  imports: [
    ReactiveFormsModule,ToastModule,MatFormFieldModule, MatInputModule, MatIconModule,MatButtonModule, MatDividerModule,CommonModule],
  providers: [MessageService],
  templateUrl: './customerQuery.component.html',
  styleUrl: './customerQuery.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CustomerQueryComponent {
  formNew: FormGroup;
  showForm = false;
  ChatRooms: ChatRoom[] = [];
  selectedChatRoom!: ChatRoom;
  currentUser!:User;

  constructor(private UsersService: UsersService,
    private QueryService: QueryService,
    private messageService: MessageService,
    private UseractivityService: UseractivityService,
    formBuilder: FormBuilder){
    this.formNew = formBuilder.group({
      response: ['', Validators.required],
      userId: [''],
    });

    this.currentUser = this.UsersService.getCurrentUser();
  }

  onSubmit(): void {
    if (this.formNew.valid) {
      const userData = this.formNew.value;
      userData.userId = this.UsersService.getCurrentUser().id;
      userData.id = 0;
      console.log(userData)
      this.QueryService.addQuery(userData).subscribe({
        next: this.handleUpdateResponse.bind(this),
        error: this.handleError.bind(this),
      });
    }
    else{
      this.markFormGroupTouched(this.formNew);
    }
  }


  handleUpdateResponse(response: User): void {
    this.messageService.add({
      severity: 'info',
      summary: 'Confirmed',
      detail: 'Message sent successfully',
      life: 3000,
    });

    const newUserActivity: UserActivity = {
      activity: "Posted New Query",
      userId: this.currentUser.id,
    };
     this.UseractivityService.addUserActivity(newUserActivity).subscribe({
    next: this.handleUpdateActivityResponse.bind(this),
    error: this.handleError.bind(this),
  });
  }

  handleError(error: any): void {
    console.error('Error handling user:', error);
    this.messageService.add({
      severity: 'error',
      summary: 'Rejected',
      detail: 'Techincal Error Occured',
      life: 3000,
    });
  }
  handleUpdateActivityResponse(response:any):void{}
  private markFormGroupTouched(formGroup: FormGroup) {
    Object.keys(formGroup.controls).forEach(field => {
      const control = formGroup.get(field);
      control!.markAsTouched({ onlySelf: true });
    });
  }
 }
