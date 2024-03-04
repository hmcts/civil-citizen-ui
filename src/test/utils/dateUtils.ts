export const getNextYearValue = (): number => {
  return new Date().getFullYear() + 1;
};

export const isTwentyNineLeapYear = (date: Date) => {
  const year = date.getFullYear();
  const isLeapYear = year % 4 === 0 && (year % 100 !== 0 || year % 400 === 0);
  return isLeapYear && date.getMonth() === 1 && date.getDate() === 29;
};

export const FIXED_DATE = new Date(2023, 3, 26);
export const FIXED_TIME_HOUR_MINUTE = '1000';

export const CURRENT_DATE = new Date();
export const CURRENT_DAY = CURRENT_DATE.getDate();
export const CURRENT_MONTH = CURRENT_DATE.getMonth() + 1;
export const CURRENT_YEAR = CURRENT_DATE.getFullYear();
