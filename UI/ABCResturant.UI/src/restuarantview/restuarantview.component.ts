import { ReservationService } from './../services/reservation.service';
import { RestuarantService } from './../services/restuarant-services.service';
import { Component, inject, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Restuarant } from '../models/restuarants';
import { CommonModule, NgOptimizedImage } from '@angular/common';
import { GalleriaModule } from 'primeng/galleria';
import { DialogModule } from 'primeng/dialog';
import {
  FormGroup,
  FormBuilder,
  Validators,
  ReactiveFormsModule,
  FormsModule,
} from '@angular/forms';
import { ConfirmationService, MessageService } from 'primeng/api';
import { Reservation, ReservationType } from '../models/Reservation';
import { UsersService } from '../services/users.service';
import { MatButtonModule } from '@angular/material/button';
import { CalendarModule } from 'primeng/calendar';
import { ToastModule } from 'primeng/toast';
import { MatOption } from '@angular/material/core';
import { PaymentService } from '../services/payment.service';
import { Payment } from '../models/Payment';
import { OfferNPromotionService } from '../services/offer-npromotion.service';
import { ServiceService } from '../services/service.service';
import { Service } from '../models/services';
import { UseractivityService } from '../services/useractivity.service';
import { UserActivity } from '../models/UserActivity';

@Component({
  selector: 'app-restuarantview',
  standalone: true,
  imports: [
    DialogModule,
    CommonModule,
    NgOptimizedImage,
    GalleriaModule,
    ReactiveFormsModule,
    MatButtonModule,
    CalendarModule,
    ToastModule,
    MatOption,
    FormsModule
  ],
  providers: [ConfirmationService, MessageService],
  templateUrl: './restuarantview.component.html',
  styleUrl: './restuarantview.component.css',
})
export class RestuarantviewComponent implements OnInit {
  id!: number;
  restuarant!: Restuarant;
  services : Service[] = [];
  eReservationType = ReservationType;
  selectedType: ReservationType | null = null;
  showForm = false;
  dummyPicture = 'https://via.placeholder.com/800x400?text=No+Image+Available';
  formNew: FormGroup;
  minDate = new Date();
  showNumbers = false;
  totalPay!: number;
  OldtotalPay!: number;
  totalDiscount!: number;
  searchQuery: string = '';

  shouldAllowReservation = true;

  responsiveOptions: any[] = [
    {
      breakpoint: '1024px',
      numVisible: 5,
    },
    {
      breakpoint: '768px',
      numVisible: 3,
    },
    {
      breakpoint: '560px',
      numVisible: 1,
    },
  ];

  constructor(
    private RestuarantService: RestuarantService,
    private ReservationService: ReservationService,
    private ServiceService: ServiceService,
    private confirmationService: ConfirmationService,
    private PaymentService: PaymentService,
    private userService: UsersService,
    private messageService: MessageService,
    private OfferNPromotionService: OfferNPromotionService,
    private UseractivityService: UseractivityService,
    formBuilder: FormBuilder
  ) {
    this.formNew = formBuilder.group({
      userId: ['', Validators.required],
      restuarantId: ['', Validators.required],
      name: ['', [Validators.required,Validators.minLength(5)]],
      reservationdOn: ['', Validators.required],
      reservationType: [null, Validators.required],
      numberOfPeople: [''],
    });
    this.totalPay = 0;
  }
  private route = inject(ActivatedRoute);

  private _reservationTypes = Object.keys(ReservationType);
  public get reservationTypes(): Array<string> {
    return this._reservationTypes.slice(this._reservationTypes.length / 2);
  }

  ngOnInit(): void {
    this.route.params.subscribe((params) => {
      this.id = params['id'];
    });
    this.RestuarantService.getRestuarant(this.id).subscribe({
      next: this.handleGetResponse.bind(this),
      error: this.handleError.bind(this),
    });

    this.ServiceService.getServicesByRestuarantId(this.id).subscribe({
      next: this.handleGetServicesResponse.bind(this),
      error: this.handleError.bind(this),
    });

    this.CheckAvailabilty(this.id);
  }


  searchTerm: string = '';

  filteredServices() {
    if (!this.searchTerm) {
      return this.services;
    }
    return this.services.filter(service =>
      service.name.toLowerCase().includes(this.searchTerm.toLowerCase())
    );
  }

  updateselection(value: any) {
    this.selectedType = value.target.value;
    this.updateValidation(value.target.value);
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

  updatePrice(value: any) {
    const numberofPeople = value.target.value;
    this.totalPay = 1000 * numberofPeople * this.restuarant.currentRate;
    this.OldtotalPay = this.totalPay;
  }
  CheckDiscount(value: any) {
    this.OfferNPromotionService.getOfferNPromotionByCode(value.target.value).subscribe({
      next: this.handlePriceResponse.bind(this),
      error: this.handlePriceError.bind(this),
    });
  }

  openForm(): void {
    this.formNew.reset();
    this.formNew.patchValue({
      restuarantId: this.id,
      userId: this.userService.getCurrentUser().id,
    });
    this.showForm = true;

    const newUserActivity: UserActivity = {
      activity: "Open Reservation form ",
      userId: this.getCurrentUser().id,
    };
     this.UseractivityService.addUserActivity(newUserActivity).subscribe({
      next: this.handleUpdateActivityResponse.bind(this),
      error: this.handleError.bind(this),
    });
  }
  closeForm(): void {
    this.showForm = false;
  }

  CheckAvailabilty(value: number) {
    this.ReservationService.checkReservation(value).subscribe(
      (result: boolean) => {
        this.shouldAllowReservation = result;
      }
    );
  }
  onSubmit(): void {
    if (this.formNew.valid) {
      const formData = this.formNew.value;
      const dateStr = formData.reservationdOn;
      console.log(dateStr);
      const dateObj = new Date(dateStr);
      const isoDateStr = dateObj.toISOString();
      formData.reservationdOn = isoDateStr;
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
      this.ReservationService.makeReservation(data).subscribe({
        next: this.handleUpdateResponse.bind(this),
        error: this.handleError.bind(this),
      });
      const paymentformData = new FormData();
      // Append properties to FormData
      paymentformData.append('total', this.totalPay.toString());
      paymentformData.append('restuarantId', formData.restuarantId.toString());
      paymentformData.append('userId', formData.userId.toString());
      console.log(paymentformData);
      this.PaymentService.makepayment(paymentformData).subscribe({
        next: this.handleUpdateResponse.bind(this),
        error: this.handleError.bind(this),
      });

      this.closeForm();
    }
    else{
      this.markFormGroupTouched(this.formNew);
    }
  }

  handleGetResponse(response: any): void {
    console.log(response);
    this.restuarant = response.data;
  }

  handleGetServicesResponse(response: any): void {
    console.log(response);
    this.services = response.data;
  }

  handlePriceResponse(response: any): void {
    console.log(response);
    const discountAmount = this.totalPay * (response.data.discount / 100);
    this.totalPay-= discountAmount;
  }

  handleUpdateResponse(response: any): void {
    this.messageService.add({
      severity: 'info',
      summary: 'Confirmed',
      detail: 'New Reservation Created',
      life: 3000,
    });

    const newUserActivity: UserActivity = {
      activity: "Reservation Paid and Confirmed ",
      userId: this.getCurrentUser().id,
    };
     this.UseractivityService.addUserActivity(newUserActivity).subscribe({
      next: this.handleUpdateActivityResponse.bind(this),
      error: this.handleError.bind(this),
    });
  }
  handleError(error: any): void {
    this.messageService.add({
      severity: 'error',
      summary: 'Rejected',
      detail: 'Techincal Error Occured',
      life: 3000,
    });
  }
  handlePriceError(error: any): void {
    this.totalPay=this.OldtotalPay;
  }


  getCurrentUser(): any {
    return this.userService.getCurrentUser();
  }
  handleUpdateActivityResponse(response:any):void{

  }
  private markFormGroupTouched(formGroup: FormGroup) {
    Object.keys(formGroup.controls).forEach(field => {
      const control = formGroup.get(field);
      control!.markAsTouched({ onlySelf: true });
    });
  }
}
