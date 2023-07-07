import {DateTime} from 'luxon';

const FIVE_DAYS = 5;
const SIX_DAYS = 6;
const FOUR_PM = 16;

export const currentDateTime = () => {
  return DateTime.now();
};

export const addFiveDaysBefore4pm = (date: Date): Date => {
  const datePlusDays = new Date(date);
  if (date.getUTCHours() > FOUR_PM) {
    datePlusDays.setDate(date.getDate() + SIX_DAYS);
  } else {
    datePlusDays.setDate(date.getDate() + FIVE_DAYS);
  }
  return datePlusDays;
} ;

// set deadline time 4pm
export const setTimeFourPM = (deadlineDay: Date | string) => {
  return convertDateToLuxonDate(deadlineDay).set({hour: 16, minute: 0, second: 0, millisecond: 1});
};

export const convertDateToLuxonDate = (date: Date | string) => {
  return DateTime.fromJSDate(new Date(date));
};

export const isPastDeadline = (deadline: Date | string) => {
  return currentDateTime() >= setTimeFourPM(deadline);
};

export const getDateInThePast = (lang: string, numberOfDays: number): string => {
  const date = new Date;
  const daysAgo = new Date(date.setDate(date.getDate() - numberOfDays));
  return formatDateToFullDate(daysAgo, lang);
};

export const getFutureMonthDate = (numberOfMonths: number): Date => {
  const monthFromNow = new Date();
  monthFromNow.setDate(monthFromNow.getDate() - 1);
  monthFromNow.setMonth(monthFromNow.getMonth() + numberOfMonths);

  return monthFromNow;
};

export const formatDateToFullDate = (date: Date, lang?: string | unknown): string => {
  const dateTime = convertDateToLuxonDate(date);
  const localeValue = lang === 'cy' ? 'cy' : 'en-gb';
  return dateTime.toLocaleString(DateTime.DATE_FULL, {locale: localeValue});
};

export const getNumberOfDaysBetweenTwoDays = (startDay: Date | string, endDay: Date | string) => {
  return convertDateToLuxonDate(endDay).startOf('day').diff(convertDateToLuxonDate(startDay).startOf('day'), 'days').days;
};

export const addDaysToDate = (date: Date, value: number) => {
  const updatedDate = new Date(date);
  updatedDate.setDate(updatedDate.getDate() + value);
  return updatedDate;
};

export const getDOBforAgeFromCurrentTime = (age: number): Date => {
  const referenceDate = new Date();
  referenceDate.setFullYear(referenceDate.getFullYear() - age);
  return referenceDate;
};

export const addMonths = (date: Date, months: number) => {
  date.setMonth(date.getMonth() + months);
  return date;
};

//  input: 01 February 2022 or 01 Fab 2022
// output: 2022-02-01
export const formatStringDate = (text: string) => {
  const date = new Date(Date.parse(text));
  const day = date.getDate().toString().padStart(2, '0');
  const month = (date.getUTCMonth() + 1).toString().padStart(2, '0');
  const year = date.getFullYear();

  return `${year}-${month}-${day}`;
};

export const formatStringDateDMY = (date: Date) => {
  const day = date.getDate().toString().padStart(2, '0');
  const month = DateTime.fromJSDate(date).toFormat('MMM');
  const year = date.getFullYear();

  return `${day} ${month} ${year}`;
};
