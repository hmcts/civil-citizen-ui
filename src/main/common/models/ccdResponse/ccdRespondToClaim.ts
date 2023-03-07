export interface RespondToClaim {
  howMuchWasPaid?: number
  whenWasThisAmountPaid?: Date
  howWasThisAmountPaid?: PaymentMethod
  howWasThisAmountPaidOther?: string
}

export enum PaymentMethod {
  CREDIT_CARD = 'Credit card',
  CHEQUE = 'Cheque',
  BACS = 'BACS',
  OTHER = 'OTHER'
}
