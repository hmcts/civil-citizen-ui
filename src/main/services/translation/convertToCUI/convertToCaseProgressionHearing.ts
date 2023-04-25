
import {CCDClaim} from 'models/civilClaimResponse';
import {CaseProgressionHearing} from 'models/caseProgression/caseProgressionHearing';

export const toCUICaseProgressionHearing = (ccdClaim: CCDClaim): CaseProgressionHearing => {
  if (ccdClaim) {
    const caseProgressionHearing : CaseProgressionHearing = new CaseProgressionHearing();
    caseProgressionHearing.hearingDocuments = ccdClaim.hearingDocuments;
    caseProgressionHearing.hearingDate = ccdClaim.hearingDate;
    caseProgressionHearing.hearingLocation = ccdClaim.hearingLocation;
    return caseProgressionHearing;
  }
};

