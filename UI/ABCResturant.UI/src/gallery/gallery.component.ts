import { GalleryService } from './../services/gallery.service';
import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
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
import { TableModule } from 'primeng/table';
import { ToastModule } from 'primeng/toast';
import { Gallery } from '../models/gallery';
import { NgOptimizedImage } from '@angular/common';
import { User } from '../models/user';
import { UsersService } from './../services/users.service';
import { UserActivity } from '../models/UserActivity';
import { UseractivityService } from '../services/useractivity.service';


@Component({
  selector: 'app-gallery',
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
  templateUrl: './gallery.component.html',
  styleUrl: './gallery.component.css'
})
export class GalleryComponent {
  galleries: Gallery[] = [];
  selectedrestuarant!: Gallery;

  statuses!: any[];
  loading: boolean = false;

  activityValues: number[] = [0, 100];

  searchValue: string | undefined;

  showForm = false;
  formMode: 'create' | 'edit' = 'create';
  formEdit: FormGroup;
  currentRestaurantId: number | null = null;
  currentUser!:User;

  visible: boolean = false;
  selectedFile!: File;
  constructor(
    private confirmationService: ConfirmationService,
    private messageService: MessageService,
    private GalleryService: GalleryService,
    private UsersService: UsersService,
    private UseractivityService: UseractivityService,
    formBuilder: FormBuilder
  ) {
    this.formEdit = formBuilder.group({
      id: [''],
      file: ['', Validators.required],
    });


    this.currentUser = this.UsersService.getCurrentUser();
  }

  ngOnInit(): void {
    this.getGallery();
    this.loading = false;


    const newUserActivity: UserActivity = {
      activity: "Gallery Dashboard Loaded",
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

  openForm(mode: 'create' | 'edit', user?: any): void {
    this.formMode = mode;
    if (mode === 'edit' && user) {
      this.formEdit.patchValue(user);
    } else {
      this.formEdit.reset();
    }
    this.showForm = true;

    const newUserActivity: UserActivity = {
      activity: "Open Gallery form in "+mode,
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

  onSubmit(data:any): void {

    if(this.formEdit.valid){
      const formData = new FormData();
      formData.append('id', data.id);
      formData.append('file', this.selectedFile);
      this.GalleryService.updateGallery(formData).subscribe({
        next: this.handleUpdateResponse.bind(this),
        error: this.handleError.bind(this),
      });
    }

  }

  handleUpdateResponse(response: Gallery): void {
    if (this.formMode === 'create') {
      this.galleries.push(response);
      this.messageService.add({
        severity: 'info',
        summary: 'Confirmed',
        detail: 'New Gallery Created',
        life: 3000,
      });



      const newUserActivity: UserActivity = {
        activity: "Posted New Gallery",
        userId: this.currentUser.id,
      };
       this.UseractivityService.addUserActivity(newUserActivity).subscribe({
      next: this.handleUpdateActivityResponse.bind(this),
      error: this.handleError.bind(this),
    });


    } else {
      const index = this.galleries.findIndex(
        (r) => r.id === this.currentRestaurantId
      );
      if (index !== -1) {
        this.galleries[index] = response;
      }
      this.messageService.add({
        severity: 'info',
        summary: 'Confirmed',
        detail: 'Gallery Updated',
        life: 3000,
      });


      const newUserActivity: UserActivity = {
        activity: "Posted Updated Gallery",
        userId: this.currentUser.id,
      };
       this.UseractivityService.addUserActivity(newUserActivity).subscribe({
      next: this.handleUpdateActivityResponse.bind(this),
      error: this.handleError.bind(this),
    });
    }
    this.getGallery();
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

  getGallery(): void {
    this.GalleryService.getGalleries().subscribe(
      (Galleries) => (this.galleries = Galleries)
    );
    console.log(this.galleries);
  }

  selectrestuarant(restuarant: Gallery): void {
    this.selectedrestuarant = { ...restuarant };
  }

  deleterestuarant(id: number): void {
    this.GalleryService.deleteGallery(id).subscribe(() =>
      this.getGallery()
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
          detail: 'Gallery Deleted',
          life: 3000,
        });

        const newUserActivity: UserActivity = {
          activity: "Gallery Deleted",
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
  onFileChange(event: any) {
    const file = event.target.files[0];
    this.selectedFile = <File>event.target.files[0];
  }
}
