import {DashboardDefendantItem} from 'common/models/dashboard/dashboardItem';
import {DefendantResponseStatus} from 'models/defendantResponseStatus';
import {t} from 'i18next';
import {Claim} from 'common/models/claim';
import {PaymentOptionType} from 'common/form/models/admission/paymentOption/paymentOptionType';
import {RejectAllOfClaimType} from 'common/form/models/rejectAllOfClaimType';
import {YesNo} from 'common/form/models/yesNo';

const daysRemainingString = (days: number): string => {
  if (days > 0) {
    return t('PAGES.DASHBOARD.DAYS_REMAINING', { days: days });
  } else if (days < 0) {
    return t('PAGES.DASHBOARD.DAYS_OVERDUE', { days: days });
  } else if (days === 0) {
    return t('PAGES.DASHBOARD.DUE_TODAY');
  }
};

export const getStringStatus = (item: DashboardDefendantItem, claim: Claim, lng: string): string => {
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

      // TODO: CCJ requested is waiting on a Business decision as to how to process this
      // case DefendantResponseStatus.CCJ_REQUESTED:
      //   return t('PAGES.DASHBOARD.CLAIMANT_HAS_REQUESTED_CCJ', { ccjRequestedAt: claim.countyCourtJudgmentRequestedAt, lng });

    case DefendantResponseStatus.DEFENDANT_OCON_FORM_RESPONSE:
      return t('PAGES.DASHBOARD.WAIT_CLAIMANT_RESPONSE', lng);

    case DefendantResponseStatus.DEFENDANT_PAPER_RESPONSE:
      return t('PAGES.DASHBOARD.CLAIM_CONTINUE_BY_POST', lng);

      // TODO: proceed offline is waiting on OCON to be complete
      // case DefendantResponseStatus.PROCEED_OFFLINE:
      //   if (claim.proceedOfflineReason === APPLICATION_BY_DEFENDANT) {
      //     return t('PAGES.DASHBOARD.YOU_APPLIED_TO_CHANGE_CLAIM', lng);
      //   }
      //   return t('PAGES.DASHBOARD.CLAIMANT_APPLIED_TO_CHANGE_CLAIM', lng);

    case DefendantResponseStatus.BUSINESS_QUEUE:
      return t('PAGES.DASHBOARD.CASE_PASSED_TO_CCBC', lng);

    case DefendantResponseStatus.CLAIMANT_ACCEPTED_ADMISSION_AND_REQUESTED_CCJ:
    case DefendantResponseStatus.CLAIMANT_ALTERNATIVE_PLAN_WITH_CCJ:
    case DefendantResponseStatus.CCJ_AFTER_SETTLEMENT_BREACHED:
    case DefendantResponseStatus.CCJ_BY_DETERMINATION_AFTER_SETTLEMENT_BREACHED:
    case DefendantResponseStatus.CLAIMANT_REQUESTS_CCJ_AFTER_DEFENDANT_REJECTS_SETTLEMENT:
      return t('PAGES.DASHBOARD.CLAIMANT_REQUESTED_CCJ_AGAINS_YOU', { claimantName: claim.getClaimantFullName(), lng });

    case DefendantResponseStatus.CLAIMANT_ACCEPTED_ADMISSION:
    case DefendantResponseStatus.CLAIMANT_ACCEPTED_COURT_PLAN_SETTLEMENT:
    case DefendantResponseStatus.CLAIMANT_ACCEPTED_ADMISSION_AND_DEFENDANT_NOT_SIGNED:
      return t('PAGES.DASHBOARD.ASKED_TO_SIGN_SETTLEMENT', { claimantName: claim.getClaimantFullName(), lng });

    case DefendantResponseStatus.ELIGIBLE_FOR_CCJ_AFTER_PART_ADMIT_PAY_IMMEDIATELY_PAST_DEADLINE:
      return t('PAGES.DASHBOARD.CLAIMANT_ACCEPTED_ADMISSION', { claimantName: claim.getClaimantFullName(), amount: claim.partialAdmission.howMuchDoYouOwe.amount, lng });

    case DefendantResponseStatus.ADMISSION_SETTLEMENT_AGREEMENT_REACHED:
      return t('PAGES.DASHBOARD.BOTH_SIGNED_SETTLEMENT', lng);

    case DefendantResponseStatus.RESPONSE_SUBMITTED:
      if (claim.isFullDefence()) {
        if (claim.rejectAllOfClaim?.option === RejectAllOfClaimType.ALREADY_PAID) {
          return t('PAGES.DASHBOARD.CLAIMANT_EMAILED', { claimantName: claim.getClaimantFullName(), lng });
        }
        if (claim.mediation.mediationDisagreement.option === YesNo.NO) {
          return t('PAGES.DASHBOARD.REJECTED_CLAIM', lng);
        }
        if (claim.rejectAllOfClaim?.option !== RejectAllOfClaimType.ALREADY_PAID || claim.mediation.mediationDisagreement.option === YesNo.YES) {
          return t('PAGES.DASHBOARD.REJECTED_CLAIM_AND_SUGGESTED_MEDIATION', lng);
        }
      } else if (claim.isPartialAdmission()) {
        if (claim.partialAdmission.paymentIntention) {
          return t('PAGES.DASHBOARD.CLAIMANT_EMAILED', { claimantName: claim.getClaimantFullName(), lng });
        }
        return t('PAGES.DASHBOARD.ADMITTED_PART_OF_CLAIM', lng);
      } else if (claim.isFullAdmission()) {
        if (claim.fullAdmission.paymentIntention.paymentOption === PaymentOptionType.IMMEDIATELY) {
          return t('PAGES.DASHBOARD.ADMITTED_ALL_PAY_IMMEDIATELY', lng);
        } else if (claim.fullAdmission.paymentIntention.paymentOption === PaymentOptionType.BY_SET_DATE) {
          return t('PAGES.DASHBOARD.ADMITTED_ALL_PAY_BY_SET_DATE', { paymentDate: claim.fullAdmission.paymentIntention.paymentDate, lng });
        }
      }

  }
};
