import { Component, OnInit } from '@angular/core';
import { Router, RouterOutlet } from '@angular/router';
import {MatButtonModule} from '@angular/material/button';
import {MatTabsModule} from '@angular/material/tabs';
import {MatGridListModule} from '@angular/material/grid-list';
import {MatSidenavModule} from '@angular/material/sidenav';
import { LoginService } from '../services/login.service';
import { CommonModule } from '@angular/common';
import { UsersService } from '../services/users.service';
import { CookieService } from 'ngx-cookie-service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet,MatButtonModule,MatTabsModule,MatGridListModule,MatSidenavModule, MatButtonModule,CommonModule],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent {
  title = 'ABCResturant.UI';
  showFiller = false;

  isLoggedIn: boolean = false;
  role!:string;


  constructor(private userService: UsersService, private router: Router, private cookieService: CookieService) {
    if(this.userService.getCurrentUser()!=null){
      this.isLoggedIn =true;
    }

    this.userService.response$.subscribe(res=>{
        if (res!=null) {
          console.log("nut")
          if(this.userService.getCurrentUser()!=null){
            console.log("nut")
            this.isLoggedIn =true;
          }
        }
    });


  }


  signOut(): void {
    this.userService.logout();
    sessionStorage.removeItem('currentUser');
    this.cookieService.delete('currentUser');
    this.role = "";
    this.isLoggedIn = false;
    this.router.navigate(['']);
  }

  getCurrentUser() {
    return this.userService.getCurrentUser();
  }

  getUserRole() {
    return this.userService.getUserRole();
  }


}
