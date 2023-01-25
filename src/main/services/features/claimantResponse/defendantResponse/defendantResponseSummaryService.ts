import {Claim} from 'models/claim';
import {ClaimSummarySection} from 'form/models/claimSummarySection';
import {ClaimResponseStatus} from 'models/claimResponseStatus';
import {
  buildFullDisputePaidLessResponseContent,
  buildFullDisputeResponseContent,
} from './fullDisputeDefendantsResponseContent';
import {buildFullAdmissionResponseContent} from './fullAdmissinionDefendantsResponseContent';
import {buildPartAdmitNotPaidResponseContent} from './partAdmitNotPaidDefendantsResponseContent';
import {buildPartAdmitAlreadyPaidResponseContent} from './partAdmissionAlreadyPaidDefendantsResponseContent';

export const getDefendantsResponseContent = (claim: Claim, lang: string): ClaimSummarySection[] => {
  switch (claim.responseStatus) {
    case ClaimResponseStatus.FA_PAY_BY_DATE:
      return buildFullAdmissionResponseContent(claim, lang);
    case ClaimResponseStatus.RC_DISPUTE:
      return buildFullDisputeResponseContent(claim, lang);
    case ClaimResponseStatus.PA_NOT_PAID_PAY_BY_DATE:
    case ClaimResponseStatus.PA_NOT_PAID_PAY_IMMEDIATELY:
    case ClaimResponseStatus.PA_NOT_PAID_PAY_INSTALLMENTS:
      return buildPartAdmitNotPaidResponseContent(claim, lang);
    case ClaimResponseStatus.RC_PAID_LESS:
      return buildFullDisputePaidLessResponseContent(claim, lang);
    case ClaimResponseStatus.PA_ALREADY_PAID:
      return buildPartAdmitAlreadyPaidResponseContent(claim, lang);
  }
};
