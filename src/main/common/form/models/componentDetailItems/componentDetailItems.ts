
export class ComponentDetailItems {
  title?: string;
  subtitle?: string;
  content?: string[];

  constructor(title?: string, subtitle?: string, content?: string[]) {
    this.title = title;
    this.subtitle = subtitle;
    this.content = content;
  }
}
