import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Router } from '@angular/router';
import { tap } from 'rxjs';
import { FormInfos } from '../components/register-component/register-component';

@Injectable({
	providedIn: 'root',
})
export class AuthService {
	private http = inject(HttpClient);
	private router = inject(Router);
	private apiUrl = 'http://localhost:5264/api/auth';

	// Mivel a token a sütiben van, csak a szerepkört tároljuk a localStorage-ben a UI-hoz
	private roleKey = 'userRole';

	/**
	 * LOGIN
	 * Fontos: withCredentials: true kell, hogy a böngésző elmentse a sütit!
	 */
	login(credentials: FormInfos) {
		return this.http
			.post<{ message: string; userRole: string }>(
				`${this.apiUrl}/login`,
				credentials,
				{
					withCredentials: true, // KÖTELEZŐ a sütik kezeléséhez
				},
			)
			.pipe(
				tap((response) => {
					// A tokent NEM mentjük, mert nincs a válaszban (sütiben utazik)
					// Csak a role-t mentjük el, hogy tudjuk, mit mutassunk a menüben
					localStorage.setItem(this.roleKey, response.userRole);

					// Opcionálisan elmenthetjük a user adatait is, ha a backend küldi
					localStorage.setItem(
						'currentUser',
						JSON.stringify({ id: credentials.username }),
					);

					console.log('Sikeres belépés. A token HttpOnly sütiben tárolódik.');
				}),
			);
	}

	/**
	 * REGISTER
	 */
	register(credentials: FormInfos) {
		return this.http
			.post<{ message: string; userRole: string }>(
				`${this.apiUrl}/register`,
				credentials,
				{
					withCredentials: true,
				},
			)
			.pipe(
				tap((response) => {
					localStorage.setItem(this.roleKey, response.userRole);
				}),
			);
	}

	/**
	 * SZEREPKÖR LEKÉRÉSE
	 * Most már nem a tokenből bányásszuk ki, hanem a mentett stringből
	 */
	getRole(): string | null {
		return localStorage.getItem(this.roleKey);
	}

	isAdmin(): boolean {
		return this.getRole() === 'admin';
	}

	/**
	 * LOGOUT
	 *
	 */
	logout() {
		// 1. Szólunk a szervernek, hogy semmisítse meg a sütit
		this.http
			.post(`${this.apiUrl}/logout`, {}, { withCredentials: true })
			.subscribe({
				next: () => {
					// 2. Ha a szerver végzett, mi is kitakarítunk a localStorage-ból
					localStorage.clear();
					this.router.navigate(['/login']);
				},
				error: (err) => {
					console.error('Hiba a kijelentkezéskor', err);
					// Hiba esetén is érdemes takarítani és elnavigálni
					localStorage.clear();
					this.router.navigate(['/login']);
				},
			});
	}

	/**
	 * BEJELENTKEZÉS ÁLLAPOTA
	 * Mivel a sütit nem látjuk, arra hagyatkozunk, hogy van-e mentett role
	 */
	isLoggedIn(): boolean {
		return !!this.getRole();
	}
}
