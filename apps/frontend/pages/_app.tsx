import Head from 'next/head'
import type { AppProps } from 'next/app'
import CssBaseline from '@mui/material/CssBaseline'
import { NoteContext } from '../src/notes/noteContext'
import { useState } from 'react'

function MyApp({ Component, pageProps }: AppProps) {
  const [ noteContent, setNoteContent ] = useState()
  const updateNoteContent = (data: any) => setNoteContent(data)
  const value: any = {
    noteContent,
    updateNoteContent
  }

  return (
    <>
      <Head>
        <meta name="viewport" content="initial-scale=1, width=device-width" />
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css?family=Roboto:300,400,500,700&display=swap"
        />
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/icon?family=Material+Icons"
        />
      </Head>
      <CssBaseline />

      <NoteContext.Provider value={value}>
          <Component {...pageProps} />
      </NoteContext.Provider>
    </>
  )
}
export default MyApp
