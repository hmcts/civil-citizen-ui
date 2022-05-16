import {DateTime} from 'luxon';

export const currentDateTime = () => {
  return DateTime.now();
};

// set deadline time 4pm
export const setTimeFourPM = (deadlineDay:  Date | string ) => {
  return convertDateToLuxonDate(deadlineDay).set({ hour: 16, minute: 0, second: 0, millisecond: 1 });
};

export const convertDateToLuxonDate = (date: Date | string) => {
  /* @ts-expect-error : Argument of type 'Date' is not assignable to parameter of type 'string'.ts(2345) */
  return DateTime.fromISO(date);
};

export const isPastDeadline = (dateTime: DateTime, deadline: Date | string) => {
  return dateTime >= setTimeFourPM(deadline);
};