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

