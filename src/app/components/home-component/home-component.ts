import { Component, inject } from '@angular/core';
import { AuthService } from '../../services/auth.service';
import { Header } from "../header/header";

@Component({
  selector: 'app-home-component',
  imports: [Header],
  templateUrl: './home-component.html',
  styleUrl: './home-component.css',
})
export class HomeComponent {

    authService = inject(AuthService);

  logout() {
    this.authService.logout();
  }

}
