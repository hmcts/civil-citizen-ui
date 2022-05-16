import {Claim} from '../../../models/claim';
import {Respondent} from '../../../../common/models/respondent';

export const isCaseDataMissing = (caseData: Claim) => {
  return !caseData;
};

export const isBothCorrespondenceAndPrimaryAddressMissing = (respondent1: Respondent) => {
  return !respondent1?.correspondenceAddress && !respondent1?.primaryAddress;
};

export const isDOBMissing = (respondent1: Respondent) => {
  return !respondent1?.dateOfBirth;
};

export const isResponseTypeMissing = (respondent1: Respondent) => {
  return !respondent1?.responseType;
};



