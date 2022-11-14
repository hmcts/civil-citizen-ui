import {Claim} from '../../../models/claim';
import {Party} from 'models/party';
import {PartyType} from '../../../models/partyType';
import {PaymentOptionType} from '../../../../common/form/models/admission/paymentOption/paymentOptionType';
import {YesNo} from '../../../../common/form/models/yesNo';
import {RejectAllOfClaimType} from '../../../../common/form/models/rejectAllOfClaimType';

export const isCaseDataMissing = (caseData: Claim): boolean => {
  return !caseData;
};

export const hasCorrespondenceAndPrimaryAddress = (respondent1: Party): boolean => {
  return !!(respondent1?.partyDetails?.primaryAddress && (respondent1?.partyDetails?.postToThisAddress === YesNo.NO || respondent1?.partyDetails?.correspondenceAddress?.addressLine1));
};

export const hasDateOfBirthIfIndividual = (respondent1: Party): boolean => {
  return !!(respondent1?.type !== PartyType.INDIVIDUAL || (respondent1?.type === PartyType.INDIVIDUAL && respondent1?.dateOfBirth));
};

export const isResponseTypeMissing = (respondent1: Party): boolean => {
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

export const financialDetailsShared = (caseData: Claim): boolean => {
  return !!caseData?.taskSharedFinancialDetails;
};

export const isIndividualWithStatementOfMeansComplete = (caseData: Claim): boolean => {
  return (isCounterpartyIndividual(caseData.respondent1) && isStatementOfMeansComplete(caseData));
};

export const isCounterpartyIndividual = (respondent1: Party): boolean => {
  return respondent1.type === PartyType.INDIVIDUAL || respondent1.type === PartyType.SOLE_TRADER;
};

export const isCounterpartyCompany = (respondent1: Party): boolean => {
  return respondent1.type === PartyType.ORGANISATION || respondent1.type === PartyType.COMPANY;
};

export const hasContactPersonAndCompanyPhone = (caseData: Claim): boolean => {
  return !!(caseData.mediation?.companyTelephoneNumber?.mediationContactPerson && caseData.mediation?.companyTelephoneNumber?.mediationPhoneNumber);
};

export const isFullDefenceAndNotCounterClaim = (caseData: Claim): boolean => {
  return caseData.isFullDefence() && caseData.rejectAllOfClaim?.option !== RejectAllOfClaimType.COUNTER_CLAIM;
};
