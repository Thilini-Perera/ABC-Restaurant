import { LocationsComponent } from './../locations/locations.component';
import { OfferpromoviewComponent } from './../offerpromoview/offerpromoview.component';
import { RestuarantviewComponent } from './../restuarantview/restuarantview.component';
import { Routes } from '@angular/router';
import { LoginComponent } from '../login/login.component';
import { UsersComponent } from '../users/users.component';
import { RestuarantsComponent } from '../restuarants/restuarants.component';
import { PaymentsComponent } from '../payments/payments.component';
import { GalleryComponent } from '../gallery/gallery.component';
import { RestuarantservicesComponent } from '../restuarantservices/restuarantservices.component';
import { OfferNPromotionComponent } from '../offer-npromotion/offer-npromotion.component';
import { RegisterComponent } from '../register/register.component';
import { OverviewComponent } from '../overview/overview.component';
import { ReservationdashboardComponent } from '../reservationdashboard/reservationdashboard.component';
import { QueriesComponent } from '../queries/queries.component';
import { CustomerQueryComponent } from '../customerQuery/customerQuery.component';


export const routes: Routes = [
  {path:'',redirectTo:"overview",pathMatch:'full'},
  { path: 'overview', component: OverviewComponent },

  {path:'login',component:LoginComponent},
  { path: 'register', component: RegisterComponent },

  { path: 'users', component: UsersComponent },
  { path: 'restuarants', component: RestuarantsComponent },
  { path: 'payments', component: PaymentsComponent },
  { path: 'gallery', component: GalleryComponent },
  { path: 'services', component: RestuarantservicesComponent },
  { path: 'offernpromotions', component: OfferNPromotionComponent },
  { path: 'reservations', component: ReservationdashboardComponent },
  { path: 'queries', component: QueriesComponent },

  //Customer Only
  { path: 'restuarant/:id', component: RestuarantviewComponent },
  { path: 'offerpromo', component: OfferpromoviewComponent },
  { path: 'locations', component: LocationsComponent },
  { path: 'askaQuestion', component: CustomerQueryComponent },
];
