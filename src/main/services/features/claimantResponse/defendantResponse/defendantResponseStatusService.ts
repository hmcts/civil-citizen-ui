import {DashboardDefendantItem} from 'common/models/dashboard/dashboardItem';
import {DefendantResponseStatus} from 'models/DefendantResponseStatus';
import {PaymentOptionType} from 'form/models/admission/paymentOption/paymentOptionType';
import {t} from 'i18next';
import { Claim } from 'common/models/claim';

const daysRemainingString = (days: number): string => {
  if(days > 0) {
    return t('PAGES.DASHBOARD.DAYS_REMAINING', {days: days});
  } else if(days < 0) {
    return t('PAGES.DASHBOARD.DAYS_OVERDUE', {days: days});
  } else if(days == 0) {
    return t('PAGES.DASHBOARD.DUE_TODAY');
  }
};

export const getStringStatus = (item: DashboardDefendantItem, claim: Claim): string => {
  switch (item.defendantResponseStatus){
    case DefendantResponseStatus.NO_RESPONSE:
      return t('PAGES.DASHBOARD.RESPONSE_TO_CLAIM', { noRemainingDays: daysRemainingString(claim?.getRemainingDays()) });

    case DefendantResponseStatus.ELIGIBLE_FOR_CCJ:
      return t('PAGES.DASHBOARD.ELIGIBLE_FOR_CCJ_YOU_HAVE_NOT_RESPONDED') + '\n' +
        t('PAGES.DASHBOARD.ELIGIBLE_FOR_CCJ_ASK_FOR_CCJ', { claimantName: item.claimantName }) + '\n' +
        t('PAGES.DASHBOARD.ELIGIBLE_FOR_CCJ_STILL_CAN_RESPOND');

    case DefendantResponseStatus.ELIGIBLE_FOR_CCJ_AFTER_FULL_ADMIT_PAY_IMMEDIATELY_PAST_DEADLINE:
      if(claim.fullAdmission.paymentIntention.paymentOption == PaymentOptionType.IMMEDIATELY ||
        claim.partialAdmission.paymentIntention.paymentOption == PaymentOptionType.IMMEDIATELY)
        return t('PAGES.DASHBOARD.PAST_DEADLINE_IMMEDIATELY');
      if(claim.fullAdmission.paymentIntention.paymentOption == PaymentOptionType.BY_SET_DATE ||
        claim.partialAdmission.paymentIntention.paymentOption == PaymentOptionType.BY_SET_DATE)
        return t('PAGES.DASHBOARD.PAST_DEADLINE_BY_SPECIFIED_DATE', { paymentDate: claim.fullAdmission.paymentIntention.paymentDate });
      if(claim.fullAdmission.paymentIntention.paymentOption == PaymentOptionType.INSTALMENTS ||
        claim.partialAdmission.paymentIntention.paymentOption == PaymentOptionType.INSTALMENTS)
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
  }
};
