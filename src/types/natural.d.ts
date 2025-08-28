// src/types/natural.d.ts
declare module 'natural' {
  export class WordTokenizer {
    tokenize(text: string): string[];
  }

  export class TfIdf {
    addDocument(tokens: string[]): void;
    listTerms(documentIndex: number): Array<{ term: string; tfidf: number }>;
  }
}
