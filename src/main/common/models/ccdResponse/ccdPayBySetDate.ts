export interface CCDPayBySetDate {
  whenWillThisAmountBePaid?: Date;
}

export const toCCDPayBySetDate = (paymentDate: Date): CCDPayBySetDate => {
  return {
    whenWillThisAmountBePaid: paymentDate,
  };
}
