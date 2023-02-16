import {CCDResponseCuiFields} from 'models/ccdResponse/ccdResponseCuiFields';
import {Claim} from 'models/claim';
import {toCCDFieldsOnlyInCuiFinancialDetails} from 'models/ccdResponse/convertToCCDFromCuiOnlyFinancialDetails';
import {toCCDMediation} from 'services/translation/response/convertToCCDMediation';

export const toCCDFieldsOnlyInCui = (claim: Claim): CCDResponseCuiFields => {
  return {
    respondent1FinancialDetailsFromCui: toCCDFieldsOnlyInCuiFinancialDetails(claim.statementOfMeans),
    respondent1MediationFromCui: toCCDMediation(claim.mediation),
  };
};
