class DateUtilsComponent {

  static getDate() {
    let currentTime = new Date();
    return currentTime;
  }

  static formatClaimReferenceToADisplayFormat(claimReference) {
    return claimReference.toString().replace(/\d{4}(?=.)/g, '$& ');
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
    let presentDay = year + "-" + month + "-" + day + "-" + hour + "-" + minutes;
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
        weekend = yyyy + "-" + mm + "-" + dd;
        break;

      case 2:
        targetDate.setDate(targetDate.getDate() + 5);
        dd = targetDate.getDate();
        mm = targetDate.getMonth() + 1;
        yyyy = targetDate.getFullYear();
        weekend = yyyy + "-" + mm + "-" + dd;
        break;

      case 3:
        targetDate.setDate(targetDate.getDate() + 4);
        dd = targetDate.getDate();
        mm = targetDate.getMonth() + 1;
        yyyy = targetDate.getFullYear();
        weekend = yyyy + "-" + mm + "-" + dd;
        break;

      case 4:
        targetDate.setDate(targetDate.getDate() + 2);
        dd = targetDate.getDate();
        mm = targetDate.getMonth() + 1;
        yyyy = targetDate.getFullYear();
        weekend = yyyy + "-" + mm + "-" + dd;
        break;

      case 5:
        targetDate.setDate(targetDate.getDate() + 2);
        dd = targetDate.getDate();
        mm = targetDate.getMonth() + 1;
        yyyy = targetDate.getFullYear();
        weekend = yyyy + "-" + mm + "-" + dd;
        break;

      default:
        console.log("please enter the correct date");
        break;
    }

    return weekend;
  }

}

const dateToday = DateUtilsComponent.formatClaimReferenceToADisplayFormat('1686657115832590');
console.log('There is a date Today : ' + dateToday);
module.exports = {DateUtilsComponent};
