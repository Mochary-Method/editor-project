import { Transforms, CustomTypes, BaseEditor } from 'slate'
import { jsx } from "slate-hyperscript"
import { CustomElement } from "./CustomElement"

// adapted from https://github.com/ianstormtaylor/slate/blob/main/site/examples/paste-html.tsx

const ELEMENT_TAGS = {
    A: (el: HTMLElement) => ({ type: "link", url: el.getAttribute("href") }),
    BLOCKQUOTE: () => ({ type: "quote" }),
    H1: () => ({ type: "heading-one" }),
    H2: () => ({ type: "heading-two" }),
    H3: () => ({ type: "heading-three" }),
    H4: () => ({ type: "heading-four" }),
    H5: () => ({ type: "heading-five" }),
    H6: () => ({ type: "heading-six" }),
    IMG: (el: HTMLElement) => ({ type: "image", url: el.getAttribute("src") }),
    LI: () => ({ type: "list-item" }),
    OL: () => ({ type: "numbered-list" }),
    P: () => ({ type: "paragraph" }),
    PRE: () => ({ type: "code" }),
    UL: () => ({ type: "bulleted-list" }),
} as const

// COMPAT: `B` is omitted here because Google Docs uses `<b>` in weird ways.
const TEXT_TAGS = {
    CODE: () => ({ code: true }),
    DEL: () => ({ strikethrough: true }),
    EM: () => ({ italic: true }),
    I: () => ({ italic: true }),
    S: () => ({ strikethrough: true }),
    STRONG: () => ({ bold: true }),
    U: () => ({ underline: true }),
} as const

const deserialize = (el: Node): any => {
    if (el.nodeType === 3) {
        return el.textContent
    } else if (el.nodeType !== 1) {
        return null
    } else if (el.nodeName === "BR") {
        return "\n"
    }

    const { nodeName } = el
    let parent = el

    if (
        nodeName === "PRE" &&
        el.childNodes[0] &&
        el.childNodes[0].nodeName === "CODE"
    ) {
        parent = el.childNodes[0]
    }
    let children = Array.from(parent.childNodes).map(deserialize).flat()

    if (children.length === 0) {
        children = [{ text: "" }]
    }

    if (el.nodeName === "BODY") {
        return jsx("fragment", {}, children)
    }

    const elementNodeName = nodeName as keyof typeof ELEMENT_TAGS
    if (ELEMENT_TAGS[elementNodeName]) {
        const attrs = ELEMENT_TAGS[elementNodeName](el as HTMLElement)
        return jsx("element", attrs, children)
    }

    const textNodeName = nodeName as keyof typeof TEXT_TAGS
    if (TEXT_TAGS[textNodeName]) {
        const attrs = TEXT_TAGS[textNodeName]()
        return children.map((child) => jsx("text", attrs, child))
    }

    return children
}

export const withHtml = (editor: CustomTypes["Editor"]): CustomTypes["Editor"] => {
    const { insertData, isInline } = editor

    editor.isInline = (element: CustomElement) => {
        return element.type === "link" ? true : isInline(element)
    }

    editor.insertData = (data) => {
        const html = data.getData("text/html")

        if (html) {
            const parsed = new DOMParser().parseFromString(html, "text/html")
            const fragment = deserialize(parsed.body)
            Transforms.insertFragment(editor, fragment)
            return
        }

        insertData(data)
    }

    return editor
}
