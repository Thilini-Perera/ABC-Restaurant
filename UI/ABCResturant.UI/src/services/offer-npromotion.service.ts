import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { OfferNPromotion } from '../models/OfferNPromotion';

@Injectable({
  providedIn: 'root'
})
export class OfferNPromotionService {
  private apiUrl = 'https://localhost:7072/api/OfferNPromotion';

  constructor(private http: HttpClient) {}

  getOfferNPromotions(): Observable<OfferNPromotion[]> {
    return this.http.get<OfferNPromotion[]>(this.apiUrl);
  }

  getOfferNPromotion(id: number): Observable<OfferNPromotion> {
    return this.http.get<OfferNPromotion>(`${this.apiUrl}/${id}`);
  }

  getOfferNPromotionByCode(code: string): Observable<OfferNPromotion> {
    return this.http.get<OfferNPromotion>(`${this.apiUrl}/GetPromoByCode?code=${code}`);
  }

  addOfferNPromotion(OfferNPromotion: OfferNPromotion): Observable<OfferNPromotion> {
    return this.http.post<OfferNPromotion>(this.apiUrl, OfferNPromotion);
  }

  updateOfferNPromotion(OfferNPromotion: OfferNPromotion): Observable<OfferNPromotion> {
    return this.http.put<OfferNPromotion>(`${this.apiUrl}`, OfferNPromotion);
  }

  deleteOfferNPromotion(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
