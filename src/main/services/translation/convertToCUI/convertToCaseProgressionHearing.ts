
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
    const hearingFee = ccdClaim.hearingFee ? ccdClaim?.hearingFee : ccdClaim.hearingFeePBADetails;
    caseProgressionHearing.hearingFeeInformation = new HearingFeeInformation(hearingFee, ccdClaim.hearingDueDate);
    caseProgressionHearing.hearingFeePaymentDetails = ccdClaim.hearingFeePaymentDetails;
    return caseProgressionHearing;
  }
};
