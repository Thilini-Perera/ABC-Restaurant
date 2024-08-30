import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Restuarant } from '../models/restuarants';

@Injectable({
  providedIn: 'root'
})
export class RestuarantService {
  private apiUrl = 'https://localhost:7072/api/Resturant';

  constructor(private http: HttpClient) { }

  // http = inject(HttpClient);

  getRestuarants(): Observable<Restuarant[]> {
        return this.http.get<Restuarant[]>(this.apiUrl);
    }

    getRestuarant(id: number): Observable<any> {
        return this.http.get<any>(`${this.apiUrl}/${id}`);
    }

    getPDFbyRestuarant(id: number): Observable<Blob> {
        return this.http.get(`${this.apiUrl}/GetReport?id=${id}`, { responseType: 'blob' });
    }
    getFullReport(): Observable<Blob> {
        return this.http.get(`${this.apiUrl}/GetExtReport`, { responseType: 'blob' });
    }
    addRestuarant(Restuarant: Restuarant): Observable<Restuarant> {
        console.log("add restaurant")
        return this.http.post<Restuarant>(this.apiUrl, Restuarant);
    }

    updateRestuarant( Restuarant: Restuarant): Observable<Restuarant> {
        return this.http.put<Restuarant>(this.apiUrl, Restuarant);
    }

    deleteRestuarant(id: number): Observable<void> {
        return this.http.delete<void>(`${this.apiUrl}/${id}`);
    }
}
