// src/types/editor.ts
import type { UnprivilegedEditor } from 'react-quill';

export interface QuillEditor extends UnprivilegedEditor {
  getText(): string;
  getFormat(index: number): any;
  deleteText(index: number, length: number): void;
  insertText(index: number, text: string, formats: any): void;
  getSelection(focus: boolean): { index: number; length: number };
  insertEmbed(index: number, type: string, url: string): void;
}

export interface ReactQuillType {
  getEditor(): QuillEditor;
}
