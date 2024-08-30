import { UseractivityService } from './../services/useractivity.service';
import { CommonModule } from '@angular/common';
import { Component, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatDividerModule } from '@angular/material/divider';
import { MatIconModule } from '@angular/material/icon';
import { ConfirmationService, MessageService } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { DialogModule } from 'primeng/dialog';
import { InputTextModule } from 'primeng/inputtext';
import { ProgressBarModule } from 'primeng/progressbar';
import { SlideMenuModule } from 'primeng/slidemenu';
import { Table, TableModule } from 'primeng/table';
import { ToastModule } from 'primeng/toast';
import { User } from '../models/user';
import { UsersService } from './../services/users.service';
import { UserActivity } from '../models/UserActivity';

@Component({
  selector: 'app-users',
  standalone: true,
  imports: [
    TableModule,
    SlideMenuModule,
    ProgressBarModule,
    MatIconModule,
    ReactiveFormsModule,
    MatButtonModule,
    InputTextModule,
    ButtonModule,
    CommonModule,
    DialogModule,
    ConfirmDialogModule,
    ToastModule,
    MatDividerModule,
  ],
  providers: [ConfirmationService, MessageService],
  templateUrl: './users.component.html',
  styleUrl: './users.component.css',
})
export class UsersComponent {
  users: User[] = [];
  selectedrestuarant!: any;

  statuses!: any[];
  loading: boolean = false;

  activityValues: number[] = [0, 100];

  searchValue: string | undefined;
  showDetail = false;
  showForm = false;
  formMode: 'create' | 'edit' = 'create';
  formNew: FormGroup;
  formEdit: FormGroup;
  currentRestaurantId: number | null = null;
  @ViewChild('dt1') dataTable : Table| any;
  visible: boolean = false;

  currentUser!:User;

  constructor(
    private confirmationService: ConfirmationService,
    private messageService: MessageService,
    private UsersService: UsersService,
    private UseractivityService: UseractivityService,
    formBuilder: FormBuilder
  ) {
    this.formEdit = formBuilder.group({
      id: [''],
      name: ['',[ Validators.required, Validators.minLength(5)]],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      role: ['', Validators.required],
      telephone: ['', [Validators.required,  Validators.pattern('^[0-9]{10}$')]],
    });
    this.formNew = formBuilder.group({
      name: ['',[ Validators.required, Validators.minLength(5)]],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      role: ['', Validators.required],
      telephone: ['', [Validators.required,  Validators.pattern('^[0-9]{10}$')]],
    });
      this.currentUser = this.UsersService.getCurrentUser();
  }

  ngOnInit(): void {
    this.getUsers();
    this.loading = false;
    const newUserActivity: UserActivity = {
      activity: "User Dashboard Loaded",
      userId: this.currentUser.id,
    };

    this.UseractivityService.addUserActivity(newUserActivity).subscribe({
      next: this.handleUpdateActivityResponse.bind(this),
      error: this.handleError.bind(this),
    });
  }

  showDeleteConfirm(id: number) {
    this.visible = true;
  }
  SetfilterGlobal($event: any) {
    const input = $event.target.value;
    this.dataTable?.filterGlobal(input,'contains');
    }

  openForm(mode: 'create' | 'edit', user?: any): void {
    this.formMode = mode;
    if (mode === 'edit' && user) {
      this.formEdit.patchValue(user);
    } else {
      this.formEdit.reset();
      this.formNew.reset();
    }
    this.showForm = true;

    const newUserActivity: UserActivity = {
      activity: "Open User form in "+mode,
      userId: this.currentUser.id,
    };
     this.UseractivityService.addUserActivity(newUserActivity).subscribe({
      next: this.handleUpdateActivityResponse.bind(this),
      error: this.handleError.bind(this),
    });
  }

  closeForm(): void {
    this.showForm = false;
  }

  onSubmit(): void {
    if (this.formMode === 'create') {
      if (this.formNew.valid) {
        const userData: User = this.formNew.value;
        this.UsersService.addUser(userData).subscribe({
          next: this.handleUpdateResponse.bind(this),
          error: this.handleError.bind(this),
        });
      }
      else{
        this.markFormGroupTouched(this.formNew);
      }
    } else {
      if (this.formEdit.valid) {
        const userData: User = this.formEdit.value;
        this.UsersService.updateUser(userData).subscribe({
          next: this.handleUpdateResponse.bind(this),
          error: this.handleError.bind(this),
        });
      }else{
        this.markFormGroupTouched(this.formEdit);
      }
    }

  }

  handleUpdateResponse(response: User): void {
    if (this.formMode === 'create') {
      this.users.push(response);
      this.messageService.add({
        severity: 'info',
        summary: 'Confirmed',
        detail: 'New User Created',
        life: 3000,
      });

      const newUserActivity: UserActivity = {
        activity: "Posted New User",
        userId: this.currentUser.id,
      };
       this.UseractivityService.addUserActivity(newUserActivity).subscribe({
      next: this.handleUpdateActivityResponse.bind(this),
      error: this.handleError.bind(this),
    });
    } else {
      const index = this.users.findIndex(
        (r) => r.id === this.currentRestaurantId
      );
      if (index !== -1) {
        this.users[index] = response;
      }
      this.messageService.add({
        severity: 'info',
        summary: 'Confirmed',
        detail: 'User Updated',
        life: 3000,
      });

      const newUserActivity: UserActivity = {
        activity: "Posted Updated User",
        userId: this.currentUser.id,
      };
       this.UseractivityService.addUserActivity(newUserActivity).subscribe({
      next: this.handleUpdateActivityResponse.bind(this),
      error: this.handleError.bind(this),
    });
    }
    this.getUsers();
    this.closeForm();
  }

  handleError(error: any): void {
    console.error('Error handling user:', error);
    this.messageService.add({
      severity: 'error',
      summary: 'Rejected',
      detail: 'Techincal Error Occured',
      life: 3000,
    });
    // Handle the error appropriately in your application
  }

  getUsers(): void {
    this.UsersService.getUsers().subscribe(
      (Users) => (this.users = Users)
    );
    console.log(this.users);
  }

  selectrestuarant(restuarant: User): void {
    this.selectedrestuarant = { ...restuarant };
  }

  ShowDetails(id: number): void {
    this.UsersService.getUser(id).subscribe(
      (User) => (this.selectedrestuarant = User.data)
    );
    this.showDetail=true;
  }

  deleterestuarant(id: number): void {
    this.UsersService.deleteUser(id).subscribe(() =>
      this.getUsers()
    );
  }

  deleteConfirm(id: number) {
    this.confirmationService.confirm({
      header: 'Are you sure?',
      message: 'Please confirm to proceed.',
      accept: () => {
        this.deleterestuarant(id);
        this.messageService.add({
          severity: 'info',
          summary: 'Confirmed',
          detail: 'User Deleted',
          life: 3000,
        });

        const newUserActivity: UserActivity = {
          activity: "User Deleted",
          userId: this.currentUser.id,
        };
         this.UseractivityService.addUserActivity(newUserActivity).subscribe({
        next: this.handleUpdateActivityResponse.bind(this),
        error: this.handleError.bind(this),
      });
      },
      reject: () => {
        this.messageService.add({
          severity: 'error',
          summary: 'Rejected',
          detail: 'Deletion Cancelled',
          life: 3000,
        });
      },
    });
  }

  GetUserActivityReport(user?: User) {
    if (user) {
      this.UseractivityService.getPDFbyUserActivity(user.id!).subscribe(
        (response: Blob) => {
          const blob = new Blob([response], { type: 'application/pdf' });
          const url = window.URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = `report-${user.id}.pdf`;
          a.click();
          window.URL.revokeObjectURL(url);

          const newUserActivity: UserActivity = {
            activity: "Restuarant Profit Report taken",
            userId: this.UsersService.getCurrentUser().id,
          };
           this.UseractivityService.addUserActivity(newUserActivity).subscribe({
      next: this.handleUpdateActivityResponse.bind(this),
      error: this.handleError.bind(this),
    });
        },
        (error) => {
          console.error('Error downloading the report', error);
        }
      );
    }
  }
  handleUpdateActivityResponse(response:any):void{}
  private markFormGroupTouched(formGroup: FormGroup) {
    Object.keys(formGroup.controls).forEach(field => {
      const control = formGroup.get(field);
      control!.markAsTouched({ onlySelf: true });
    });
  }
}
