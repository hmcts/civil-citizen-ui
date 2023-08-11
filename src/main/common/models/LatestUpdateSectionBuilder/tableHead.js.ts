export class TableHead {
  text: string;
  classes?: string;

  constructor(text: string, classes?: string)
  {
    this.text = text;
    this.classes = classes;
  }
}
