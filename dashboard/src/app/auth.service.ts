// auth.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

const API_URL = 'http://localhost:5000/api/auth/';

export interface RegisterPayload {
  name: string;
  firstName: string;
  email: string;
  password: string;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private registerUrl = API_URL + 'register';

  constructor(private http: HttpClient) {}

  registerUser(payload: RegisterPayload): Observable<any> {
    return this.http.post<any>(this.registerUrl, payload);
  }
}
