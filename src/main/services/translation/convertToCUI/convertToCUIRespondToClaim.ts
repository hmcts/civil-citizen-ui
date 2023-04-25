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

  const date = new Date (ccdRespondToClaim?.whenWasThisAmountPaid);
  howMuchHaveYouPaid.date = date;
  howMuchHaveYouPaid.amount = ccdRespondToClaim?.howMuchWasPaid;
  howMuchHaveYouPaid.day = date.getDate();
  howMuchHaveYouPaid.month = date.getMonth() + 1 ;
  howMuchHaveYouPaid.year = date.getFullYear();
  howMuchHaveYouPaid.text = setHowMuchHaveYouPaidText(ccdRespondToClaim);

  return howMuchHaveYouPaid;
};
