// @refresh reset // Fixes hot refresh errors in development https://github.com/ianstormtaylor/slate/issues/3477

import React, { useCallback, useMemo, useState } from "react";
import { createEditor, Descendant, BaseEditor } from "slate";
import { withHistory, HistoryEditor } from "slate-history";
import { withHtml } from "./withHtml";
import { handleHotkeys } from "./helpers";

import { Editable, withReact, Slate, ReactEditor } from "slate-react";
import { EditorToolbar } from "./EditorToolbar";
import { CustomElement } from "./CustomElement";
import { CustomLeaf, CustomText } from "./CustomLeaf";

// Slate suggests overwriting the module to include the ReactEditor, Custom Elements & Text
// https://docs.slatejs.org/concepts/12-typescript
declare module "slate" {
  interface CustomTypes {
    Editor: BaseEditor & ReactEditor & HistoryEditor;
    Element: CustomElement;
    Text: CustomText;
  }
}

interface EditorProps {
  initialValue?: Descendant[];
  placeholder?: string;
  onChange: (value: Descendant[]) => void;
}

export const Editor: React.FC<EditorProps> = ({
  initialValue = [],
  placeholder,
  onChange,
}) => {
  const [value, setValue] = useState<Descendant[]>(initialValue);
  const renderElement = useCallback(
    (props) => <CustomElement {...props} />,
    []
  );
  const renderLeaf = useCallback((props) => <CustomLeaf {...props} />, []);
  const editor = useMemo(
    () => withHtml(withReact(withHistory(createEditor()))),
    []
  );

  return (
    <Slate
      editor={editor}
      value={value}
      onChange={(value) => {
        setValue(value);
        onChange(value);
      }}
    >
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
  );
};
