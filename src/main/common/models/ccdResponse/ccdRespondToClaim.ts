export interface CCDRespondToClaim {
  howMuchWasPaid?: number;
  howWasThisAmountPaid?: CCDHowWasThisAmountPaid;
  whenWasThisAmountPaid?: Date;
  howWasThisAmountPaidOther? : string;
}

export enum CCDHowWasThisAmountPaid {
  CREDIT_CARD = 'CREDIT_CARD',
  CHEQUE = 'CHEQUE',
  BACS = 'BACS',
  OTHER  = 'OTHER',
}
