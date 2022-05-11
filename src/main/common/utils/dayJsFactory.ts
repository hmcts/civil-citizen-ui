import dayjs, { type Dayjs } from 'dayjs';
import isSameOrAfter from 'dayjs/plugin/isSameOrAfter';
dayjs.extend(isSameOrAfter);

export const currentDateTime = () => {
  return dayjs();
}; 

export const currentDate = () => {
  return dayjs().hour(0).minute(0).second(0).millisecond(0);
};

function setTimeFourPM(paymentDeadlineDay: Dayjs) {
  // set deadline time 4pm
  return paymentDeadlineDay.hour(16).minute(0).second(0).millisecond(0);
}

export const isPastDeadline = (dateTime: Dayjs, paymentDeadline: Dayjs) => {
  console.log('smae or after', dateTime.isSameOrAfter(setTimeFourPM(paymentDeadline)))
  return dateTime.isSameOrAfter(dayjs(setTimeFourPM(paymentDeadline)));
};