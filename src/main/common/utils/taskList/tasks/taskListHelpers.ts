import {Claim} from 'models/claim';
import {Party} from 'models/party';
import {PartyType} from 'models/partyType';
import {PaymentOptionType} from 'common/form/models/admission/paymentOption/paymentOptionType';
import {YesNo} from 'common/form/models/yesNo';
import {RejectAllOfClaimType} from 'common/form/models/rejectAllOfClaimType';

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
  return !caseData?.fullAdmission?.paymentIntention?.paymentOption;
};

export const isPaymentOptionExisting = (caseData: Claim): boolean => {
  if (caseData?.isFullAdmission()) {
    return !!caseData?.fullAdmission?.paymentIntention?.paymentOption;
  }
  if (caseData?.isPartialAdmission()) {
    return !!caseData?.partialAdmission?.paymentIntention?.paymentOption;
  }
  return false;
};

export const isNotPayImmediatelyResponse = (caseData: Claim): boolean => {
  if (caseData?.isFullAdmission()) {
    return caseData?.fullAdmission?.paymentIntention?.paymentOption !== PaymentOptionType.IMMEDIATELY;
  }
  if (caseData?.isPartialAdmission()) {
    return caseData?.partialAdmission?.paymentIntention?.paymentOption !== PaymentOptionType.IMMEDIATELY;
  }
  return true;
};

export const isRepaymentPlanMissing = (caseData: Claim): boolean => {
  return !caseData.partialAdmission?.paymentIntention?.repaymentPlan;
};

export const isFullAdmissionRepaymentPlanMissing = (caseData: Claim): boolean => {
  return !caseData.fullAdmission?.paymentIntention?.repaymentPlan;
};

export const isStatementOfMeansComplete = (caseData: Claim): boolean => {
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

export const hasClaimantResponseContactPersonAndCompanyPhone = (caseData: Claim): boolean => {
  return !!(caseData.claimantResponse?.mediation?.companyTelephoneNumber?.mediationContactPerson && caseData.claimantResponse?.mediation?.companyTelephoneNumber?.mediationPhoneNumber);
};

export const isFullDefenceAndNotCounterClaim = (caseData: Claim): boolean => {
  return caseData.isFullDefence() && caseData.rejectAllOfClaim?.option !== RejectAllOfClaimType.COUNTER_CLAIM;
};

export const hasAllCarmRequiredFields = (respondent1: Party): boolean => {
  if (respondent1.type === PartyType.INDIVIDUAL) {
    return (!!respondent1.partyPhone && !!respondent1.dateOfBirth);
  }
  return (!!respondent1.partyPhone && !!respondent1.partyDetails.contactPerson);
};
