import {Claim} from '../../../../common/models/claim';
import {ClaimSummarySection} from '../../../../common/form/models/claimSummarySection';
import {ClaimResponseStatus} from '../../../../common/models/claimResponseStatus';
import {buildFullDisputeResponseContent} from './fullDisputeDefendantsResponseContent';
import {buildFullAdmissionResponseContent} from './fullAdmissinionDefendantsResponseContent';
import {buildPartAdmitAlreadyPaidResponseContent} from './partAdmissionAlreadyPaidDefendantsResponseContent';

export const getDefendantsResponseContent = (claim: Claim, lang: string): ClaimSummarySection[] => {
  switch (claim.responseStatus) {
    case ClaimResponseStatus.FA_PAY_BY_DATE:
      return buildFullAdmissionResponseContent(claim, lang);
    case ClaimResponseStatus.RC_DISPUTE:
      return buildFullDisputeResponseContent(claim, lang);
    case ClaimResponseStatus.PA_ALREADY_PAID:
      return buildPartAdmitAlreadyPaidResponseContent(claim, lang);
  }
};
