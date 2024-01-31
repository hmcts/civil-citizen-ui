class DateUtilsComponent {

  static getDate() {
    let currentTime = new Date();
    return currentTime;
  }

  static formatClaimReferenceToAUIDisplayFormat(claimReference) {
    return claimReference.toString().replace(/\d{4}(?=.)/g, '$& ');
  }

  static rollDateToCertainWeeks(numWeeks) {
    let currentDate = new Date();
    return new Date(currentDate.setDate(currentDate.getDate() + numWeeks * 7));
  }

  static rollWeekendDayToNextWorkingDay(date) {
    switch (date.getDay()) {
      case 0: //Sunday
        date.setDate(date.getDate() + 1);
        break;
      case 6: //Saturday
        date.setDate(date.getDate() + 2);
        break;
      default:
    }
  }

  static formatDateToSpecifiedDateTimeFormat(date) {
    return date.toLocaleString('en-GB', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: 'numeric',
      minute : 'numeric',
    });
  }

  static formatDateToYYYYMMDD (date) {
    return date.toISOString().substring(0,10);
  }

  static formatDateToSpecifiedDateFormat(date) {
    return date.toLocaleString('en-GB', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  }

  static checkWeekend(date) {
    switch (date.getDay()) {
      case 0: //Sunday
        return true;
      case 6: //Saturday
        return true;
      default:
    }
    return false;
  }

  static async getCurrentDate() {
    const tomorrow = new Date();
    tomorrow.setDate(new Date().getDate() + 1);
    return tomorrow.getDate();
  }

  static async getCurrentMonth() {
    const tomorrow = new Date();
    tomorrow.setDate(new Date().getDate() + 1);
    let currentMonth = tomorrow.getMonth() + 1;
    return currentMonth;
  }

  static async getCurrentYear() {
    let currentTime = new Date();
    let year = currentTime.getFullYear();
    return year;
  }

  static async getCurrentDay() {
    let currentTime = new Date();
    let month = currentTime.getMonth() + 1;
    let day = currentTime.getDate();
    let year = currentTime.getFullYear();
    let hour = currentTime.getHours();
    let minutes = currentTime.getMinutes();
    let presentDay = year + '-' + month + '-' + day + '-' + hour + '-' + minutes;
    return presentDay;
  }

  static async isWeekend() {
    let targetDate = new Date();
    let weekend, dd, mm, yyyy;

    switch (targetDate.getDay()) {
      case 0:
        weekend = targetDate;
        break;

      case 1:
        targetDate.setDate(targetDate.getDate() + 5);
        dd = targetDate.getDate();
        mm = targetDate.getMonth() + 1;
        yyyy = targetDate.getFullYear();
        weekend = yyyy + '-' + mm + '-' + dd;
        break;

      case 2:
        targetDate.setDate(targetDate.getDate() + 5);
        dd = targetDate.getDate();
        mm = targetDate.getMonth() + 1;
        yyyy = targetDate.getFullYear();
        weekend = yyyy + '-' + mm + '-' + dd;
        break;

      case 3:
        targetDate.setDate(targetDate.getDate() + 4);
        dd = targetDate.getDate();
        mm = targetDate.getMonth() + 1;
        yyyy = targetDate.getFullYear();
        weekend = yyyy + '-' + mm + '-' + dd;
        break;

      case 4:
        targetDate.setDate(targetDate.getDate() + 2);
        dd = targetDate.getDate();
        mm = targetDate.getMonth() + 1;
        yyyy = targetDate.getFullYear();
        weekend = yyyy + '-' + mm + '-' + dd;
        break;

      case 5:
        targetDate.setDate(targetDate.getDate() + 2);
        dd = targetDate.getDate();
        mm = targetDate.getMonth() + 1;
        yyyy = targetDate.getFullYear();
        weekend = yyyy + '-' + mm + '-' + dd;
        break;

      default:
        console.log('please enter the correct date');
        break;
    }

    return weekend;
  }

}

const fourWeeksFroToday = DateUtilsComponent.rollDateToCertainWeeks(4);
console.log('There are 4 weeks fro Today : ' + DateUtilsComponent.formatDateToYYYYMMDD(fourWeeksFroToday));
module.exports = {DateUtilsComponent};
