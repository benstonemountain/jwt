import { Component, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { Router, RouterLink } from '@angular/router';

export interface FormInfos {
  username: string;
  password: string;
}

@Component({
  selector: 'app-register-component',
  imports: [ReactiveFormsModule, RouterLink],
  templateUrl: './register-component.html',
  styleUrl: './register-component.css',
})
export class RegisterComponent {
  formBuilder = inject(FormBuilder);
  authService = inject(AuthService);
  router = inject(Router);

  registerForm = this.formBuilder.group({
    username: ['', Validators.required],
    password: ['', [Validators.required, Validators.minLength(4)]],
  });

  onSubmit() {
    if (this.registerForm.valid) {
      const username = this.registerForm.value.username;
      const password = this.registerForm.value.password;

      if (username && password) {
        const formInfos: FormInfos = { username, password };
        console.log(formInfos);

        this.authService.register(formInfos).subscribe({
          next: () => {
            this.router.navigate(['/home']);
          },
          error: () => alert('Hiba történt a regisztrációkor.'),
        });
      }
    }
  }
}
