import {PartialAdmission} from 'models/partialAdmission';
import {CCDHowWasThisAmountPaid, CCDRespondToClaim} from 'models/ccdResponse/ccdRespondToClaim';

export const toCCDRespondToClaim = (partialAdmission: PartialAdmission): CCDRespondToClaim => {
  return {
    howMuchWasPaid: partialAdmission?.howMuchHaveYouPaid?.amount,
    whenWasThisAmountPaid: partialAdmission?.howMuchHaveYouPaid?.date,
    howWasThisAmountPaid: partialAdmission?.howMuchHaveYouPaid ? CCDHowWasThisAmountPaid.OTHER : undefined,
    howWasThisAmountPaidOther: partialAdmission?.howMuchHaveYouPaid?.text,
  };
};
