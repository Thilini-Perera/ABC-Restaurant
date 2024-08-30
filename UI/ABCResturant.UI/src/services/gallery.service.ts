import { Injectable } from '@angular/core';
import { Gallery } from '../models/gallery';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

interface GalleryModel{
  file:File,
  restaurantId:number
}

@Injectable({
  providedIn: 'root'
})
export class GalleryService {
  private apiUrl = 'https://localhost:7072/api/Gallery';

  constructor(private http: HttpClient) {}

  getGalleries(): Observable<Gallery[]> {
    return this.http.get<Gallery[]>(this.apiUrl);
  }

  addGallery(data: FormData): Observable<any> {
    return this.http.post<any>(this.apiUrl, data);
  }

  updateGallery(data: FormData): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}`, data);
  }

  deleteGallery(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

}
