import {CCDRespondToClaim, CCDHowWasThisAmountPaid} from '../../../common/models/ccdResponse/ccdRespondToClaim';
import {HowMuchHaveYouPaid} from '../../../common/form/models/admission/howMuchHaveYouPaid';
import {convertToPence} from 'services/translation/claim/moneyConversation';

export const toCCDRespondToClaim = (howMuchHaveYouPaid: HowMuchHaveYouPaid): CCDRespondToClaim => {
  if (howMuchHaveYouPaid) {
    return {
      howMuchWasPaid: convertToPence(howMuchHaveYouPaid.amount),
      howWasThisAmountPaid: howMuchHaveYouPaid.amount ? CCDHowWasThisAmountPaid.OTHER : undefined,
      whenWasThisAmountPaid: howMuchHaveYouPaid.date,
      howWasThisAmountPaidOther: howMuchHaveYouPaid.text,
    };
  }
};
