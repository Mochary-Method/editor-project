import { createContext } from 'react';

export const NoteContext = createContext({
  noteContent: [],
  updateNoteContent: (data: any) => {}
});
