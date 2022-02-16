export class HtmlConverter {

  /**
   * Converts HTML form field in `foo[bar]` format to property in `foo.bar` format.
   */
  static asProperty(fieldName: string): string {
    return fieldName.replace(/\[/g, '.').replace(/]/g, '');
  }

  /**
   * Converts property in `foo.bar` format to HTML form field name in `foo[bar]` format.
   */
  static asFieldName(property: string): string {
    const parts: string[] = property.split('.');
    return parts[0] + parts.slice(1).map((part: string) => `[${part}]`).join('');
  }
}
