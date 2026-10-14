/** Editor de código do notebook (CodeMirror 6) com o tema escuro e a linguagem certa. */
import { css } from '@codemirror/lang-css';
import { html } from '@codemirror/lang-html';
import { javascript } from '@codemirror/lang-javascript';
import { EditorState } from '@codemirror/state';
import { oneDark } from '@codemirror/theme-one-dark';
import { EditorView } from '@codemirror/view';
import { basicSetup } from 'codemirror';

export type EditorLanguage = 'js' | 'ts' | 'html' | 'css';

function languageExtension(language: EditorLanguage) {
  switch (language) {
    case 'js':
      return javascript();
    case 'ts':
      return javascript({ typescript: true });
    case 'html':
      return html();
    case 'css':
      return css();
  }
}

export function createEditor(
  parent: HTMLElement,
  options: { doc: string; language: EditorLanguage; readOnly: boolean; onChange?: (doc: string) => void },
): EditorView {
  return new EditorView({
    parent,
    state: EditorState.create({
      doc: options.doc,
      extensions: [
        basicSetup,
        oneDark,
        languageExtension(options.language),
        EditorState.tabSize.of(2),
        EditorState.readOnly.of(options.readOnly),
        EditorView.editable.of(!options.readOnly),
        EditorView.updateListener.of((update) => {
          if (update.docChanged) options.onChange?.(update.state.doc.toString());
        }),
      ],
    }),
  });
}
