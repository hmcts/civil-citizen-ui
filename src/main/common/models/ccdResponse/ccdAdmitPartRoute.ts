import {YesNo} from 'form/models/yesNo';

export interface CCDAdmitPartRoute {
  defenceAdmittedRequired: YesNo
  respondToClaim: RespondToClaim
}

export interface RespondToClaim {
  howMuchWasPaid?: number
  whenWasThisAmountPaid?: Date
  howWasThisAmountPaid?: PaymentMethod
  howWasThisAmountPaidOther?: string
  respondToAdmittedClaimOwingAmount?: number
}

export enum PaymentMethod {
  CREDIT_CARD = 'Credit card',
  CHEQUE = 'Cheque',
  BACS = 'BACS',
  OTHER = 'Other'
}
