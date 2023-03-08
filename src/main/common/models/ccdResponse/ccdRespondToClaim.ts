export interface CCDRespondToClaim {
  howMuchWasPaid?: number
  whenWasThisAmountPaid?: Date
  howWasThisAmountPaid?: CCDHowWasThisAmountPaid
  howWasThisAmountPaidOther?: string
}

export enum CCDHowWasThisAmountPaid {
  CREDIT_CARD = 'Credit card',
  CHEQUE = 'Cheque',
  BACS = 'BACS',
  OTHER = 'OTHER'
}
