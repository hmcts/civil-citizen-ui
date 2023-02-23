import {YesNo} from 'form/models/yesNo';

export interface CCDAdmitPartRoute {
  defenceAdmittedRequired: YesNo
  respondToClaim: RespondToClaim
}

export interface RespondToClaim {
  howMuchWasPaid?: number
  whenWasThisAmountPaid?: Date
  // this field is used in CCD but cannot be used in CUI
  // there is no way to translate textbox (CUI) to enum (CCD)
  // instead CUI use howWasThisAmountPaidOther for all payment method
  // howWasThisAmountPaid?: PaymentMethod
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
