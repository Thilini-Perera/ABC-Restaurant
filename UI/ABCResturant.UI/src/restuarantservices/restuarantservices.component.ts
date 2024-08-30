import { Component } from '@angular/core';
import { Service } from '../models/services';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormGroup, FormBuilder, Validators } from '@angular/forms';
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
import { TableModule } from 'primeng/table';
import { ToastModule } from 'primeng/toast';
import { ServiceService } from '../services/service.service';
import { RestuarantService } from '../services/restuarant-services.service';
import { Restuarant } from '../models/restuarants';
import { UsersService } from '../services/users.service';
import { UseractivityService } from '../services/useractivity.service';
import { UserActivity } from '../models/UserActivity';
import { User } from '../models/user';

@Component({
  selector: 'app-restuarantservices',
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
  templateUrl: './restuarantservices.component.html',
  styleUrl: './restuarantservices.component.css'
})
export class RestuarantservicesComponent {
  services: Service[] = [];
  selectedrestuarant!: Service;
  restaurants: Restuarant[] = [];
  statuses!: any[];
  loading: boolean = false;

  activityValues: number[] = [0, 100];

  searchValue: string | undefined;

  showForm = false;
  formMode: 'create' | 'edit' = 'create';
  formNew: FormGroup;
  formEdit: FormGroup;
  currentRestaurantId: number | null = null;

  currentUser!:User;
  visible: boolean = false;

  constructor(
    private confirmationService: ConfirmationService,
    private messageService: MessageService,
    private RestuarantService: RestuarantService,
    private Service: ServiceService,
    private UsersService: UsersService,
    private UseractivityService: UseractivityService,
    formBuilder: FormBuilder
  ) {
    this.formEdit = formBuilder.group({
      id: [''],
      name: ['', [Validators.required, Validators.minLength(5)]],
      restuarantId: ['', Validators.required],
    });
    this.formNew = formBuilder.group({
      name: ['', [Validators.required, Validators.minLength(5)]],
      restuarantId: ['', Validators.required],
    });

    this.currentUser = this.UsersService.getCurrentUser();
  }

  ngOnInit(): void {
    this.getUsers();
    this.RestuarantService.getRestuarants().subscribe(
      (Restuarnts) => (this.restaurants = Restuarnts)
    );
    this.loading = false;


    const newUserActivity: UserActivity = {
      activity: "Services Dashboard Loaded",
      userId: this.currentUser.id,
    };
    console.log(newUserActivity)
    this.UseractivityService.addUserActivity(newUserActivity).subscribe({
      next: this.handleUpdateActivityResponse.bind(this),
      error: this.handleError.bind(this),
    });
  }

  showDeleteConfirm(id: number) {
    this.visible = true;
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
      activity: "Open Service form in "+mode,
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
        const userData: Service = this.formNew.value;
        this.Service.addService(userData).subscribe({
          next: this.handleUpdateResponse.bind(this),
          error: this.handleError.bind(this),
        });
      }
       else{
        this.markFormGroupTouched(this.formNew);
      }
    } else {
      if (this.formEdit.valid) {
        const userData: Service = this.formEdit.value;
        this.Service.updateService(userData).subscribe({
          next: this.handleUpdateResponse.bind(this),
          error: this.handleError.bind(this),
        });
      }
       else{
        this.markFormGroupTouched(this.formEdit);
      }
    }
  }

  handleUpdateResponse(response: Service): void {
    if (this.formMode === 'create') {
      this.services.push(response);
      this.messageService.add({
        severity: 'info',
        summary: 'Confirmed',
        detail: 'New Service Created',
        life: 3000,
      });

      const newUserActivity: UserActivity = {
        activity: "Posted New Service",
        userId: this.currentUser.id,
      };
       this.UseractivityService.addUserActivity(newUserActivity).subscribe({
      next: this.handleUpdateActivityResponse.bind(this),
      error: this.handleError.bind(this),
    });
    } else {
      const index = this.services.findIndex(
        (r) => r.id === this.currentRestaurantId
      );
      if (index !== -1) {
        this.services[index] = response;
      }
      this.messageService.add({
        severity: 'info',
        summary: 'Confirmed',
        detail: 'Service Updated',
        life: 3000,
      });

      const newUserActivity: UserActivity = {
        activity: "Posted Updated Services",
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
    this.Service.getServices().subscribe(
      (Services) => (this.services = Services)
    );
    console.log(this.services);
  }

  selectrestuarant(restuarant: Service): void {
    this.selectedrestuarant = { ...restuarant };
  }

  deleterestuarant(id: number): void {
    this.Service.deleteService(id).subscribe(() =>
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
          detail: 'Service Deleted',
          life: 3000,
        });

        const newUserActivity: UserActivity = {
          activity: "Service Deleted",
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
  handleUpdateActivityResponse(response:any):void{}

  private markFormGroupTouched(formGroup: FormGroup) {
    Object.keys(formGroup.controls).forEach(field => {
      const control = formGroup.get(field);
      control!.markAsTouched({ onlySelf: true });
    });
  }
}
