import {CCDFinancialDetailsCuiFields} from 'models/ccdResponse/ccdFinancialDetailsCuiFields';
import {CCDMediation} from 'models/ccdResponse/ccdMediation';

export interface CCDResponseCuiFields {
  respondent1FinancialDetailsFromCui?: CCDFinancialDetailsCuiFields,
  respondent1MediationFromCui?: CCDMediation,

}
