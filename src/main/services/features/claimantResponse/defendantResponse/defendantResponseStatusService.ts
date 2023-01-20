import { DashboardDefendantItem } from 'common/models/dashboard/dashboardItem';
import { DefendantResponseStatus } from 'models/defendantResponseStatus';
import { t } from 'i18next';
import { Claim } from 'common/models/claim';

const daysRemainingString = (days: number): string => {
  if (days > 0) {
    return t('PAGES.DASHBOARD.DAYS_REMAINING', { days: days });
  } else if (days < 0) {
    return t('PAGES.DASHBOARD.DAYS_OVERDUE', { days: days });
  } else if (days === 0) {
    return t('PAGES.DASHBOARD.DUE_TODAY');
  }
};

export const getStringStatus = (item: DashboardDefendantItem, claim: Claim): string => {
  switch (item.defendantResponseStatus) {
    case DefendantResponseStatus.NO_RESPONSE:
      return t('PAGES.DASHBOARD.RESPONSE_TO_CLAIM', { noRemainingDays: daysRemainingString(claim?.getRemainingDays()) });

    case DefendantResponseStatus.ELIGIBLE_FOR_CCJ:
      return t('PAGES.DASHBOARD.ELIGIBLE_FOR_CCJ_YOU_HAVE_NOT_RESPONDED') + '\n' +
        t('PAGES.DASHBOARD.ELIGIBLE_FOR_CCJ_ASK_FOR_CCJ', { claimantName: item.claimantName }) + '\n' +
        t('PAGES.DASHBOARD.ELIGIBLE_FOR_CCJ_STILL_CAN_RESPOND');

    case DefendantResponseStatus.ELIGIBLE_FOR_CCJ_AFTER_FULL_ADMIT_PAY_IMMEDIATELY_PAST_DEADLINE:
      if (claim.isFAPaymentOptionPayImmediately() ||
        claim.isPAPaymentOptionPayImmediately())
        return t('PAGES.DASHBOARD.PAST_DEADLINE_IMMEDIATELY');
      if (claim.isFAPaymentOptionBySetDate() ||
        claim.isPAPaymentOptionByDate())
        return t('PAGES.DASHBOARD.PAST_DEADLINE_BY_SPECIFIED_DATE', { paymentDate: claim.fullAdmission.paymentIntention.paymentDate });
      if (claim.isFAPaymentOptionInstallments() ||
        claim.isPAPaymentOptionInstallments())
        return t('PAGES.DASHBOARD.PAST_DEADLINE_INSTALMENTS');
      break;

    case DefendantResponseStatus.MORE_TIME_REQUESTED:
      return t('PAGES.DASHBOARD.MORE_TIME_REQUESTED', { responseDeadline: item.responseDeadline });

    case DefendantResponseStatus.PAID_IN_FULL:
    case DefendantResponseStatus.CLAIMANT_ACCEPTED_STATES_PAID:
      return t('PAGES.DASHBOARD.CLAIM_SETTLED');
    case DefendantResponseStatus.PAID_IN_FULL_CCJ_CANCELLED:
    case DefendantResponseStatus.PAID_IN_FULL_CCJ_SATISFIED:
      return t('PAGES.DASHBOARD.CONFIRMED_PAID', { claimantName: item.claimantName });

    case DefendantResponseStatus.TRANSFERRED:
      return t('PAGES.DASHBOARD.CASE_SENT_TO_COURT');

    case DefendantResponseStatus.REDETERMINATION_BY_JUDGE:
      return t('PAGES.DASHBOARD.REDETERMINATION_BY_JUDGE', { claimantName: item.claimantName });

    // My new part from here -----------------
    case DefendantResponseStatus.CCJ_REQUESTED:
      return t('PAGES.DASHBOARD.CLAIMANT_HAS_REQUESTED_CCJ', { ccjRequestedAt: claim.countyCourtJudgmentRequestedAt });

    case DefendantResponseStatus.DEFENDANT_OCON_FORM_RESPONSE:
      return t('PAGES.DASHBOARD.WAIT_CLAIMANT_RESPONSE');

    case DefendantResponseStatus.DEFENDANT_PAPER_RESPONSE:
      return t('PAGES.DASHBOARD.CLAIM_CONTINUE_BY_POST');

    case DefendantResponseStatus.PROCEED_OFFLINE:
      if (claim.proceedOfflineReason === APPLICATION_BY_DEFENDANT) {
        return t('PAGES.DASHBOARD.YOU_APPLIED_TO_CHANGE_CLAIM');
      }
      return t('PAGES.DASHBOARD.CLAIMANT_APPLIED_TO_CHANGE_CLAIM');

    case DefendantResponseStatus.BUSINESS_QUEUE:
      return t('PAGES.DASHBOARD.CASE_PASSED_TO_CCBC');

    case DefendantResponseStatus.CLAIMANT_ACCEPTED_ADMISSION_AND_REQUESTED_CCJ:
    case DefendantResponseStatus.CLAIMANT_ALTERNATIVE_PLAN_WITH_CCJ:
    case DefendantResponseStatus.CCJ_AFTER_SETTLEMENT_BREACHED:
    case DefendantResponseStatus.CCJ_BY_DETERMINATION_AFTER_SETTLEMENT_BREACHED:
    case DefendantResponseStatus.CLAIMANT_REQUESTS_CCJ_AFTER_DEFENDANT_REJECTS_SETTLEMENT:
      return t('PAGES.DASHBOARD.CLAIMANT_REQUESTED_CCJ_AGAINS_YOU', { claimantName: claim.getClaimantFullName() });

    case DefendantResponseStatus.CLAIMANT_ACCEPTED_ADMISSION:
    case DefendantResponseStatus.CLAIMANT_ACCEPTED_COURT_PLAN_SETTLEMENT:
    case DefendantResponseStatus.CLAIMANT_ACCEPTED_ADMISSION_AND_DEFENDANT_NOT_SIGNED:
      return t('PAGES.DASHBOARD.ASKED_TO_SIGN_SETTLEMENT', { claimantName: claim.getClaimantFullName() });

    case DefendantResponseStatus.ELIGIBLE_FOR_CCJ_AFTER_PART_ADMIT_PAY_IMMEDIATELY_PAST_DEADLINE:
      return t('PAGES.DASHBOARD.CLAIMANT_ACCEPTED_ADMISSION', { claimantName: claim.getClaimantFullName(), amount: claim.response.amount });

    case DefendantResponseStatus.ADMISSION_SETTLEMENT_AGREEMENT_REACHED:
      return t('PAGES.DASHBOARD.BOTH_SIGNED_SETTLEMENT');

    case DefendantResponseStatus.RESPONSE_SUBMITTED:

      if (claim.isFullDefence()) {
        if (claim.response.defenceType = ALREADY_PAID) {
          return t('PAGES.DASHBOARD.CLAIMANT_EMAILED', { claimantName: claim.getClaimantFullName() });
        }
        if (claim.response.freeMediation = NO) {
          return t('PAGES.DASHBOARD.REJECTED_CLAIM');
        }
        if (claim.response.defenceType not ALREADY_PAID(claim.response.defenceType not ALREADY_PAID OR claim.response.freeMediation not NO)) {
          return t('PAGES.DASHBOARD.REJECTED_CLAIM_AND_SUGGESTED_MEDIATION');
        }
      } else if (claim.isPartialAdmission()) {
        if (claim.response.paymentDeclaration) {
          return t('PAGES.DASHBOARD.CLAIMANT_EMAILED', { claimantName: claim.getClaimantFullName() });
        }
        if (!claim.response.paymentDeclaration) {
          return t('PAGES.DASHBOARD.ADMITTED_PART_OF_CLAIM');
        }
      } else if (claim.isFullAdmission()) {
        if (claim.response.paymentIntention.paymentOption = IMMEDIATELY) {
          return t('PAGES.DASHBOARD.ADMITTED_ALL_PAY_IMMEDIATELY');
        }
        if (claim.response.paymentIntention.paymentOption = BY_SPECIFIED_DATE) {
          return t('PAGES.DASHBOARD.ADMITTED_ALL_PAY_BY_SET_DATE', { paymentDate: claim.response.paymentIntention.paymentDate });
        }
      }

  }
};
