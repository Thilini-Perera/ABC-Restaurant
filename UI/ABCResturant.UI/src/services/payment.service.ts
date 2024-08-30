import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Payment } from '../models/Payment';

@Injectable({
  providedIn: 'root'
})
export class PaymentService {

  private apiUrl = 'https://localhost:7072/api/Payment';

  constructor(private http: HttpClient) { }

  // http = inject(HttpClient);

  getPayments(): Observable<Payment[]> {
        return this.http.get<Payment[]>(this.apiUrl);
    }

    getPayment(id: number): Observable<any> {
        return this.http.get<any>(`${this.apiUrl}/${id}`);
    }

    addPayment(Payment: any): Observable<Payment> {
        return this.http.post<Payment>(this.apiUrl, Payment);
    }
    makepayment(Payment: any): Observable<Payment> {
        return this.http.post<Payment>(`${this.apiUrl}/Pay`, Payment);
    }

    updatePayment( Payment: Payment): Observable<Payment> {
        return this.http.put<Payment>(this.apiUrl, Payment);
    }

    deletePayment(id: number): Observable<void> {
        return this.http.delete<void>(`${this.apiUrl}/${id}`);
    }
}
