import {inject, Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {Observable} from 'rxjs';
import { environment } from '../../environments/environment';
import {Pollution} from '../models/pollution.model';
import {CreatePollutionDto, UpdatePollutionDto, PollutionFilterDto} from '../models/pollution.dto';

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

  createPollution(pollutionDto: CreatePollutionDto): Observable<Pollution> {
    return this.http.post<Pollution>(this.apiUrl, pollutionDto);
  }

  updatePollution(id: number, pollutionDto: UpdatePollutionDto): Observable<Pollution> {
    return this.http.put<Pollution>(`${this.apiUrl}/${id}`, pollutionDto);
  }

  deletePollution(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  filterPollutions(filters: PollutionFilterDto): Observable<Pollution[]> {
    let url = this.apiUrl;
    const params = new URLSearchParams();

    if (filters.type) params.append('type', filters.type);
    if (filters.title) params.append('title', filters.title);

    const queryString = params.toString();
    if (queryString) {
      url += `?${queryString}`;
    }

    return this.http.get<Pollution[]>(url);
  }
}
