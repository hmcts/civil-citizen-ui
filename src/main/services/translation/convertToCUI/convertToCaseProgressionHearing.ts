
import {CCDClaim} from 'models/civilClaimResponse';
import {CaseProgressionHearing, HearingLocation} from 'models/caseProgression/caseProgressionHearing';
import {HearingFeeInformation} from 'models/caseProgression/hearingFee/hearingFee';

export const toCUICaseProgressionHearing = (ccdClaim: CCDClaim): CaseProgressionHearing => {
  if (ccdClaim) {
    const caseProgressionHearing : CaseProgressionHearing = new CaseProgressionHearing();
    caseProgressionHearing.hearingDocuments = ccdClaim.hearingDocuments;
    caseProgressionHearing.hearingDate = ccdClaim.hearingDate;
    caseProgressionHearing.hearingLocation = new HearingLocation(ccdClaim.hearingLocation?.value);
    caseProgressionHearing.hearingTimeHourMinute = ccdClaim.hearingTimeHourMinute;
    caseProgressionHearing.hearingDuration = ccdClaim.hearingDuration;
    caseProgressionHearing.hearingFeeInformation = new HearingFeeInformation(ccdClaim.hearingFee, ccdClaim.hearingDueDate);
    return caseProgressionHearing;
  }
};
