import { Component, inject, Signal, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { NoteCardComponent } from './note-card-component/note-card-component';
import { NoteCard } from '../../model/note-card';
import { NoteStateService } from '../../services/note-state-service';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-content-creator-component',
  imports: [RouterLink, NoteCardComponent],
  templateUrl: './content-creator-component.html',
  styleUrl: './content-creator-component.css',
})
export class ContentCreatorComponent {
  noteStateService = inject(NoteStateService);
  authService = inject(AuthService);
  noteCards = this.noteStateService.noteCards;

  isAddCardButtonEnabled!: boolean;
 
  ngOnInit() {
    this.noteStateService.fetchAllNoteCards();
    this.isAddCardButtonEnabled = this.authService.isAdmin();


  }

  addNote() {
    this.noteStateService.createFrontendNote();
    this.isAddCardButtonEnabled = false;
  }

  onDelete(note: NoteCard) {
    this.noteStateService.deleteNote(note);
  }

  onSave(note: NoteCard) {
    this.noteStateService.saveNote(note).subscribe({
      next: () => alert('Sikeres mentés!'),
      error: () => alert('Mentés sikertelen!'),
    });
    this.isAddCardButtonEnabled = true;
  }
}
