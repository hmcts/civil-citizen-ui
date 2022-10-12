import {AmountSchedule} from './amountSchedule';
import _ from 'lodash';

interface ScheduledAmount {
  amount: number;
  schedule: string;
}

const calculateTotalAmount = (amountsPerSchedule?: ScheduledAmount[]): string => {
  let totalAmount = 0;
  if (amountsPerSchedule?.length > 0) {
    amountsPerSchedule.forEach(scheduledAmount => {
      const schedule = AmountSchedule.getSchedule(scheduledAmount?.schedule);
      if (schedule) {
        totalAmount = totalAmount + (scheduledAmount.amount * schedule.valueInMonth);
      }
    });
  }
  return String(_.round(totalAmount, 2));
};

export {
  ScheduledAmount,
  calculateTotalAmount,
};
