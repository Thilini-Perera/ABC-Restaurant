import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component } from '@angular/core';
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
import { QueryService } from '../services/query.service';
import { ChatRoom, Chat, CustomerResponseType } from '../models/Query';
import { UsersService } from '../services/users.service';
import { User } from '../models/user';
import { UseractivityService } from '../services/useractivity.service';
import { UserActivity } from '../models/UserActivity';

@Component({
  selector: 'app-queries',
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
  templateUrl: './queries.component.html',
  styleUrl: './queries.component.css',
  changeDetection: ChangeDetectionStrategy.Default,
})
export class QueriesComponent {
  queries: any[] = [];
  // messages: Chat[] = [];
  users: User[] = [];
  selectedChatRoom!: ChatRoom;
  CustomerResponseType = CustomerResponseType;
  statuses!: any[];
  messages!: Chat[];
  filteredMessages!: Chat[];
  loading: boolean = false;

  activityValues: number[] = [0, 100];

  searchValue: string | undefined;

  showForm = false;
  formMode: 'create' | 'edit' = 'create';
  formNew: FormGroup;
  formEdit: FormGroup;
  currentRestaurantId: number | null = null;

  visible: boolean = false;

  currentUser!:User;

  constructor(
    private confirmationService: ConfirmationService,
    private messageService: MessageService,
    private QueryService: QueryService,
    private UserService: UsersService,
    private UseractivityService: UseractivityService,
    formBuilder: FormBuilder
  ) {
    this.formEdit = formBuilder.group({
      id: [''],
      userId: ['', Validators.required],
      response: ['', Validators.required],
    });
    this.formNew = formBuilder.group({
      userId: ['', Validators.required],
      response: ['', Validators.required],
    });
    this.currentUser = this.UserService.getCurrentUser();
  }

  ngOnInit(): void {
    this.UserService.getUsers().subscribe((Users) => (this.users = Users));

    this.getQueries();
    this.loading = false;


    const newUserActivity: UserActivity = {
      activity: "Query Dashboard Loaded",
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

  openForm(mode: 'create' | 'edit', query?: any): void {
    this.formMode = mode;
    if (mode === 'edit' && query) {

      this.QueryService.getQueryMessages(query.id).subscribe((Query) => (this.messages = Query));

      this.formEdit.patchValue({
        userId: this.UserService.getCurrentUser().id,
        id: query.id,
      });
    } else {
      this.formEdit.reset();
      this.formNew.reset();
    }
    this.showForm = true;

    const newUserActivity: UserActivity = {
      activity: "Open Query form in "+mode,
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
    if (this.formEdit.valid) {
      const userData = this.formEdit.value;
      this.QueryService.updateQuery(userData).subscribe({
        next: this.handleUpdateResponse.bind(this),
        error: this.handleError.bind(this),
      });
      this.closeForm();
    }
  }

  handleUpdateResponse(response: any): void {
    if (this.formMode === 'create') {
      this.queries.push(response);
      this.messageService.add({
        severity: 'info',
        summary: 'Confirmed',
        detail: 'New ChatRoom Created',
        life: 3000,
      });

      const newUserActivity: UserActivity = {
        activity: "Chat Posted",
        userId: this.currentUser.id,
      };
       this.UseractivityService.addUserActivity(newUserActivity).subscribe({
        next: this.handleUpdateActivityResponse.bind(this),
        error: this.handleError.bind(this),
      });
    } else {
      this.messageService.add({
        severity: 'info',
        summary: 'Confirmed',
        detail: 'Chat Room Updated',
        life: 3000,
      });
    }
    this.getQueries();
    this.closeForm();
  }
  handleGetResponse(response: any): void {
    this.queries = response;
  }

  handleError(error: any): void {
    console.error('Error handling query:', error);
    this.messageService.add({
      severity: 'error',
      summary: 'Rejected',
      detail: 'Techincal Error Occured',
      life: 3000,
    });
    // Handle the error appropriately in your application
  }

  getQueries(): void {
    this.QueryService.getQuerys().subscribe({
      next: this.handleGetResponse.bind(this),
      error: this.handleError.bind(this),
    });
    console.log(this.queries);
  }

  selectChatRoom(restuarant: ChatRoom): void {
    this.selectedChatRoom = { ...restuarant };
  }

  getChatMessages(): Chat[] | undefined {
    return this.selectedChatRoom.CustomerResponses;
  }

  deleterestuarant(id: number): void {
    this.QueryService.deleteQuery(id).subscribe(() => this.getQueries());
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
          detail: 'ChatRoom Deleted',
          life: 3000,
        });

        const newUserActivity: UserActivity = {
          activity: "Query Deleted",
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


  GetQueryReport(chatroom?: ChatRoom) {
    if (chatroom) {
      this.QueryService.getPDFbyQuery(chatroom.id!).subscribe(
        (response: Blob) => {
          const blob = new Blob([response], { type: 'application/pdf' });
          const url = window.URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = `report-${chatroom.id}.pdf`;
          a.click();
          window.URL.revokeObjectURL(url);
        },
        (error) => {
          console.error('Error downloading the report', error);
        }
      );
    }
  }
  GetFullReport() {
    this.QueryService.getFullReport().subscribe(
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
  }
}
