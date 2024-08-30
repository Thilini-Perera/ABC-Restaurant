import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Service } from '../models/services';

@Injectable({
  providedIn: 'root',
})
export class ServiceService {
  private apiUrl = 'https://localhost:7072/api/Service';

  constructor(private http: HttpClient) {}

  getServices(): Observable<Service[]> {
    return this.http.get<Service[]>(this.apiUrl);
  }

  getService(id: number): Observable<Service> {
    return this.http.get<Service>(`${this.apiUrl}/${id}`);
  }

  getServicesByRestuarantId(id: number): Observable<Service[]> {
    return this.http.get<Service[]>(`${this.apiUrl}/GetServicesByRestuarantId?id=${id}`);
  }

  addService(Service: Service): Observable<Service> {
    return this.http.post<Service>(this.apiUrl, Service);
  }

  updateService(Service: Service): Observable<Service> {
    return this.http.put<Service>(`${this.apiUrl}`, Service);
  }

  deleteService(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
