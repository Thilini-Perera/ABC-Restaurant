import { UsersService } from './../services/users.service';
import { ReservationService } from './../services/reservation.service';
import { Restuarant } from './../models/restuarants';
import { RestuarantService } from './../services/restuarant-services.service';
import { Component, OnInit, ViewChild } from '@angular/core';
import { Table, TableModule } from 'primeng/table';
import { SlideMenuModule } from 'primeng/slidemenu';
import { ProgressBarModule } from 'primeng/progressbar';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { InputTextModule } from 'primeng/inputtext';
import { ButtonModule } from 'primeng/button';
import { CommonModule, NgOptimizedImage } from '@angular/common';
import { DialogModule } from 'primeng/dialog';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { ToastModule } from 'primeng/toast';
import { ConfirmationService, MessageService } from 'primeng/api';
import { MatDividerModule } from '@angular/material/divider';
import { GalleryService } from '../services/gallery.service';
import { Gallery } from '../models/gallery';
import { UseractivityService } from '../services/useractivity.service';
import { UserActivity } from '../models/UserActivity';

@Component({
  selector: 'app-restuarants',
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
    NgOptimizedImage,
  ],
  providers: [ConfirmationService, MessageService],
  templateUrl: './restuarants.component.html',
  styleUrl: './restuarants.component.css',
})
export class RestuarantsComponent implements OnInit {

  restuarants: Restuarant[] = [];
  selectedrestuarant!: any;

  statuses!: any[];
  loading: boolean = false;

  activityValues: number[] = [0, 100];

  searchValue: string | undefined;

  showForm = false;
  showDetail = false;
  showUpload = false;
  formMode: 'create' | 'edit' = 'create';
  restaurantFormNew: FormGroup;
  restaurantFormEdit: FormGroup;
  galleryForm: FormGroup;


  @ViewChild('dt1') dataTable : Table| any;
  currentRestaurantId: number | null = null;

  visible: boolean = false;

  selectedFile!: File;

  constructor(
    private confirmationService: ConfirmationService,
    private messageService: MessageService,
    private RestuarantService: RestuarantService,
    private Galleryservice: GalleryService,
    private ReservationService: ReservationService,
    private UseractivityService: UseractivityService,
    private UsersService: UsersService,
    formBuilder: FormBuilder
  ) {
    this.restaurantFormEdit = formBuilder.group({
      id: [''],
      name: ['', [Validators.required, Validators.minLength(5)]],
      location: ['', [Validators.required, Validators.minLength(5)]],
      maxReservations: ['', [Validators.required, Validators.minLength(1)]],
      currentRate: ['', [Validators.required, Validators.minLength(1)]],
      telephone: ['', [Validators.required, Validators.pattern('^[0-9]{10}$')]],
    });
    this.restaurantFormNew = formBuilder.group({
      name: ['', [Validators.required, Validators.minLength(5)]],
      location: ['', [Validators.required, Validators.minLength(5)]],
      maxReservations: ['', [Validators.required, Validators.minLength(1)]],
      currentRate: ['', [Validators.required, Validators.minLength(1)]],
      telephone: ['', [Validators.required, Validators.pattern('^[0-9]{10}$')]],
    });
    this.galleryForm = formBuilder.group({
      restuarantId: ['', Validators.required],
      file: ['', Validators.required],
    });
  }

  ngOnInit(): void {
    this.getRestuarants();
    this.loading = false;
    const newUserActivity: UserActivity = {
      activity: 'Restuarant Dashboard Loaded',
      userId: this.UsersService.getCurrentUser().id,
    };

    this.UseractivityService.addUserActivity(newUserActivity).subscribe({
      next: this.handleUpdateActivityResponse.bind(this),
      error: this.handleError.bind(this),
    });
  }

  onFileChange(event: any) {
    const file = event.target.files[0];
    if (file) {
      const allowedTypes = ['image/jpeg', 'image/png'];
      const maxSize = 20 * 1024 * 1024; // 20 MB

      if (!allowedTypes.includes(file.type)) {
        this.galleryForm.get('file')?.setErrors({ invalidType: true });
      } else if (file.size > maxSize) {
        this.galleryForm.get('file')?.setErrors({ invalidSize: true });
      } else {
        this.galleryForm.get('file')?.setErrors(null);
        this.selectedFile = <File>event.target.files[0];
      }
    }
  }
  SetfilterGlobal($event: any) {
    const input = $event.target.value;
    this.dataTable?.filterGlobal(input,'contains');
    }

  showDeleteConfirm(id: number) {
    this.visible = true;
  }

  openForm(mode: 'create' | 'edit', restaurant?: any): void {
    this.formMode = mode;
    if (mode === 'edit' && restaurant) {
      this.restaurantFormEdit.patchValue(restaurant);
    } else {
      this.restaurantFormEdit.reset();
      this.restaurantFormNew.reset();
    }
    this.showForm = true;

    const newUserActivity: UserActivity = {
      activity: 'Open restuarant form in ' + mode,
      userId: this.UsersService.getCurrentUser().id,
    };
    this.UseractivityService.addUserActivity(newUserActivity).subscribe({
      next: this.handleUpdateActivityResponse.bind(this),
      error: this.handleError.bind(this),
    });
  }

  ShowDetails(id: number): void {
    this.RestuarantService.getRestuarant(id).subscribe(
      (Restuarant) => (this.selectedrestuarant = Restuarant.data)
    );
    this.showDetail=true;
  }

  openFormPic(restaurant?: Restuarant): void {
    if (restaurant) {
      this.galleryForm.patchValue({
        restuarantId: restaurant.id,
      });
    } else {
      console.log(this.galleryForm.value);
    }
    this.showUpload = true;

    const newUserActivity: UserActivity = {
      activity: 'Open restuarant form to file upload',
      userId: this.UsersService.getCurrentUser().id,
    };
    this.UseractivityService.addUserActivity(newUserActivity).subscribe({
      next: this.handleUpdateActivityResponse.bind(this),
      error: this.handleError.bind(this),
    });
  }

  closeForm(): void {
    this.showForm = false;
    this.showDetail=false;
  }

  closeFormPic(): void {
    this.showUpload = false;
  }

  onSubmit(): void {
    if (this.formMode === 'create') {
      if (this.restaurantFormNew.valid) {
        const restaurantData: Restuarant = this.restaurantFormNew.value;
        this.RestuarantService.addRestuarant(restaurantData).subscribe({
          next: this.handleUpdateResponse.bind(this),
          error: this.handleError.bind(this),
        });
      } else {
        this.markFormGroupTouched(this.restaurantFormNew);
      }
    } else {
      if (this.restaurantFormEdit.valid) {
        const restaurantData: Restuarant = this.restaurantFormEdit.value;
        this.RestuarantService.updateRestuarant(restaurantData).subscribe({
          next: this.handleUpdateResponse.bind(this),
          error: this.handleError.bind(this),
        });
      } else {
        this.markFormGroupTouched(this.restaurantFormEdit);
      }
    }
  }

  onSubmitPic(data: any) {
    if (this.galleryForm.valid) {
      const formData = new FormData();
      formData.append('restuarantId', data.restuarantId);
      formData.append('file', this.selectedFile);
      this.Galleryservice.addGallery(formData).subscribe({
        next: this.handleGalleryUpdateResponse.bind(this),
        error: this.handleError.bind(this),
      });
    }
  }

  handleUpdateActivityResponse(response: any): void {}

  handleUpdateResponse(response: Restuarant): void {
    if (this.formMode === 'create') {
      this.restuarants.push(response);
      this.messageService.add({
        severity: 'info',
        summary: 'Confirmed',
        detail: 'New Restuarant Created',
        life: 3000,
      });

      const newUserActivity: UserActivity = {
        activity: 'Posted New Restuarant',
        userId: this.UsersService.getCurrentUser().id,
      };
      this.UseractivityService.addUserActivity(newUserActivity).subscribe({
        next: this.handleUpdateActivityResponse.bind(this),
        error: this.handleError.bind(this),
      });
    } else {
      const index = this.restuarants.findIndex(
        (r) => r.id === this.currentRestaurantId
      );
      if (index !== -1) {
        this.restuarants[index] = response;
      }
      this.messageService.add({
        severity: 'info',
        summary: 'Confirmed',
        detail: 'Restuarant Updated',
        life: 3000,
      });

      const newUserActivity: UserActivity = {
        activity: 'Posted Updated Restuarant',
        userId: this.UsersService.getCurrentUser().id,
      };
      this.UseractivityService.addUserActivity(newUserActivity).subscribe({
        next: this.handleUpdateActivityResponse.bind(this),
        error: this.handleError.bind(this),
      });
    }
    this.getRestuarants();
    this.closeForm();
  }
  handleGalleryUpdateResponse(response: Gallery): void {
    this.messageService.add({
      severity: 'info',
      summary: 'Confirmed',
      detail: 'New Picture added to Restuarant',
      life: 3000,
    });
    this.getRestuarants();
    this.closeFormPic();

    const newUserActivity: UserActivity = {
      activity: 'Posted New Image',
      userId: this.UsersService.getCurrentUser().id,
    };
    this.UseractivityService.addUserActivity(newUserActivity).subscribe({
      next: this.handleUpdateActivityResponse.bind(this),
      error: this.handleError.bind(this),
    });
  }

  handleError(error: any): void {
    console.error('Error handling restaurant:', error);
    this.messageService.add({
      severity: 'error',
      summary: 'Rejected',
      detail: 'Techincal Error Occured',
      life: 3000,
    });
    // Handle the error appropriately in your application
  }

  getRestuarants(): void {
    this.RestuarantService.getRestuarants().subscribe(
      (Restuarants) => (this.restuarants = Restuarants)
    );
    console.log(this.restuarants);
  }

  selectrestuarant(restuarant: Restuarant): void {
    this.selectedrestuarant = { ...restuarant };
  }

  deleterestuarant(id: number): void {
    this.RestuarantService.deleteRestuarant(id).subscribe(() =>
      this.getRestuarants()
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
          detail: 'Restuarant Deleted',
          life: 3000,
        });

        const newUserActivity: UserActivity = {
          activity: 'Restuarant Deleted',
          userId: this.UsersService.getCurrentUser().id,
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
  private markFormGroupTouched(formGroup: FormGroup) {
    Object.keys(formGroup.controls).forEach((field) => {
      const control = formGroup.get(field);
      control!.markAsTouched({ onlySelf: true });
    });
  }

  GetRestuarnatReservationReport(restaurant?: Restuarant) {
    if (restaurant) {
      this.ReservationService.getPDFbyReservation(restaurant.id!).subscribe(
        (response: Blob) => {
          const blob = new Blob([response], { type: 'application/pdf' });
          const url = window.URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = `report-${restaurant.id}.pdf`;
          a.click();
          window.URL.revokeObjectURL(url);

          const newUserActivity: UserActivity = {
            activity: 'Restuarant Reservation Report taken',
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

  GetRestuarnatReport(restaurant?: Restuarant) {
    if (restaurant) {
      this.RestuarantService.getPDFbyRestuarant(restaurant.id!).subscribe(
        (response: Blob) => {
          const blob = new Blob([response], { type: 'application/pdf' });
          const url = window.URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = `report-${restaurant.id}.pdf`;
          a.click();
          window.URL.revokeObjectURL(url);

          const newUserActivity: UserActivity = {
            activity: 'Restuarant Profit Report taken',
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
  GetFullReport() {
    this.RestuarantService.getFullReport().subscribe(
      (response: Blob) => {
        const blob = new Blob([response], { type: 'application/pdf' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `report.pdf`;
        a.click();
        window.URL.revokeObjectURL(url);

        const newUserActivity: UserActivity = {
          activity: 'Restuarant chain Profit Report taken',
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
