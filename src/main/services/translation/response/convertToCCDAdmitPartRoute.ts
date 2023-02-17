import {RespondToClaim} from 'models/ccdResponse/ccdAdmitPartRoute';
import {toCCDYesNo} from 'services/translation/response/convertToCCDYesNo';
import {PartialAdmission} from 'models/partialAdmission';
import {YesNo} from 'form/models/yesNo';

const yesNoStringToEnumValue = (text: string): YesNo => {
  return text.toLowerCase() == 'yes' ? YesNo.YES : YesNo.NO;
};
export const toCCDAdmitPartRoutePaid = (paid: string) => {
  return toCCDYesNo(yesNoStringToEnumValue(paid));
};
export const toCCDAdmitPartRoute = (partialAdmission: PartialAdmission): RespondToClaim => {
  return {
    howMuchWasPaid: partialAdmission.howMuchHaveYouPaid.amount,
    whenWasThisAmountPaid: partialAdmission.howMuchHaveYouPaid.date,
    howWasThisAmountPaidOther: partialAdmission.howMuchHaveYouPaid.text,
    respondToAdmittedClaimOwingAmount: partialAdmission.howMuchDoYouOwe.amount,
  };
};
