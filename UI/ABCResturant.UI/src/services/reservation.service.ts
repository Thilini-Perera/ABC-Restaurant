import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Reservation } from '../models/Reservation';

@Injectable({
  providedIn: 'root',
})
export class ReservationService {
  private apiUrl = 'https://localhost:7072/api/Reservation';

  constructor(private http: HttpClient) {}

  // http = inject(HttpClient);

  getReservations(): Observable<any> {
    return this.http.get<any>(this.apiUrl);
  }

  getReservation(id: number): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/${id}`);
  }

  addReservation(Reservation: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}`, Reservation);
  }

  makeReservation(Reservation: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/Reserve`, Reservation);
  }

  approveReservation(Reservation: number): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/Approve`,Reservation);
  }

  checkReservation(Reservation: number): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/Check?id=${Reservation}`);
  }

  updateReservation(value: any): Observable<any> {
    return this.http.put<any>(this.apiUrl, value);
  }

  deleteReservation(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  getPDFbyReservation(id: number): Observable<Blob> {
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
