import {HttpInterceptorFn, HttpResponse} from '@angular/common/http';
import {delay, of, throwError} from 'rxjs';
import {Pollution} from '../models/pollution.model';
import {MOCK_POLLUTIONS} from '../mocks/pollution.mock';

let pollutionsDB = [...MOCK_POLLUTIONS];
let nextId = Math.max(...pollutionsDB.map(p => p.id)) + 1;

export const mockBackendInterceptor: HttpInterceptorFn = (req, next) => {
  const { url, method, body } = req;

  const randomDelay = Math.floor(Math.random() * 300) + 200;

  if (url.includes('/api/pollutions') && method === 'GET' && !url.match(/\/\d+$/)) {
    const urlObj = new URL(url, 'http://localhost');
    const type = urlObj.searchParams.get('type');
    const severity = urlObj.searchParams.get('severity');
    const status = urlObj.searchParams.get('status');

    let filteredPollutions = [...pollutionsDB];

    if (type) {
      filteredPollutions = filteredPollutions.filter(p => p.type === type);
    }
    if (severity) {
      filteredPollutions = filteredPollutions.filter(p => p.severity === severity);
    }
    if (status) {
      filteredPollutions = filteredPollutions.filter(p => p.status === status);
    }

    return of(new HttpResponse({
      status: 200,
      body: filteredPollutions
    })).pipe(delay(randomDelay));
  }

  if (url.match(/\/api\/pollutions\/\d+$/) && method === 'GET') {
    const id = parseInt(url.split('/').pop()!);
    const pollution = pollutionsDB.find(p => p.id === id);

    if (pollution) {
      return of(new HttpResponse({
        status: 200,
        body: pollution
      })).pipe(delay(randomDelay));
    } else {
      return throwError(() => ({
        status: 404,
        error: { message: 'Pollution non trouvée' }
      })).pipe(delay(randomDelay));
    }
  }

  if (url.includes('/api/pollutions') && method === 'POST') {
    const newPollution: Pollution = {
      id: nextId++,
      ...(body as Omit<Pollution, 'id'>),
      dateObservation: (body as any).dateObservation ? new Date((body as any).dateObservation) : new Date(),
      reportedDate: new Date()
    };

    pollutionsDB.push(newPollution);

    return of(new HttpResponse({
      status: 201,
      body: newPollution
    })).pipe(delay(randomDelay));
  }

  if (url.match(/\/api\/pollutions\/\d+$/) && method === 'PUT') {
    const id = parseInt(url.split('/').pop()!);
    const index = pollutionsDB.findIndex(p => p.id === id);

    if (index !== -1) {
      pollutionsDB[index] = {
        ...pollutionsDB[index],
        ...(body as Partial<Pollution>),
        id
      };

      return of(new HttpResponse({
        status: 200,
        body: pollutionsDB[index]
      })).pipe(delay(randomDelay));
    } else {
      return throwError(() => ({
        status: 404,
        error: { message: 'Pollution non trouvée' }
      })).pipe(delay(randomDelay));
    }
  }

  if (url.match(/\/api\/pollutions\/\d+$/) && method === 'DELETE') {
    const id = parseInt(url.split('/').pop()!);
    const index = pollutionsDB.findIndex(p => p.id === id);

    if (index !== -1) {
      pollutionsDB.splice(index, 1);

      return of(new HttpResponse({
        status: 204,
        body: null
      })).pipe(delay(randomDelay));
    } else {
      return throwError(() => ({
        status: 404,
        error: { message: 'Pollution non trouvée' }
      })).pipe(delay(randomDelay));
    }
  }

  return next(req);
};
