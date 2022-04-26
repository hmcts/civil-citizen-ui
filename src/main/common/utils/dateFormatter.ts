export class DateFormatter {

  static setDateFormat = (date:Date, lang: string, options: object) => {
    return date.toLocaleDateString(lang, options);
  };

  static setMonth = (date:Date, val: number) => {
    date.setMonth(date.getMonth() + val);
  };
}
