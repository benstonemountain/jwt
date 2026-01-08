import { inject, Injectable, signal, WritableSignal } from '@angular/core';
import { map, Subject, tap } from 'rxjs';
import { NoteCard } from '../model/note-card';
import { NoteDataService } from './note-data-service';

@Injectable({
  providedIn: 'root',
})
export class NoteStateService {
  private noteCardEmitter: WritableSignal<NoteCard[]> = signal([]);
  //private: módosíthatom, de nem tudom elérni kívülről 
  readonly noteCards = this.noteCardEmitter.asReadonly();
  //readonly signal: bár kívülről elérhetem (ezt fogom átadni a komponensnek), de módosítani nem tudom

  noteDataService = inject(NoteDataService);

  fetchAllNoteCards() {
    this.noteDataService.getAllNoteCards().subscribe({
      next: (response: NoteCard[]) => {
        console.log(response);
        this.noteCardEmitter.set(response);
      },
      error: (err) => {
        console.log(err);
      },
    });
  }

    /* Új noteCard léttehozása frontenden*/
  createFrontendNote() {
    const newNote: NoteCard = {
      id: this.generateTempId(),
      title: '',
      note: '',
      isNew: true,
    };

    this.noteCardEmitter.update((cards) => [...cards, newNote]);
  }

  //minden kértyának egyedi id generálás frontend oldalon
    private generateTempId(): number {
    const cards = this.noteCardEmitter();
    return cards.length === 0
      ? 1
      : Math.max(...cards.map((c) => c.id)) + 1;
  }

    /*TÖRLÉS - kétféleképpen lehet:*/
  deleteNote(note: NoteCard) {
  // 1. ha úgy törlöm, hogy még nincs elmentve backendre
  if (note.isNew) {
    this.noteCardEmitter.update((cards) =>
      cards.filter((c) => c.id !== note.id)
    );
    return;
  }

  // 2. ha már backenden tárolt kártyát törlök 
  this.noteDataService.deleteNoteCard(note.id).subscribe({
    next: () => {
      this.fetchAllNoteCards();
    },
    error: console.error,
  });
  }

    /* Mentés gomb */
  saveNote(note: NoteCard) {
    const payload = { ...note };
    delete payload.isNew;

    console.log(payload);
    
//a komponensben iratkozok fel, hogy ha akarok
// üzenetet, figyelmeztetést az UI-ra, az ott legyen, és ne itt a service-ben
  return this.noteDataService.addNoteCard(payload).pipe(
    tap(() => this.fetchAllNoteCards()),
    // map(() => void 0)
  );
  }
}
