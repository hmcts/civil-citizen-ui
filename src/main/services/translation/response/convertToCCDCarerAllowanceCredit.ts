import {Claim} from 'models/claim';
import {ResponseType} from 'form/models/responseType';
import {YesNoUpperCamelCase} from 'form/models/yesNo';
import {toCCDYesNoFromGenericYesNo} from 'services/translation/response/convertToCCDYesNo';

export const toCCDCarerAllowanceCredit = (claim: Claim, responseType: ResponseType): YesNoUpperCamelCase => {
  if (claim.respondent1?.responseType === responseType) {
    return toCCDYesNoFromGenericYesNo(claim.statementOfMeans?.carer);
  }
  return undefined;
};
