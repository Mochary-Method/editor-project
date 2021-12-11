import React, { MouseEventHandler } from "react";
import { useSlate } from "slate-react";
import FormatBoldIcon from "@mui/icons-material/FormatBold";
import FormatItalicIcon from "@mui/icons-material/FormatItalic";
import FormatListBulletedIcon from "@mui/icons-material/FormatListBulleted";
import FormatListNumberedIcon from "@mui/icons-material/FormatListNumbered";
import FormatQuoteIcon from "@mui/icons-material/FormatQuote";
import FormatUnderlinedIcon from "@mui/icons-material/FormatUnderlined";
import CodeIcon from "@mui/icons-material/Code";
import ToggleButton from "@mui/material/ToggleButton";
import {
  toggleBlock,
  toggleMark,
  isBlockActive,
  isMarkActive,
} from "./helpers";
import { CustomElementType } from "./CustomElement";
import { CustomText } from "./CustomLeaf";

interface BlockButtonProps {
  format: CustomElementType;
  icon: React.ReactNode;
}

const BlockButton: React.FC<BlockButtonProps> = ({ format, icon }) => {
  const editor = useSlate();
  return (
    <ToggleButton
      size="small"
      value={format}
      aria-label={format}
      selected={isBlockActive(editor, format)}
      onMouseDown={(event) => {
        event.preventDefault();
        toggleBlock(editor, format);
      }}
    >
      {icon}
    </ToggleButton>
  );
};

interface MarkButtonProps {
  format: keyof CustomText;
  icon: React.ReactNode;
}

const MarkButton: React.FC<MarkButtonProps> = ({ format, icon }) => {
  const editor = useSlate();
  return (
    <ToggleButton
      size="small"
      value={format}
      aria-label={format}
      disableRipple={true}
      selected={isMarkActive(editor, format)}
      onMouseDown={(event) => {
        event.preventDefault();
        toggleMark(editor, format);
      }}
    >
      {icon}
    </ToggleButton>
  );
};

export const EditorToolbar: React.FC = () => {
  return (
    <div>
      <MarkButton format="bold" icon={<FormatBoldIcon />} />
      <MarkButton format="italic" icon={<FormatItalicIcon />} />
      <MarkButton format="underline" icon={<FormatUnderlinedIcon />} />
      <MarkButton format="code" icon={<CodeIcon />} />
      <BlockButton format={CustomElementType.headingOne} icon="h1" />
      <BlockButton format={CustomElementType.headingTwo} icon="h2" />
      <BlockButton
        format={CustomElementType.blockQuote}
        icon={<FormatQuoteIcon />}
      />
      <BlockButton
        format={CustomElementType.bulletedList}
        icon={<FormatListBulletedIcon />}
      />
      <BlockButton
        format={CustomElementType.numberedList}
        icon={<FormatListNumberedIcon />}
      />
    </div>
  );
};
