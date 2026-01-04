import { Component, EventEmitter, inject, input, Output } from '@angular/core';
import { NoteCard } from '../../../model/note-card';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { AuthService } from '../../../services/auth.service';

@Component({
  selector: 'app-note-card-component',
  imports: [ReactiveFormsModule],
  templateUrl: './note-card-component.html',
  styleUrl: './note-card-component.css',
})
export class NoteCardComponent {
  readonly noteCard = input.required<NoteCard>();
  formBuilder = inject(FormBuilder);

  @Output() save = new EventEmitter<NoteCard>();
  @Output() delete = new EventEmitter<NoteCard>();

  authService = inject(AuthService);

  get canEdit(): boolean {
    return this.authService.isAdmin();
  }

  noteForm = this.formBuilder.group({
    title: [{ value: "", disabled: !this.canEdit }, [Validators.required]],
    text: [{ value: "", disabled: !this.canEdit }, [Validators.required]],
  });

  ngOnInit() {
    const note = this.noteCard();
    this.noteForm.patchValue({
      title: note?.title,
      text: note?.note,
    });
  }

  onSave() {
    const title = this.noteForm.value.title;
    const noteByUser = this.noteForm.value.text;

    if (title && noteByUser) {
      this.save.emit({
        ...this.noteCard(),
        title: title,
        note: noteByUser,
      });
    }
  }

  onDelete() {
    this.delete.emit(this.noteCard());
  }
}
