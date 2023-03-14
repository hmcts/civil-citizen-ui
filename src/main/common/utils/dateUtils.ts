import {DateTime} from 'luxon';

export const currentDateTime = () => {
  return DateTime.now();
};

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

export const stringDateToObject = (text: string) => {
  const date = new Date(Date.parse(text));
  const day = date.getDate().toString().padStart(2, '0');
  const month = (date.getUTCMonth() + 1).toString().padStart(2, '0');
  const year = date.getFullYear();

  return `${year}-${month}-${day}`;
};
