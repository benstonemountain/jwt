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
	 * REGISTER
	 * A sütibe kerül a jwt, a frontend kód pedig nem tud belenézni a sütibe
	 * a userRole az Angularnak kell, hogy frontenden tudjuk kezelni, hogy valaki admin vagy sima user
	 * a message nem is kell igazából
	 * FONTOS! Az, hogy én mit várok a backendtől, azt meg kell beszélnek a backendessel; jelenleg úgy van megírva a backend,
	 * hogy visszaküldjön egy mesage-t, meg a user role:
	 * return Ok(new { message = "Sikeres regisztráció", userRole = request.Role });
	 */
	register(credentials: FormInfos) {
		return (
			this.http
				// A generikusban mondom meg az Angularnak, mire számítson a backendtől:
				.post<{ message: string; userRole: string }>(
					`${this.apiUrl}/register`,
					credentials,
					{
						//ez engedélyezi a böngészőnek, hogy a szervertől érkező új sütit befogadja és elmentse
						//ha ez nem lenne, a böngésző nem mentené el a tokent a sütibe
						withCredentials: true,
					},
				)
				.pipe(
					tap((response) => {
						//kiveszi a szerver válaszából a szerepkört (admin vagy user) és elmenti a localStorage-ba
						localStorage.setItem(this.roleKey, response.userRole);
					}),
				)
		);
	}

	/* LOGIN
	Fontos: withCredentials: true kell, hogy a böngésző elmentse a sütit!
	 */
	login(credentials: FormInfos) {
		return this.http
			.post<{ message: string; userRole: string }>(
				`${this.apiUrl}/login`,
				credentials,
				{
					//HttpOnly Cookie-s megoldás eseténe ez engedélyezi a böngészőnek, hogy a szervertől érkező új sütit befogadja és elmentse
					//ha ez nem lenne, a böngésző nem mentené el a tokent a sütibe
					withCredentials: true,
				},
			)
			.pipe(
				tap((response) => {
					// A tokent NEM mentjük, mert nincs a válaszban (sütiben utazik)
					// Csak a role-t mentjük el, hogy tudjuk, mit mutassunk a menüben
					localStorage.setItem(this.roleKey, response.userRole);

					// Opcionálisan elmenthetjük a user adatait is a localStorage-be, ha a backend küldi
					localStorage.setItem(
						'currentUser',
						//a JSON.stringify: Azért kell, mert a localStorage csak szöveget tud tárolni
						JSON.stringify({ id: credentials.username }),
					);

					console.log('Sikeres belépés. A token HttpOnly sütiben tárolódik.');
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

	/*LOGOUT*/
	logout() {
		// 1. Szólunk a szervernek, hogy semmisítse meg a sütit
		this.http
		//Mivel kijelentkezéskor nem küldünk adatot (nem kell felhasználónév vagy jelszó), de a post metódus elvárja, hogy legyen ott valami, egy üres objektumot {} adunk át az url után:
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
