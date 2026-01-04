import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { NoteCard } from '../model/note-card';

@Injectable({
  providedIn: 'root',
})
export class NoteDataService {
  httpClient = inject(HttpClient);
  baseUrl = 'http://localhost:5264';

  getAllNoteCards() {
    return this.httpClient.get<NoteCard[]>(`${this.baseUrl}/api/notecards`);
  }

  addNoteCard(note: NoteCard) {
    return this.httpClient.put<NoteCard>(`${this.baseUrl}/api/notecards`, note);
  }

  deleteNoteCard(id: number) {
    return this.httpClient.delete(`${this.baseUrl}/api/notecards/${id}`);
  }
}
