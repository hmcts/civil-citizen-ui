import {Claim} from 'models/claim';
import {ClaimSummarySection} from 'form/models/claimSummarySection';
import {ClaimResponseStatus} from 'models/claimResponseStatus';
import {
  buildFullDisputePaidLessResponseContent,
  buildFullDisputeResponseContent,
} from './fullDisputeDefendantsResponseContent';
import {buildFullAdmissionResponseContent} from './fullAdmissinionDefendantsResponseContent';
import {buildPartAdmitAlreadyPaidResponseContent} from './partAdmissionAlreadyPaidDefendantsResponseContent';

export const getDefendantsResponseContent = (claim: Claim, lang: string): ClaimSummarySection[] => {
  switch (claim.responseStatus) {
    case ClaimResponseStatus.FA_PAY_BY_DATE:
      return buildFullAdmissionResponseContent(claim, lang);
    case ClaimResponseStatus.RC_DISPUTE:
      return buildFullDisputeResponseContent(claim, lang);
    case ClaimResponseStatus.RC_PAID_LESS:
      return buildFullDisputePaidLessResponseContent(claim, lang);
    case ClaimResponseStatus.PA_ALREADY_PAID:
      return buildPartAdmitAlreadyPaidResponseContent(claim, lang);
  }
};
