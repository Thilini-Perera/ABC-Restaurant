import { CommonModule, DatePipe } from '@angular/common';
import { Component } from '@angular/core';
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
import { TableModule } from 'primeng/table';
import { ToastModule } from 'primeng/toast';
import { Reservation, ReservationType } from '../models/Reservation';
import { UsersService } from '../services/users.service';
import { RestuarantService } from '../services/restuarant-services.service';
import { ReservationService } from '../services/reservation.service';
import { Restuarant } from '../models/restuarants';
import { User } from '../models/user';
import { CalendarModule } from 'primeng/calendar';
import { PaymentService } from '../services/payment.service';
import { Payment } from '../models/Payment';
import { UseractivityService } from '../services/useractivity.service';
import { UserActivity } from '../models/UserActivity';
import { MatCheckboxModule } from '@angular/material/checkbox';

@Component({
  selector: 'app-reservationdashboard',
  standalone: true,
  imports: [
    TableModule,
    SlideMenuModule,
    ProgressBarModule,
    MatIconModule,
    ReactiveFormsModule,
    MatButtonModule,
    MatCheckboxModule,
    InputTextModule,
    ButtonModule,
    CommonModule,
    DialogModule,
    ConfirmDialogModule,
    ToastModule,
    MatDividerModule,
    CalendarModule,
  ],
  providers: [ConfirmationService, MessageService, DatePipe],
  templateUrl: './reservationdashboard.component.html',
  styleUrl: './reservationdashboard.component.css',
})
export class ReservationdashboardComponent {
  reservations: Reservation[] = [];
  restaurants: Restuarant[] = [];
  users: User[] = [];
  selectedrestuarant!: any;
  minDate = new Date();
  statuses!: any[];
  loading: boolean = false;
  totalPay!: number;
  OldtotalPay!: number;
  activityValues: number[] = [0, 100];

  searchValue: string | undefined;

  showForm = false;
  showDetail = false;
  shouldAllowReservation = true;
  formMode: 'create' | 'edit' = 'create';
  formNew: FormGroup;
  formEdit: FormGroup;
  currentRestaurantId: number | null = null;
  currentUser!: User;

  visible: boolean = false;
  eReservationType = ReservationType;
  selectedType: ReservationType | null = null;
  private _reservationTypes = Object.keys(ReservationType);
  public get reservationTypes(): Array<string> {
    return this._reservationTypes.slice(this._reservationTypes.length / 2);
  }

  constructor(
    private confirmationService: ConfirmationService,
    private messageService: MessageService,
    private UsersService: UsersService,
    private PaymentService: PaymentService,
    private RestuarantService: RestuarantService,
    private ReservationService: ReservationService,
    private UseractivityService: UseractivityService,
    private datePipe: DatePipe,
    formBuilder: FormBuilder
  ) {
    this.formEdit = formBuilder.group({
      id: [''],
      name: ['', [Validators.required, Validators.minLength(5)]],
      numberOfPeople: ['', Validators.required],
      reservationOn: ['', Validators.required],
    });
    this.formNew = formBuilder.group({
      name: ['', [Validators.required, Validators.minLength(5)]],
      numberOfPeople: ['', Validators.required],
      reservationOn: ['', Validators.required],
      reservationType: [null, Validators.required],
      userId: ['', Validators.required],
      restuarantId: ['', Validators.required],
    });
    this.totalPay = 0;
    this.currentUser = this.UsersService.getCurrentUser();
  }

  ngOnInit(): void {
    this.getReservations();
    this.RestuarantService.getRestuarants().subscribe(
      (Restuarnts) => (this.restaurants = Restuarnts)
    );
    this.getUsers();
    this.loading = false;

    const newUserActivity: UserActivity = {
      activity: 'Reservation Dashboard Loaded',
      userId: this.currentUser.id,
    };

    this.UseractivityService.addUserActivity(newUserActivity).subscribe({
      next: this.handleUpdateActivityResponse.bind(this),
      error: this.handleError.bind(this),
    });
  }

  private getReservations() {
    this.ReservationService.getReservations().subscribe({
      next: this.handleGetResponse.bind(this),
      error: this.handleError.bind(this),
    });
  }

  showDeleteConfirm(id: number) {
    this.visible = true;
  }

  openForm(mode: 'create' | 'edit', reservation?: any): void {
    this.formMode = mode;
    if (mode === 'edit' && reservation) {
      const dateStr = reservation.reservationOn;
      const dateObj = new Date(dateStr);
      console.log(dateObj);
      this.formEdit.patchValue({
        id: reservation.id,
        name: reservation.name,
        numberOfPeople: reservation.numberOfPeople,
        reservationOn: dateObj,
      });

      const inputValueControl = this.formEdit.get('numberOfPeople');
      console.log(reservation.reservationType.toString());
      if (reservation.reservationType === ReservationType.DELIVERY) {
        inputValueControl?.clearValidators();
      } else {
        inputValueControl?.setValidators(Validators.required);
      }
      inputValueControl?.updateValueAndValidity();
    } else {
      this.formEdit.reset();
      this.formNew.reset();
    }
    this.showForm = true;

    const newUserActivity: UserActivity = {
      activity: 'Open Reservation form in ' + mode,
      userId: this.currentUser.id,
    };
    this.UseractivityService.addUserActivity(newUserActivity).subscribe({
      next: this.handleUpdateActivityResponse.bind(this),
      error: this.handleError.bind(this),
    });
  }

  updateselection(value: any) {
    this.selectedType = value.target.value;
    this.updateValidation(value.target.value);
  }

  CheckAvailabilty(value: any) {
    this.ReservationService.checkReservation(value.target.value).subscribe(
      (result: boolean) => {
        this.shouldAllowReservation = result;
      }
    );
  }

  updateValidation(selectedType: ReservationType): void {
    const inputValueControl = this.formNew.get('numberOfPeople');
    if (selectedType.toString() === 'DELIVERY') {
      inputValueControl?.clearValidators();
      this.totalPay = 1000;
    } else {
      inputValueControl?.setValidators(Validators.required);
    }
    inputValueControl?.updateValueAndValidity();
  }
  closeForm(): void {
    this.showForm = false;
  }

  updatePrice(value: any) {
    const numberofPeople = value.target.value;
    this.totalPay = 1000 * numberofPeople;
  }

  onSubmit(): void {
    if (this.formMode === 'create') {
      if (this.formNew.valid) {
        this.shouldAllowReservation=true;
        const formData = this.formNew.value;
        const dateStr = formData.reservationOn;
        const dateObj = new Date(dateStr);
        const isoDateStr = dateObj.toISOString();
        formData.reservationOn = isoDateStr;
        switch (this.selectedType?.toString()) {
          case 'DELIVERY':
            console.log(this.selectedType);
            formData.reservationType = 2;
            break;
          case 'DINEIN':
            console.log(this.selectedType);
            formData.reservationType = 1;
            break;

          default:
            formData.reservationType = 0;
            break;
        }
        const data: FormData = formData;
        console.log(data);
        this.ReservationService.makeReservation(data).subscribe({
          next: this.handleUpdateResponse.bind(this),
          error: this.handleError.bind(this),
        });

        const paymentformData = new FormData();
        // Append properties to FormData
        paymentformData.append('total', this.totalPay.toString());
        paymentformData.append(
          'restuarantId',
          formData.restuarantId.toString()
        );
        paymentformData.append('userId', formData.userId.toString());

        this.PaymentService.makepayment(paymentformData).subscribe({
          next: this.handleUpdateResponse.bind(this),
          error: this.handleError.bind(this),
        });
      } else {
        this.markFormGroupTouched(this.formNew);
        console.log(this.formNew.errors);
      }
    } else {
      if (this.formEdit.valid) {
        this.shouldAllowReservation=true;
        const formData = this.formEdit.value;
        const dateStr = formData.reservationOn;
        const dateObj = new Date(dateStr);
        const isoDateStr = dateObj.toISOString();
        formData.reservationOn = isoDateStr;
        const data: FormData = formData;
        this.ReservationService.updateReservation(data).subscribe({
          next: this.handleUpdateResponse.bind(this),
          error: this.handleError.bind(this),
        });
      } else {
        this.markFormGroupTouched(this.formEdit);
      }
    }
  }

  handleUpdateResponse(response: any): void {
    if (this.formMode === 'create') {
      this.reservations.push(response);
      this.messageService.add({
        severity: 'info',
        summary: 'Confirmed',
        detail: 'New Reservation Created',
        life: 3000,
      });

      const newUserActivity: UserActivity = {
        activity: 'Posted New Reservation',
        userId: this.currentUser.id,
      };
      this.UseractivityService.addUserActivity(newUserActivity).subscribe({
        next: this.handleUpdateActivityResponse.bind(this),
        error: this.handleError.bind(this),
      });
    } else {
      const index = this.reservations.findIndex(
        (r) => r.id === this.currentRestaurantId
      );
      if (index !== -1) {
        this.reservations[index] = response;
      }
      this.messageService.add({
        severity: 'info',
        summary: 'Confirmed',
        detail: 'Reservation Updated',
        life: 3000,
      });

      const newUserActivity: UserActivity = {
        activity: 'Posted Updated Reservation',
        userId: this.currentUser.id,
      };
      this.UseractivityService.addUserActivity(newUserActivity).subscribe({
        next: this.handleUpdateActivityResponse.bind(this),
        error: this.handleError.bind(this),
      });
    }
    this.getReservations();
    this.closeForm();
  }

  handleGetResponse(response: any): void {
    console.log(response);
    this.reservations = response.data;
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
    this.UsersService.getUsers().subscribe((Users) => (this.users = Users));
  }

  selectrestuarant(restuarant: Reservation): void {
    this.selectedrestuarant = { ...restuarant };
  }

  deleterestuarant(id: number): void {
    this.ReservationService.deleteReservation(id).subscribe(() =>
      this.getReservations()
    );

    this.shouldAllowReservation=true;
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
          detail: 'Reservation Deleted',
          life: 3000,
        });

        const newUserActivity: UserActivity = {
          activity: 'Reservation Deleted',
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

  ApproveReservation(reservationId: number) {
    this.ReservationService.approveReservation(reservationId).subscribe({
      next: this.handleApprovalResponse.bind(this),
      error: this.handleError.bind(this),
    });
  }

  GetFullReport() {
    this.ReservationService.getFullReport().subscribe(
      (response: Blob) => {
        const blob = new Blob([response], { type: 'application/pdf' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `report.pdf`;
        a.click();
        window.URL.revokeObjectURL(url);
      },
      (error) => {
        console.error('Error downloading the report', error);
      }
    );

    const newUserActivity: UserActivity = {
      activity: 'Reservation Full Report Taken',
      userId: this.currentUser.id,
    };
    this.UseractivityService.addUserActivity(newUserActivity).subscribe({
      next: this.handleUpdateActivityResponse.bind(this),
      error: this.handleError.bind(this),
    });
  }

  ShowDetails(id: number): void {
    this.ReservationService.getReservation(id).subscribe(
      (Reservation) => (this.selectedrestuarant = Reservation.data)
    );
    this.showDetail = true;
  }

  handleUpdateActivityResponse(response: any): void {}
  handleApprovalResponse(response: any): void {
    this.messageService.add({
      severity: 'info',
      summary: 'Approved',
      detail: 'Reservation Approved',
      life: 3000,
    });
    this.getReservations();
  }

  private markFormGroupTouched(formGroup: FormGroup) {
    Object.keys(formGroup.controls).forEach((field) => {
      const control = formGroup.get(field);
      control!.markAsTouched({ onlySelf: true });
    });
  }
}
