import {CCDRespondToClaim, CCDHowWasThisAmountPaid} from "../../../common/models/ccdResponse/ccdRespondToClaim";
import {HowMuchHaveYouPaid} from "../../../common/form/models/admission/howMuchHaveYouPaid";


export const toCCDRespondToClaim = (howMuchHaveYouPaid: HowMuchHaveYouPaid): CCDRespondToClaim => {
  if (howMuchHaveYouPaid) {
    return {
      howMuchWasPaid: howMuchHaveYouPaid.amount,
      howWasThisAmountPaid: CCDHowWasThisAmountPaid.OTHER,
      whenWasThisAmountPaid: howMuchHaveYouPaid.date,
      howWasThisAmountPaidOther: howMuchHaveYouPaid.text,
    };
  }

};
