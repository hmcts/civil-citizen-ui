import {CCDHowWasThisAmountPaid, CCDRespondToClaim} from 'models/ccdResponse/ccdRespondToClaim';
import {HowMuchHaveYouPaid} from 'form/models/admission/howMuchHaveYouPaid';

export const toCUIRespondToClaim = (ccdRespondToClaim: CCDRespondToClaim): HowMuchHaveYouPaid => {
  const howMuchHaveYouPaid = new HowMuchHaveYouPaid();

  function setHowMuchHaveYouPaidText(ccdRespondToClaim: CCDRespondToClaim) : string {
    if(ccdRespondToClaim?.howWasThisAmountPaid == CCDHowWasThisAmountPaid.OTHER) {
      return ccdRespondToClaim?.howWasThisAmountPaidOther;
    } else {
      return ccdRespondToClaim?.howWasThisAmountPaid;
    }
  }

  howMuchHaveYouPaid.date = ccdRespondToClaim?.whenWasThisAmountPaid;
  howMuchHaveYouPaid.amount = ccdRespondToClaim?.howMuchWasPaid;
  howMuchHaveYouPaid.day = ccdRespondToClaim?.whenWasThisAmountPaid?.getDay();
  howMuchHaveYouPaid.month = ccdRespondToClaim?.whenWasThisAmountPaid?.getMonth();
  howMuchHaveYouPaid.year = ccdRespondToClaim?.whenWasThisAmountPaid?.getFullYear();
  howMuchHaveYouPaid.text = setHowMuchHaveYouPaidText(ccdRespondToClaim);

  return howMuchHaveYouPaid;
};
