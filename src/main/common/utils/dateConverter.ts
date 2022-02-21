export class DateConverter {
  /**
   * Converts the string fields entered in the Date fields to a dd-mm-yyyy Date format if the fields entered correspond to a valid Date
   */
  static convertToDate(year: string, month: string, day: string) {
    const date = new Date(year + '-' + month + '-' + day);
    const givenDay = Number(day);
    if ((date.getDate() == givenDay)) {
      return date;
    }
    return null;

  }
}
