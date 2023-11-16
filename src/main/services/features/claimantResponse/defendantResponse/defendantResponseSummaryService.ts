import {Claim} from 'models/claim';
import {ClaimSummarySection} from 'form/models/claimSummarySection';
import {ClaimResponseStatus} from 'models/claimResponseStatus';
import {
  buildFullDisputePaidFullResponseContent,
  buildFullDisputePaidLessResponseContent,
  buildFullDisputeResponseContent,
} from './fullDisputeDefendantsResponseContent';
import {buildFullAdmissionResponseContent} from './fullAdmissinionDefendantsResponseContent';
import {buildPartAdmitNotPaidResponseContent, buildPartAdmitNotPaidResponseForHowTheyWantToPay} from './partAdmitNotPaidDefendantsResponseContent';
import {buildPartAdmitAlreadyPaidResponseContent} from './partAdmissionAlreadyPaidDefendantsResponseContent';
import {buildFullAdmissionInstallmentsResponseContent} from './fullAdmissionPayInstallmentsDefendantResponseContent';

export const getDefendantsResponseContent = (claim: Claim, lang: string): ClaimSummarySection[] => {
  switch (claim.responseStatus) {
    case ClaimResponseStatus.FA_PAY_BY_DATE:
      return buildFullAdmissionResponseContent(claim, lang);
    case ClaimResponseStatus.FA_PAY_INSTALLMENTS:
      return buildFullAdmissionInstallmentsResponseContent(claim, lang);
    case ClaimResponseStatus.RC_DISPUTE:
      return buildFullDisputeResponseContent(claim, lang);
    case ClaimResponseStatus.PA_NOT_PAID_PAY_BY_DATE:
    case ClaimResponseStatus.PA_NOT_PAID_PAY_IMMEDIATELY:
    case ClaimResponseStatus.PA_NOT_PAID_PAY_INSTALLMENTS:
      return buildPartAdmitNotPaidResponseContent(claim, lang);
    case ClaimResponseStatus.RC_PAID_FULL:
      return buildFullDisputePaidFullResponseContent(claim, lang);
    case ClaimResponseStatus.RC_PAID_LESS:
      return buildFullDisputePaidLessResponseContent(claim, lang);
    case ClaimResponseStatus.PA_ALREADY_PAID:
      return buildPartAdmitAlreadyPaidResponseContent(claim, lang);
  }
};

export const getResponseContentForHowTheyWantToPay = (claim: Claim, lang: string): ClaimSummarySection[] => {
  return buildPartAdmitNotPaidResponseForHowTheyWantToPay(claim, lang);
};
