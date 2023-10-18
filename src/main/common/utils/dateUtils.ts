import config from 'config';
import {DateTime} from 'luxon';

const FOUR_PM = 16;
const DRAFT_EXPIRE_TIME_IN_DAYS: number = config.get('services.draftStore.redis.expireInDays');
const DAY_TO_SECONDS_UNIT = 86400;

export const currentDateTime = () => {
  return DateTime.now();
};

export const addDaysBefore4pm = (date: Date, value: number): Date => {
  const datePlusDays = new Date(date);
  if (date.getUTCHours() > FOUR_PM) {
    datePlusDays.setDate(date.getDate() + value + 1);
  } else {
    datePlusDays.setDate(date.getDate() + value);
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

export const formatStringDateSlash = (text: string) => {
  const date = new Date(Date.parse(text));
  const day = date.getDate().toString();
  const month = (date.getUTCMonth() + 1).toString();
  const year = date.getFullYear();

  return `${day}/${month}/${year}`;
};

export const checkEvidenceUploadTime = (date: Date): boolean => {

  const endOfDay = 18;

  if(date == undefined)
  {
    return false;
  }
  const today = new Date();
  today.setHours(endOfDay, 0, 0, 0);

  const yesterday = new Date(today);
  yesterday.setDate(today.getDate()-1);

  if(new Date().getHours() >= endOfDay) {
    return date.getTime() >= yesterday.getTime() && date.getTime() < today.getTime();
  } else {
    const dayBeforeYesterday = new Date(yesterday);
    dayBeforeYesterday.setDate(yesterday.getDate()-1);
    return date.getTime() >= dayBeforeYesterday.getTime() && date.getTime() < yesterday.getTime();
  }
};

export const formatStringDateDMY = (date: Date) => {
  const day = date.getDate().toString().padStart(2, '0');
  const month = DateTime.fromJSDate(date).toFormat('MMM');
  const year = date.getFullYear();

  return `${day} ${month} ${year}`;
};

export const formatStringTimeHMS = (date: Date) => {
  return `${date.toLocaleTimeString('en-US', { hour: 'numeric', minute: 'numeric', second: 'numeric', hour12: true })}`;
};

export function calculateExpireTimeForDraftClaimInSeconds(date: Date) {
  return Math.round(new Date(date).getTime() / 1000) + (DRAFT_EXPIRE_TIME_IN_DAYS * DAY_TO_SECONDS_UNIT);
}
