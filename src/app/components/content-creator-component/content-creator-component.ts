import { Component, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { NoteCardComponent } from "./note-card-component/note-card-component";
import { NoteCard } from '../../model/note-card';

@Component({
  selector: 'app-content-creator-component',
  imports: [RouterLink, NoteCardComponent],
  templateUrl: './content-creator-component.html',
  styleUrl: './content-creator-component.css',
})
export class ContentCreatorComponent {

  noteCards = signal<NoteCard[]>([]);


    addNote() {
    const newNote: NoteCard = {
      title: '',
      note: '',
    };

    this.noteCards.update(cards => [...cards, newNote]);
  }

}
