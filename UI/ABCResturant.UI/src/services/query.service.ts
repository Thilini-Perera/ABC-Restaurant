import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Chat, ChatRoom } from '../models/Query';

@Injectable({
  providedIn: 'root',
})
export class QueryService {
  private apiUrl = 'https://localhost:7072/api/Chat';
  constructor(private http: HttpClient) {}

  getQuerys(): Observable<ChatRoom[]> {
    return this.http.get<ChatRoom[]>(this.apiUrl);
  }
  getQueryMessages(id: number): Observable<Chat[]> {
    return this.http.get<Chat[]>(`${this.apiUrl}/GetChats?id=${id}`);
  }

  getQuery(id: number): Observable<ChatRoom> {
    return this.http.get<ChatRoom>(`${this.apiUrl}/${id}`);
  }

  addQuery(Query: any): Observable<any> {
    return this.http.post<any>(this.apiUrl, Query);
  }

  updateQuery(Query: any): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}`, Query);
  }

  deleteQuery(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
  getPDFbyQuery(id: number): Observable<Blob> {
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
