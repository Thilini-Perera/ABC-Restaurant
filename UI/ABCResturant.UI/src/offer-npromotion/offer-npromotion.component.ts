import { CommonModule } from '@angular/common';
import { Component, ViewChild } from '@angular/core';
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
import { Table, TableModule } from 'primeng/table';
import { ToastModule } from 'primeng/toast';
import { OfferNPromotion } from '../models/OfferNPromotion';
import { OfferNPromotionService } from '../services/offer-npromotion.service';
import { CalendarModule } from 'primeng/calendar';
import { User } from '../models/user';
import { UsersService } from './../services/users.service';
import { UserActivity } from '../models/UserActivity';
import { UseractivityService } from '../services/useractivity.service';

@Component({
  selector: 'app-offer-npromotion',
  standalone: true,
  imports: [ TableModule,
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
    CalendarModule
  ],
  providers: [ConfirmationService, MessageService],
  templateUrl: './offer-npromotion.component.html',
  styleUrl: './offer-npromotion.component.css'
})
export class OfferNPromotionComponent {
  offerNPromotions: OfferNPromotion[] = [];
  selectedrestuarant!: OfferNPromotion;

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

  @ViewChild('dt1') dataTable : Table| any;
  visible: boolean = false;

  minDate = new Date();
  responsiveOptions: any[] = [
    {
        breakpoint: '1024px',
        numVisible: 5
    },
    {
        breakpoint: '768px',
        numVisible: 3
    },
    {
        breakpoint: '560px',
        numVisible: 1
    }
  ]
  constructor(
    private confirmationService: ConfirmationService,
    private messageService: MessageService,
    private OfferNPromotionsService: OfferNPromotionService,
    private UsersService: UsersService,
    private UseractivityService: UseractivityService,
    formBuilder: FormBuilder
  ) {
    this.formEdit = formBuilder.group({
      id: [''],
      message: ['', [Validators.required, Validators.minLength(10)]],
      code: ['', [Validators.required, Validators.minLength(6)]],
      discount: ['', [Validators.required,  Validators.max(44)]],
      offerUntil: ['', [Validators.required]],
    });
    this.formNew = formBuilder.group({
      message: ['', [Validators.required, Validators.minLength(10)]],
      code: ['', [Validators.required, Validators.minLength(6)]],
      discount: ['', [Validators.required,  Validators.max(44)]],
      offerUntil: ['', [Validators.required]],
    });
    this.currentUser = this.UsersService.getCurrentUser();
  }

  ngOnInit(): void {
    this.getOfferNPromotions();
    this.loading = false;

    const newUserActivity: UserActivity = {
      activity: "Offer/Promotion Dashboard Loaded",
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
      const dateStr = user.offerUntil;
      const dateObj = new Date(dateStr);
      this.formEdit.patchValue({
        id:user.id,
        message: user.message,
        discount: user.discount,
        code: user.code,
        offerUntil : dateObj,
      });
    } else {
      this.formEdit.reset();
      this.formNew.reset();
    }
    this.showForm = true;

    const newUserActivity: UserActivity = {
      activity: "Open Offer/Promotion form in "+mode,
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
        const formData = this.formNew.value;
        const dateStr = formData.offerUntil;
        const dateObj = new Date(dateStr);
        const isoDateStr = dateObj.toISOString();
        formData.offerUntil = isoDateStr;
        const data: OfferNPromotion = formData;
        this.OfferNPromotionsService.addOfferNPromotion(data).subscribe({
          next: this.handleUpdateResponse.bind(this),
          error: this.handleError.bind(this),
        });
      }
       else{
        this.markFormGroupTouched(this.formNew);
      }
    } else {
      if (this.formEdit.valid) {
        const formData = this.formEdit.value;
        const dateStr = formData.offerUntil;
        const dateObj = new Date(dateStr);
        const isoDateStr = dateObj.toISOString();
        formData.offerUntil = isoDateStr;
        const data: OfferNPromotion = formData;
        this.OfferNPromotionsService.updateOfferNPromotion(data).subscribe({
          next: this.handleUpdateResponse.bind(this),
          error: this.handleError.bind(this),
        });
      }
       else{
        this.markFormGroupTouched(this.formEdit);
      }
    }
  }

  handleUpdateResponse(response: OfferNPromotion): void {
    if (this.formMode === 'create') {
      this.offerNPromotions.push(response);
      this.messageService.add({
        severity: 'info',
        summary: 'Confirmed',
        detail: 'New Offer Created',
        life: 3000,
      });

      const newUserActivity: UserActivity = {
        activity: "Posted New Offer",
        userId: this.currentUser.id,
      };
       this.UseractivityService.addUserActivity(newUserActivity).subscribe({
      next: this.handleUpdateActivityResponse.bind(this),
      error: this.handleError.bind(this),
    });
    } else {
      const index = this.offerNPromotions.findIndex(
        (r) => r.id === this.currentRestaurantId
      );
      if (index !== -1) {
        this.offerNPromotions[index] = response;
      }
      this.messageService.add({
        severity: 'info',
        summary: 'Confirmed',
        detail: 'Offer Updated',
        life: 3000,
      });

      const newUserActivity: UserActivity = {
        activity: "Posted Updated Offer",
        userId: this.currentUser.id,
      };
       this.UseractivityService.addUserActivity(newUserActivity).subscribe({
      next: this.handleUpdateActivityResponse.bind(this),
      error: this.handleError.bind(this),
    });
    }
    this.getOfferNPromotions();
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

  getOfferNPromotions(): void {
    this.OfferNPromotionsService.getOfferNPromotions().subscribe(
      (Users) => (this.offerNPromotions = Users)
    );
    console.log(this.offerNPromotions);
  }

  selectrestuarant(restuarant: OfferNPromotion): void {
    this.selectedrestuarant = { ...restuarant };
  }

  deleterestuarant(id: number): void {
    this.OfferNPromotionsService.deleteOfferNPromotion(id).subscribe(() =>
      this.getOfferNPromotions()
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
          detail: 'Offer Deleted',
          life: 3000,
        });
        const newUserActivity: UserActivity = {
          activity: "Offer Deleted",
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
