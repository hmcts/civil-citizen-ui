import {Claim} from '../../../models/claim';
import {Respondent} from '../../../../common/models/respondent';
import {CounterpartyType} from '../../../../common/models/counterpartyType';
import PaymentOptionType from '../../../../common/form/models/admission/fullAdmission/paymentOption/paymentOptionType';

export const isCaseDataMissing = (caseData: Claim): boolean => {
  return !caseData;
};

export const isBothCorrespondenceAndPrimaryAddressMissing = (respondent1: Respondent): boolean => {
  return !respondent1?.correspondenceAddress && !respondent1?.primaryAddress;
};

export const isDOBMissing = (respondent1: Respondent): boolean => {
  // check DOB if the defendant type is individual
  return respondent1?.type === CounterpartyType.INDIVIDUAL && !respondent1?.dateOfBirth ;
};

export const isResponseTypeMissing = (respondent1: Respondent): boolean => {
  return !respondent1?.responseType;
};

export const isPaymentOptionMissing = (caseData: Claim): boolean => {
  return !caseData?.paymentOption;
};

export const isNotPayImmediatelyResponse = (caseData: Claim): boolean => {
  return (caseData?.paymentOption !== PaymentOptionType.IMMEDIATELY);
};

export const isRepaymentPlanMissing = (caseData: Claim): boolean => {
  return !caseData.repaymentPlan;
};

export const isStatementOfMeansComplete = (caseData: Claim): boolean => {
  // TODO: this should replicate statement of means guard logic CIV-2630
  return !!(caseData?.statementOfMeans && Object.keys(caseData.statementOfMeans).length > 1);
};

export const isCounterpartyIndividual = (respondent1: Respondent): boolean => {
  return respondent1.type === CounterpartyType.INDIVIDUAL || respondent1.type === CounterpartyType.SOLE_TRADER;
};

export const isCounterpartyCompany = (respondent1: Respondent): boolean => {
  return respondent1.type === CounterpartyType.ORGANISATION || respondent1.type === CounterpartyType.COMPANY;
};
