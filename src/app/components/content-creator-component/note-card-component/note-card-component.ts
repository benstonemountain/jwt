import { Component, inject, input } from '@angular/core';
import { NoteCard } from '../../../model/note-card';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';

@Component({
  selector: 'app-note-card-component',
  imports: [ReactiveFormsModule],
  templateUrl: './note-card-component.html',
  styleUrl: './note-card-component.css',
})
export class NoteCardComponent {

  // readonly noteCard = input<NoteCard>();
  formBuilder = inject(FormBuilder);

  noteForm = this.formBuilder.group({
    title: ['', [Validators.required]],
    text: ['', [Validators.required]],
  })

  onSave() {
   const title = this.noteForm.value.title;
   const noteByUser = this.noteForm.value.text;

   if(title && noteByUser) {
    console.log(title, noteByUser);
    
   }
  }



}
