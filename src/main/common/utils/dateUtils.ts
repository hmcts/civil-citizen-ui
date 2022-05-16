import {DateTime} from 'luxon';

export const currentDateTime = () => {
  return DateTime.now();
};

export const setTimeFourPM = (deadlineDay: DateTime) => {
  // set deadline time 4pm
  return deadlineDay.set({ hour: 16, minute: 0, second: 0, millisecond: 0 });
};

export const convertDateToLuxonDate = (date: Date | string) => {
  /* @ts-expect-error : Argument of type 'Date' is not assignable to parameter of type 'string'.ts(2345) */
  return DateTime.fromISO(date);
};

export const isPastDeadline = (dateTime: DateTime, deadline: DateTime) => {
  return dateTime >= setTimeFourPM(deadline);
};
