import {Claim} from '../../../models/claim';
import {Respondent} from '../../../../common/models/respondent';
import { CounterpartyType } from '../../../../common/models/counterpartyType';
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


