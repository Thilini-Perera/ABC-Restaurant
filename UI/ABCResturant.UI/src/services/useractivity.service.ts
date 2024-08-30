import { Injectable } from '@angular/core';
import { UserActivity } from '../models/UserActivity';
import { Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class UseractivityService {
  private apiUrl = 'https://localhost:7072/api/UserActivity';

  constructor(private http: HttpClient) {}

  addUserActivity(UserActivity: UserActivity): Observable<UserActivity> {
    return this.http.post<UserActivity>(`${this.apiUrl}`, UserActivity);
  }

  getPDFbyUserActivity(id: number): Observable<Blob> {
    return this.http.get(`${this.apiUrl}/GetReport?id=${id}`, {
      responseType: 'blob',
    });
  }
  getFullReport(): Observable<Blob> {
    return this.http.get(`${this.apiUrl}/GetExtReport`, {
      responseType: 'blob',
    });
  }
}
