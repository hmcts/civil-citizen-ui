export class DateConverter {
  /**
   * Converts the string fields entered in the Date fields to a dd-mm-yyyy Date format if the fields entered correspond to a valid Date
   */
  static convertToDate(year: string, month: string, day: string) {
    let date: Date;
    let givenDay: number;
    if (year && month && day) {
      date = new Date(year + '-' + month + '-' + day);
      givenDay = Number(day);
      if (date.getDate() !== givenDay) {
        return new Date('Invalid Date');
      }
    }
    return date;
  }
}

