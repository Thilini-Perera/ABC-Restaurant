import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { User } from '../models/user';
import { CookieService } from 'ngx-cookie-service';

@Injectable({
  providedIn: 'root',
})
export class UsersService {
  private apiUrl = 'https://localhost:7072/api/Users';
  constructor(private http: HttpClient, private cookieService: CookieService) {}

  private responseSubject: BehaviorSubject<any> = new BehaviorSubject<any>(null);


  get response$(): Observable<any> {
    return this.responseSubject.asObservable();
  }

  set setResponse(newResponse: any) {
    this.responseSubject.next(newResponse);
  }
  getUsers(): Observable<User[]> {
    return this.http.get<User[]>(this.apiUrl);
  }

  getUsersByRole(role:string): Observable<User[]> {
    return this.http.get<User[]>(`${this.apiUrl}/GetByRole?role=${role}`);
  }

  getUser(id: number): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/${id}`);
  }

  addUser(User: User): Observable<User> {
    return this.http.post<User>(this.apiUrl, User);
  }

  registerUser(User: User): Observable<User> {
    return this.http.post<User>(`${this.apiUrl}/register`, User);
  }

  updateUser(User: User): Observable<User> {
    return this.http.put<User>(`${this.apiUrl}`, User);
  }

  deleteUser(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  login(User: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/login`, User);
  }
  logout(): void {
    this.responseSubject.next(null);
    sessionStorage.removeItem('currentUser');
    this.http.get(`${this.apiUrl}/logout`);
  }

  getCurrentUser(): any {
    const sessionUser = safeJsonParse(sessionStorage.getItem('currentUser'));
    const cookieUser = safeJsonParse(this.cookieService.get('currentUser'));
     return sessionUser ? sessionUser : cookieUser;
  }

  getUserRole(): string {
    const user = this.getCurrentUser();
    return user ? user.role : null;
  }
}

function safeJsonParse(item: string | null): any {
  try {
    return item ? JSON.parse(item) : null;
  } catch (error) {
    console.error('Failed to parse JSON:', error);
    return null;
  }
}
