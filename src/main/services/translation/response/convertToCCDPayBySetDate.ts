import { CCDPayBySetDate } from "../../../common/models/ccdResponse/ccdPayBySetDate";

export const toCCDPayBySetDate = (paymentDate: Date): CCDPayBySetDate => {
  return {
    whenWillThisAmountBePaid: paymentDate,
  };
};
