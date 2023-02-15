import {CCDResponseCuiFields} from 'models/ccdResponse/ccdResponseCuiFields';
import {Claim} from 'models/claim';
import {toCCDFieldsOnlyInCuiFinancialDetails} from "models/ccdResponse/convertToCCDFromCuiOnlyFinancialDetails";

export const toCCDFieldsOnlyInCui = (claim: Claim): CCDResponseCuiFields => {
  return {
    respondent1FinancialDetailsFromCui : toCCDFieldsOnlyInCuiFinancialDetails(claim.statementOfMeans),
  };
};
