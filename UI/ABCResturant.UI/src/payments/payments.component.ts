import { RestuarantService } from './../services/restuarant-services.service';
import { UsersService } from './../services/users.service';
import { CommonModule } from '@angular/common';
import { Component, ViewChild } from '@angular/core';
import {
  ReactiveFormsModule,
  FormGroup,
  FormBuilder,
  Validators,
} from '@angular/forms';
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
import { Payment } from '../models/Payment';
import { PaymentService } from '../services/payment.service';
import { User } from '../models/user';
import { Restuarant } from '../models/restuarants';
import { UseractivityService } from '../services/useractivity.service';
import { UserActivity } from '../models/UserActivity';

@Component({
  selector: 'app-payments',
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
  templateUrl: './payments.component.html',
  styleUrl: './payments.component.css',
})
export class PaymentsComponent {
  payments: Payment[] = [];
  users: User[] = [];
  restuarants: Restuarant[] = [];
  selectedPayment!: any;

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

  @ViewChild('dt1') dataTable: Table | any;
  visible: boolean = false;
  currentUser!: User;

  constructor(
    private confirmationService: ConfirmationService,
    private messageService: MessageService,
    private PaymentService: PaymentService,
    private UsersService: UsersService,
    private UseractivityService: UseractivityService,
    private RestuarantService: RestuarantService,
    formBuilder: FormBuilder
  ) {
    this.formEdit = formBuilder.group({
      id: [''],
      total: ['', Validators.required],
      userId: ['', Validators.required],
      restuarantId: ['', Validators.required],
    });
    this.formNew = formBuilder.group({
      total: ['', Validators.required],
      userId: ['', Validators.required],
      restuarantId: ['', Validators.required],
    });

    this.currentUser = this.UsersService.getCurrentUser();
  }

  ngOnInit(): void {
    this.getPayments();
    this.loading = false;

    this.UsersService.getUsersByRole('Customer').subscribe(
      (Users) => (this.users = Users)
    );
    this.RestuarantService.getRestuarants().subscribe(
      (Restuarants) => (this.restuarants = Restuarants)
    );

    const newUserActivity: UserActivity = {
      activity: 'Payment Dashboard Loaded',
      userId: this.currentUser.id,
    };
    console.log(newUserActivity);
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
    this.dataTable?.filterGlobal(input, 'contains');
  }
  ShowDetails(id: number): void {
    this.PaymentService.getPayment(id).subscribe(
      (Payment) => (this.selectedPayment = Payment.data)
    );
    this.showDetail = true;
  }
  openForm(mode: 'create' | 'edit', user?: any): void {
    console.log(user);
    this.formMode = mode;
    if (mode === 'edit' && user) {
      this.formEdit.patchValue(user);
      // this.formEdit.patchValue({ name: 'Fetched User Name', email: 'fetched@example.com' });
      console.log(this.formEdit.value);
    } else {
      this.formEdit.reset();
      this.formNew.reset();
    }
    this.showForm = true;

    const newUserActivity: UserActivity = {
      activity: 'Open Payment form in ' + mode,
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
        const userData: Payment = this.formNew.value;
        console.log(userData);
        this.PaymentService.addPayment(userData).subscribe({
          next: this.handleUpdateResponse.bind(this),
          error: this.handleError.bind(this),
        });
      } else {
        this.markFormGroupTouched(this.formNew);
      }
    } else {
      if (this.formEdit.valid) {
        const userData: Payment = this.formEdit.value;
        this.PaymentService.updatePayment(userData).subscribe({
          next: this.handleUpdateResponse.bind(this),
          error: this.handleError.bind(this),
        });
      } else {
        this.markFormGroupTouched(this.formEdit);
      }
    }
  }

  handleUpdateResponse(response: Payment): void {
    if (this.formMode === 'create') {
      this.payments.push(response);
      this.messageService.add({
        severity: 'info',
        summary: 'Confirmed',
        detail: 'New Payment Created',
        life: 3000,
      });

      const newUserActivity: UserActivity = {
        activity: 'Posted New Payment',
        userId: this.currentUser.id,
      };
      this.UseractivityService.addUserActivity(newUserActivity).subscribe({
        next: this.handleUpdateActivityResponse.bind(this),
        error: this.handleError.bind(this),
      });
    } else {
      const index = this.payments.findIndex(
        (r) => r.id === this.currentRestaurantId
      );
      if (index !== -1) {
        this.payments[index] = response;
      }
      this.messageService.add({
        severity: 'info',
        summary: 'Confirmed',
        detail: 'Payment Updated',
        life: 3000,
      });

      const newUserActivity: UserActivity = {
        activity: 'Posted Updated Payment',
        userId: this.currentUser.id,
      };
      this.UseractivityService.addUserActivity(newUserActivity).subscribe({
        next: this.handleUpdateActivityResponse.bind(this),
        error: this.handleError.bind(this),
      });
    }
    this.getPayments();
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

  getPayments(): void {
    this.PaymentService.getPayments().subscribe(
      (Payments) => (this.payments = Payments)
    );
    console.log(this.payments);
  }
  deleterestuarant(id: number): void {
    this.PaymentService.deletePayment(id).subscribe(() => this.getPayments());
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
          detail: 'Payment Deleted',
          life: 3000,
        });

        const newUserActivity: UserActivity = {
          activity: 'Payment Deleted',
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
  handleUpdateActivityResponse(response: any): void {}

  private markFormGroupTouched(formGroup: FormGroup) {
    Object.keys(formGroup.controls).forEach((field) => {
      const control = formGroup.get(field);
      control!.markAsTouched({ onlySelf: true });
    });
  }
}
