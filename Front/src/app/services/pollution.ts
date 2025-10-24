import {inject, Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {Observable} from 'rxjs';
import { environment } from '../../environments/environment';
import {Pollution} from '../models/pollution.model';

@Injectable({
  providedIn: 'root'
})
export class PollutionService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/pollutions`;

  getAllPollutions(): Observable<Pollution[]> {
    return this.http.get<Pollution[]>(this.apiUrl);
  }

  getPollutionById(id: number): Observable<Pollution> {
    return this.http.get<Pollution>(`${this.apiUrl}/${id}`);
  }

  createPollution(pollution: Omit<Pollution, 'id'>): Observable<Pollution> {
    return this.http.post<Pollution>(this.apiUrl, pollution);
  }

  updatePollution(id: number, pollution: Partial<Pollution>): Observable<Pollution> {
    return this.http.put<Pollution>(`${this.apiUrl}/${id}`, pollution);
  }

  deletePollution(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  filterPollutions(filters: {
    type?: string;
    severity?: string;
    status?: string;
  }): Observable<Pollution[]> {
    let url = this.apiUrl;
    const params = new URLSearchParams();

    if (filters.type) params.append('type', filters.type);
    if (filters.severity) params.append('severity', filters.severity);
    if (filters.status) params.append('status', filters.status);

    const queryString = params.toString();
    if (queryString) {
      url += `?${queryString}`;
    }

    return this.http.get<Pollution[]>(url);
  }
}
