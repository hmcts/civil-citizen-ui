import {DashboardDefendantItem} from 'common/models/dashboard/dashboardItem';
import {Request} from 'express';
import {ParamsDictionary} from 'express-serve-static-core';
import {DefendantResponseStatus} from 'models/DefendantResponseStatus';
import {getClaimById} from 'modules/utilityService';
import {ParsedQs} from 'qs';
import {PaymentOptionType} from 'form/models/admission/paymentOption/paymentOptionType';
import {t} from 'i18next';

const daysRemainingString = (days: number): string => {
  if(days > 0) {
    return days + ' days remaining';
  } else if(days < 0) {
    return days + ' overdue';
  } else if(days == 0) {
    return 'Due today.';
  }
};

export const getStringStatus = async (item: DashboardDefendantItem, req: Request<ParamsDictionary, any, any, ParsedQs, Record<string, any>>): Promise<string> => {
  const claim = await getClaimById(item.claimId, req);

  switch (item.defendantResponseStatus){
    case DefendantResponseStatus.NO_RESPONSE:
      return t('PAGES.DASHBOARD.RESPONSE_TO_CLAIM', { noRemainingDays: daysRemainingString(claim?.getRemainingDays()) });

    case DefendantResponseStatus.ELIGIBLE_FOR_CCJ:
      return t('PAGES.DASHBOARD.ELIGIBLE_FOR_CCJ_1') + '\n' +
        t('PAGES.DASHBOARD.ELIGIBLE_FOR_CCJ_2', { claimantName: item.claimantName }) + '\n' +
        t('PAGES.DASHBOARD.ELIGIBLE_FOR_CCJ_3');

      break;

    case DefendantResponseStatus.ELIGIBLE_FOR_CCJ_AFTER_FULL_ADMIT_PAY_IMMEDIATELY_PAST_DEADLINE:
      if(claim.fullAdmission.paymentIntention.paymentOption == PaymentOptionType.IMMEDIATELY ||
      claim.partialAdmission.paymentIntention.paymentOption == PaymentOptionType.IMMEDIATELY)
        return t('PAGES.DASHBOARD.PAST_DEADLINE_IMMEDIATELY');
      if(claim.fullAdmission.paymentIntention.paymentOption == PaymentOptionType.BY_SPECIFIED_DATE ||
        claim.partialAdmission.paymentIntention.paymentOption == PaymentOptionType.BY_SPECIFIED_DATE)
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
