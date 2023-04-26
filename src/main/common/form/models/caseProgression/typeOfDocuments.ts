
export class Hint{
  text?: string;

  constructor(text?: string) {
    this.text = text;
  }
}

export class TypeOfDocumentsItems {
  value: string;
  text: string;
  hint?: Hint;

  constructor(value: string, text: string, hint?: Hint) {
    this.value = value;
    this.text = text;
    this.hint = hint;
  }
}

