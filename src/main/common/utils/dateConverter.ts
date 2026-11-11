export class DateConverter {
  /**
   * Converts the string fields entered in the Date fields to a dd-mm-yyyy Date format if the fields entered correspond to a valid Date
   */
  static convertToDate(year?: string, month?: string, day?: string): Date | undefined {
    if (year && month && day) {
      const date = new Date(year + '-' + month + '-' + day);
      if (date.getDate() !== Number(day)) {
        return new Date('Invalid Date');
      }
      return date;
    }
    return undefined;
  }
}

