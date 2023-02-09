import {Claim} from "models/claim";
import {ResponseType} from "form/models/responseType";
import {YesNoUpperCamelCase} from "form/models/yesNo";

export const toCCDCarerAllowanceCredit = (claim: Claim, responseType: ResponseType): YesNoUpperCamelCase => {
  if (claim.respondent1?.responseType === responseType) {
    return claim.statementOfMeans?.carer?.option === 'true' ? YesNoUpperCamelCase.YES : YesNoUpperCamelCase.NO
  } else {
    return undefined;
  }
};
