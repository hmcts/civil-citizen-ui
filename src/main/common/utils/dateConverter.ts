export class DateConverter {
  /**
   * Converts the string fields entered in the Date fields to a dd-mm-yyyy Date format if the fields entered correspond to a valid Date
   */
  static validDate(year: string, month: string, day: string) {
    const dob = new Date(year + '-' + month + '-' + day);
    const dobDay = Number(day);
    if ((dob.getDate() == dobDay)) {
      return dob;
    }
    return null;
  }
}
