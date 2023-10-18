import {HowMuchHaveYouPaid} from 'common/form/models/admission/howMuchHaveYouPaid';
import {HowMuchDoYouOwe} from 'common/form/models/admission/partialAdmission/howMuchDoYouOwe';
import {WhyDoYouDisagree} from 'common/form/models/admission/partialAdmission/whyDoYouDisagree';
import {PaymentIntention} from 'common/form/models/admission/paymentIntention';
import {PaymentOptionType} from 'common/form/models/admission/paymentOption/paymentOptionType';
import {DefendantTimeline} from 'common/form/models/timeLineOfEvents/defendantTimeline';
import {TimelineRow} from 'common/form/models/timeLineOfEvents/timelineRow';
import {CCDPaymentOption} from 'common/models/ccdResponse/ccdPaymentOption';
import {CCDRepaymentPlan, CCDRepaymentPlanFrequency} from 'common/models/ccdResponse/ccdRepaymentPlan';
import {CCDRespondToClaim} from 'common/models/ccdResponse/ccdRespondToClaim';
import {CCDTimeLineOfEvents} from 'common/models/ccdResponse/ccdTimeLineOfEvents';
import {CCDClaim} from 'common/models/civilClaimResponse';
import {PartialAdmission} from 'common/models/partialAdmission';
import {RepaymentPlan} from 'common/models/repaymentPlan';
import {toCUIGenericYesNo} from './convertToCUIYesNo';
import {addDaysBefore4pm} from 'common/utils/dateUtils';
import {convertToPound} from 'services/translation/claim/moneyConversation';

export function toCUIPartialAdmission(ccdClaim: CCDClaim): PartialAdmission {
  const partialAdmission = new PartialAdmission();
  partialAdmission.alreadyPaid = toCUIGenericYesNo(ccdClaim?.specDefenceAdmittedRequired);
  partialAdmission.howMuchHaveYouPaid = toCUIHowMuchHaveYouPaid(ccdClaim?.respondToAdmittedClaim);
  partialAdmission.whyDoYouDisagree = new WhyDoYouDisagree(ccdClaim?.detailsOfWhyDoesYouDisputeTheClaim);
  partialAdmission.timeline = toCUIResponseTimelineOfEvents(ccdClaim?.specResponseTimelineOfEvents, ccdClaim?.respondent1LiPResponse?.timelineComment);
  partialAdmission.howMuchDoYouOwe = new HowMuchDoYouOwe(Number(ccdClaim?.respondToAdmittedClaimOwingAmountPounds));
  partialAdmission.paymentIntention = toCUIPaymentIntention(ccdClaim);
  return partialAdmission;
}

export function toCUIHowMuchHaveYouPaid(respondToAdmittedClaim: CCDRespondToClaim): HowMuchHaveYouPaid {
  const howMuchHaveYouPaid = new HowMuchHaveYouPaid();
  howMuchHaveYouPaid.amount = respondToAdmittedClaim?.howMuchWasPaid ? respondToAdmittedClaim.howMuchWasPaid/100 : undefined;
  howMuchHaveYouPaid.date = respondToAdmittedClaim?.whenWasThisAmountPaid;
  howMuchHaveYouPaid.text = respondToAdmittedClaim?.howWasThisAmountPaidOther;
  return howMuchHaveYouPaid;
}

export function toCUIResponseTimelineOfEvents(timelineOfEvents: CCDTimeLineOfEvents[], timelineComment: string): DefendantTimeline {
  const timelineRows = timelineOfEvents?.map(event => ({date: event.value?.timelineDate, description: event.value?.timelineDescription})) as TimelineRow[];
  return new DefendantTimeline(timelineRows, timelineComment);
}

export function toCUIPaymentIntention(ccdClaim: CCDClaim): PaymentIntention {
  const paymentIntention = new PaymentIntention();
  paymentIntention.paymentOption = toCUIPaymentOption(ccdClaim?.defenceAdmitPartPaymentTimeRouteRequired);
  if (ccdClaim?.defenceAdmitPartPaymentTimeRouteRequired === CCDPaymentOption.IMMEDIATELY) {
    const submittedDate = new Date(ccdClaim?.submittedDate);
    paymentIntention.paymentDate = addDaysBefore4pm(submittedDate, 5);
  } else if (ccdClaim?.defenceAdmitPartPaymentTimeRouteRequired === CCDPaymentOption.BY_SET_DATE) {
    paymentIntention.paymentDate = ccdClaim?.respondToClaimAdmitPartLRspec?.whenWillThisAmountBePaid;
  } else if (ccdClaim?.defenceAdmitPartPaymentTimeRouteRequired === CCDPaymentOption.REPAYMENT_PLAN) {
    paymentIntention.repaymentPlan = toCUIRepaymentPlan(ccdClaim?.respondent1RepaymentPlan);
  }
  return paymentIntention;
}

export function toCUIPaymentOption(paymentOption: CCDPaymentOption): PaymentOptionType {
  switch (paymentOption) {
    case CCDPaymentOption.IMMEDIATELY:
      return PaymentOptionType.IMMEDIATELY;
    case CCDPaymentOption.REPAYMENT_PLAN:
      return PaymentOptionType.INSTALMENTS;
    case CCDPaymentOption.BY_SET_DATE:
      return PaymentOptionType.BY_SET_DATE;
    default:
      return undefined;
  }
}

export function toCUIRepaymentPlan(respondentRepaymentPlan: CCDRepaymentPlan): RepaymentPlan {
  return {
    paymentAmount: convertToPound(respondentRepaymentPlan?.paymentAmount),
    firstRepaymentDate: respondentRepaymentPlan?.firstRepaymentDate,
    repaymentFrequency: toCUIRepaymentPlanFrequency(respondentRepaymentPlan?.repaymentFrequency),
  } as RepaymentPlan;
}

export function toCUIRepaymentPlanFrequency(repaymentFrequency: CCDRepaymentPlanFrequency): string {
  switch (repaymentFrequency) {
    case CCDRepaymentPlanFrequency.ONCE_ONE_WEEK:
      return 'WEEK';
    case CCDRepaymentPlanFrequency.ONCE_TWO_WEEKS:
      return 'TWO_WEEKS';
    case CCDRepaymentPlanFrequency.ONCE_FOUR_WEEKS:
      return 'FOUR_WEEKS';
    case CCDRepaymentPlanFrequency.ONCE_ONE_MONTH:
      return 'MONTH';
    default:
      return undefined;
  }
}
