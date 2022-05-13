import dayjs, { type Dayjs } from 'dayjs';
import isSameOrAfter from 'dayjs/plugin/isSameOrAfter';
dayjs.extend(isSameOrAfter);

export const currentDateTime = () => {
  return dayjs();
}; 

export const currentDate = () => {
  return dayjs().hour(1).minute(0).second(0).millisecond(1);
};

export const setTimeFourPM = (deadlineDay: Dayjs) => {
  // set deadline time 4pm
  return deadlineDay.hour(16).minute(0).second(0).millisecond(0);
};

export const isPastDeadline = (dateTime: Dayjs, deadline: Dayjs) => {
  return dateTime.isSameOrAfter(dayjs(setTimeFourPM(deadline)));
};

export const isAfter4pm = () => {
  return currentDateTime().hour() > 15;
};