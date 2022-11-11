// @refresh reset // Fixes hot refresh errors in development https://github.com/ianstormtaylor/slate/issues/3477

import React, { useCallback, useMemo, useState, useRef, useEffect } from 'react'
import { createEditor, Descendant, BaseEditor, Transforms, Operation } from 'slate'
import { withHistory, HistoryEditor } from 'slate-history'
import { handleHotkeys, withLinks, withHtml } from './helpers';

import { Editable, withReact, Slate, ReactEditor } from 'slate-react' 
import { EditorToolbar } from './EditorToolbar'
import { CustomElement } from './CustomElement'
import { CustomLeaf, CustomText } from './CustomLeaf'

// Import the core binding
import { withYjs, slateNodesToInsertDelta, YjsEditor, withYHistory } from '@slate-yjs/core';

// Import yjs
import * as Y from 'yjs';

import io from "socket.io-client"; 

const socket = io("http://localhost:3001");

// Slate suggests overwriting the module to include the ReactEditor, Custom Elements & Text
// https://docs.slatejs.org/concepts/12-typescript
declare module 'slate' {
  interface CustomTypes {
    Editor: BaseEditor & ReactEditor & HistoryEditor
    Element: CustomElement
    Text: CustomText
  }
}

interface EditorProps {
  initialValue?: Descendant[];
  placeholder?: string;
  docId?: string;
}

export const Editor: React.FC<EditorProps> = ({ initialValue = [], placeholder, docId }) => {

  // Create a yjs document and get the shared type
  const sharedType = useMemo(() => {
    const yDoc = new Y.Doc();
    const sharedType = yDoc.get("content", Y.XmlText);
    // @ts-ignore Load the initial value into the yjs document
    sharedType.applyDelta(slateNodesToInsertDelta(initialValue));
    return sharedType;
  }, [])

  //Setup binding
  const editor = useMemo(() => 
    //@ts-ignore
    withHtml(withLinks(withHistory(withReact(withYHistory(withYjs(createEditor(), sharedType)))))), 
  []);

  const renderElement = useCallback(props => <CustomElement {...props} />, []);
  const renderLeaf = useCallback(props => <CustomLeaf {...props} />, []);
  const [value, setValue] = useState<Array<Descendant>>([]);
  const remote = useRef(false);
  const socketchange = useRef(false);
  const [saved, setSaved] = useState<boolean>(true); 

  // Connect editor in useEffect to comply with concurrent mode requirements.
  useEffect(() => {
    //@ts-ignore
    YjsEditor.connect(editor);

    //@ts-ignore
    return () => YjsEditor.disconnect(editor);
  }, [editor]) 

  //Apply changes from remote docs
  useEffect(() => {
    socket.emit('join', docId);

    socket.on(`text-changed`, ({ newValue }: any) => {
      remote.current = true;
      // ops.forEach((op: any) => editor.apply(op));

      // Get initial total nodes to prevent deleting affecting the loop
      let totalNodes = editor.children.length;

      // No saved content, don't delete anything to prevent errors
      if (newValue?.length) {

        // Remove every node except the last one
        // Otherwise SlateJS will return error as there's no content
        for (let i = 0; i < totalNodes - 1; i++) {
            console.log(i)
            Transforms.removeNodes(editor, {
                at: [totalNodes-i-1],
            });
        }

        // Add content to SlateJS
        for (const val of newValue ) {
            Transforms.insertNodes(editor, val, {
                at: [editor.children.length],
            });
        }

        // Remove the last node that was leftover from before
        Transforms.removeNodes(editor, {
            at: [0],
        });
      }

        remote.current = false;
        socketchange.current = true;
    });

    socket.on(`failed`,()=>{
      console.log('failed');
    });

    return () => {
      socket.off(`text-changed`);
      socket.off(`failed`);
    };
    
  }, [docId]);

  return (
    <Slate editor={editor} value={value} onChange={value => {
      setValue(value);
      
      const ops = editor.operations.filter((op: any) => {
        if(op){
          return op.type !== "set_selection"
        }

        return false;
      });

      //emit changes when user performs an operation on the editor
      if (ops.length && !remote.current && !socketchange.current) {
        console.log("value is: ", sharedType, value)
        socket.emit("text-changed", {
          newValue: value,
          docId,
          ops
        });
      }

      socketchange.current = false;
    }}>
      <EditorToolbar />
      <Editable
        renderElement={renderElement}
        renderLeaf={renderLeaf}
        placeholder={placeholder}
        onKeyDown={handleHotkeys(editor)}

        // The dev server injects extra values to the editr and the console complains
        // so we override them here to remove the message
        autoCapitalize="false"
        autoCorrect="false"
        spellCheck="false"
      />
    </Slate>
  )
}

