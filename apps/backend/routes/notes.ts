import express, { RequestHandler, Response } from 'express'
import { WebsocketRequestHandler } from 'express-ws'
import { Descendant } from 'slate'
import db from '../firebase'

// Patch `express.Router` to support `.ws()` without needing to pass around a `ws`-ified app.
// https://github.com/HenningM/express-ws/issues/86
// eslint-disable-next-line @typescript-eslint/no-var-requires
const patch = require('express-ws/lib/add-ws-method')
patch.default(express.Router)

const router = express.Router()

export interface NotesResponse {
  notes: Array<{
    id: string
    title: string
  }>
}

export interface NoteResponse {
  id: string
  title: string
  content: Descendant[]
}

const notesHandler: RequestHandler = (_req, res: Response<NotesResponse>) => {
  db.collection('notes').get().then(
    (querySnapshot) => {
      res.json({
        notes: querySnapshot.docs.map(doc => ({ id: doc.id, title: doc.get('title') }))
      })
    }
  )
}

const noteHandler: WebsocketRequestHandler = (ws, req) => {
  ws.on('message', async (msg) => {
    const doc = db.doc(`notes/${req.params.id}`)
    if (msg) {
      const note = {
        id: req.params.id,
        ...JSON.parse(msg.toString())
      }
      doc.set(note)

    }
    const docSnapshot = await doc.get()
    return ws.send(JSON.stringify(docSnapshot.data()))
  })
}

router.get('/', notesHandler)
router.ws('/:id', noteHandler)

export default router