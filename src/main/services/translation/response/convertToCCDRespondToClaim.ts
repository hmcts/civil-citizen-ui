import {PartialAdmission} from 'models/partialAdmission';
import {PaymentMethod, RespondToClaim} from 'models/ccdResponse/ccdRespondToClaim';

export const toCCDRespondToClaim = (partialAdmission: PartialAdmission): RespondToClaim => {
  return {
    howMuchWasPaid: partialAdmission?.howMuchHaveYouPaid?.amount,
    whenWasThisAmountPaid: partialAdmission?.howMuchHaveYouPaid?.date,
    howWasThisAmountPaid: partialAdmission?.howMuchHaveYouPaid ? PaymentMethod.OTHER : undefined,
    howWasThisAmountPaidOther: partialAdmission?.howMuchHaveYouPaid?.text,
  };
};
