/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
import { useCallback, useEffect } from 'react'
import useSWR from 'swr'
import { NotesResponse, NoteResponse } from '../../../backend/routes/notes'
import useWebSocket, { ReadyState } from 'react-use-websocket'
import { Descendant } from 'slate'

// If you want to use GraphQL API or libs like Axios, you can create your own fetcher function. 
// Check here for more examples: https://swr.vercel.app/docs/data-fetching
const fetcher = async (
  input: RequestInfo,
  init: RequestInit
) => {
  const res = await fetch(input, init)
  return res.json()
}

export const useNotesList = () => {
  const { data, error } = useSWR<NotesResponse>('http://localhost:3001/api/notes', fetcher)

  return {
    notesList: data?.notes,
    isLoading: !error && !data,
    isError: error,
  }
}

export const useNote = (id: string) => {
  const { readyState, lastMessage, sendMessage } = useWebSocket(`ws://localhost:3001/api/notes/${id}`)
  const note = lastMessage && JSON.parse(lastMessage.data) as NoteResponse

  // Send a message when ready on first load
  useEffect(() => {
    if (readyState === ReadyState.OPEN && lastMessage === null) {
      sendMessage('')
    }
  }, [readyState, lastMessage])

  const save = useCallback((content: Descendant[]) => sendMessage(JSON.stringify({ ...note, content })), [note])

  return {
    note,
    readyState,
    save,
  }
}