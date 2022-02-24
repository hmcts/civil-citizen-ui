
export class FindOut {
  title?: string;
  subtitle?: string;
  content?: string[];


  constructor(title?: string, subtitle?: string, content?: string[]) {
    this.title = title;
    this.subtitle = subtitle;
    this.content = content;
  }
}
