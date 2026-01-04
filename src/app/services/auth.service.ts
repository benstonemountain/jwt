import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Router } from '@angular/router';
import { tap } from 'rxjs';
import { FormInfos } from '../components/register-component/register-component';
import { jwtDecode } from 'jwt-decode';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private http = inject(HttpClient);
  private router = inject(Router);
  private apiUrl = 'http://localhost:5264/api/auth'; // Backend URL

  private tokenKey = 'jwtToken';

  // login(credentials: FormInfos) {
  //   return this.http
  //     .post<{ token: string }>(`${this.apiUrl}/login`, credentials)
  //     .pipe(
  //       tap((response) => {
  //         localStorage.setItem('token', response.token);
  //       })
  //     );
  // }

  login(credentials: FormInfos) {
    return this.http
      .post<{ token: string }>(`${this.apiUrl}/login`, credentials)
      .pipe(
        tap((response) => {
          // 1. Elmentjük a nyers tokent
          localStorage.setItem(this.tokenKey, response.token);

          try {
            // 2. Dekódoljuk a tokent
            const decodedToken: any = jwtDecode(response.token);
            console.log('A dekódolt token tartalma:', decodedToken);

            // 3. Összeállítjuk a felhasználói objektumot
            const user = {
              id: decodedToken.sub,
              email: decodedToken.email,
              role: decodedToken.role,
              token: response.token,
            };

            // 4. Elmentjük a komplett user objektumot stringként a localStorage-ba
            // Így a szerepkör (role) is fixen megmarad a böngészőben
            localStorage.setItem('currentUser', JSON.stringify(user));
          } catch (error) {
            console.error('Hiba a token dekódolásakor:', error);
          }
        })
      );
  }

  register(credentials: FormInfos) {
    return this.http
      .post<{ token: string }>(`${this.apiUrl}/register`, credentials)
      .pipe(
        tap((response) => {
          localStorage.setItem(this.tokenKey, response.token);
        })
      );
  }


  getRole(): string | null {
    const token = localStorage.getItem(this.tokenKey);
    if (!token) return null;

    // decode base64 payload
    const payload = JSON.parse(atob(token.split('.')[1]));
    console.log(payload.role);
    
    return payload.role;
  }

  isAdmin(): boolean {
    return this.getRole() === 'admin';
  }

  isUser(): boolean {
    return this.getRole() === 'user';
  }

  logout() {
    localStorage.removeItem(this.tokenKey);
    this.router.navigate(['/login']);
  }

  getToken() {
    return localStorage.getItem('token');
  }

  isLoggedIn(): boolean {
    return !!this.getToken(); // True, ha van token
  }
}
