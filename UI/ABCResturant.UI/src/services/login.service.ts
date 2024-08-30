import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class LoginService {

  private sessionTimeoutDuration = 30 * 60 * 1000; // 30 minutes
  private sessionTimeoutId: any;
  private isLoggedInSubject: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);

  constructor(private router: Router) {}

  get isLoggedIn$(): Observable<boolean> {
    return this.isLoggedInSubject.asObservable();
  }

  startSession(): void {
    this.isLoggedInSubject.next(true);
    this.resetSessionTimeout();
  }

  resetSessionTimeout(): void {
    if (this.sessionTimeoutId) {
      clearTimeout(this.sessionTimeoutId);
    }
    this.sessionTimeoutId = setTimeout(() => this.endSession(), this.sessionTimeoutDuration);
  }

  endSession(): void {
    this.isLoggedInSubject.next(false);
    this.router.navigate(['/login']);
  }

  signOut(): void {
    this.endSession();
  }
}
