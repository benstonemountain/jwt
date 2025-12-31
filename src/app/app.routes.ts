import { Routes } from '@angular/router';
import { LoginComponent } from './components/login-component/login-component';
import { RegisterComponent } from './components/register-component/register-component';
import { authGuard } from './routes/route.guard';
import { HomeComponent } from './components/home-component/home-component';

export const routes: Routes = [
    { path: '', redirectTo: 'login', pathMatch: 'full' },
    { path: 'home', component: HomeComponent, canActivate: [authGuard] }, 
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },
];
