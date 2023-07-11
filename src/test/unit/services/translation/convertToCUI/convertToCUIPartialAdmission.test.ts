import {
  toCUIHowMuchHaveYouPaid,
  toCUIPartialAdmission,
  toCUIPaymentIntention,
  toCUIPaymentOption,
  toCUIRepaymentPlan,
  toCUIRepaymentPlanFrequency,
  toCUIResponseTimelineOfEvents,
} from 'services/translation/convertToCUI/convertToCUIPartialAdmission';
import {CCDRespondToClaim} from 'common/models/ccdResponse/ccdRespondToClaim';
import {CCDPaymentOption} from 'common/models/ccdResponse/ccdPaymentOption';
import {PaymentOptionType} from 'common/form/models/admission/paymentOption/paymentOptionType';
import {
  CCDRepaymentPlan,
  CCDRepaymentPlanFrequency,
} from 'common/models/ccdResponse/ccdRepaymentPlan';
import {CCDClaim} from 'common/models/civilClaimResponse';
import {CCDPayBySetDate} from 'common/models/ccdResponse/ccdPayBySetDate';
import {PartialAdmission} from 'common/models/partialAdmission';
import {CCDRespondentLiPResponse} from 'common/models/ccdResponse/ccdRespondentLiPResponse';
import {YesNo, YesNoUpperCamelCase} from 'common/form/models/yesNo';
import {
  CCDTimeLineOfEvents,
  CCDTimeLineOfEventsItem,
} from 'common/models/ccdResponse/ccdTimeLineOfEvents';

describe('translate partial admission to cui model', () => {
  describe('toCUIHowMuchHaveYouPaid', () => {
    it('should translate CCD data to CUI HowMuchHaveYouPaid model with empty respondToAdmittedClaim field', () => {
      // Given
      const respondToAdmittedClaim: CCDRespondToClaim = undefined;
      // When
      const cuiHowMuchHaveYouPaid = toCUIHowMuchHaveYouPaid(respondToAdmittedClaim);
      // Then
      expect(cuiHowMuchHaveYouPaid.amount).toBeUndefined();
      expect(cuiHowMuchHaveYouPaid.date).toBeUndefined();
      expect(cuiHowMuchHaveYouPaid.text).toBeUndefined();
    });

    it('should translate CCD data to CUI HowMuchHaveYouPaid with howMuchWasPaid field', () => {
      // Given
      const respondToAdmittedClaim = {howMuchWasPaid: 5500} as CCDRespondToClaim;
      // When
      const cuiHowMuchHaveYouPaid = toCUIHowMuchHaveYouPaid(respondToAdmittedClaim);
      // Then
      expect(cuiHowMuchHaveYouPaid.amount).toBe(55);
      expect(cuiHowMuchHaveYouPaid.date).toBeUndefined();
      expect(cuiHowMuchHaveYouPaid.text).toBeUndefined();
    });

    it('should translate CCD data to CUI HowMuchHaveYouPaid model with whenWasThisAmountPaid field', () => {
      // Given
      const respondToAdmittedClaim = {whenWasThisAmountPaid: new Date('2022-03-25')} as CCDRespondToClaim;
      // When
      const cuiHowMuchHaveYouPaid = toCUIHowMuchHaveYouPaid(respondToAdmittedClaim);
      // Then
      expect(cuiHowMuchHaveYouPaid.amount).toBeUndefined();
      expect(cuiHowMuchHaveYouPaid.date.toDateString()).toBe('Fri Mar 25 2022');
      expect(cuiHowMuchHaveYouPaid.text).toBeUndefined();
    });

    it('should translate CCD data to CUI HowMuchHaveYouPaid model with howWasThisAmountPaidOther', () => {
      // Given
      const respondToAdmittedClaim = {howWasThisAmountPaidOther: 'Credit card'} as CCDRespondToClaim;
      // When
      const cuiHowMuchHaveYouPaid = toCUIHowMuchHaveYouPaid(respondToAdmittedClaim);
      // Then
      expect(cuiHowMuchHaveYouPaid.amount).toBeUndefined();
      expect(cuiHowMuchHaveYouPaid.date).toBeUndefined();
      expect(cuiHowMuchHaveYouPaid.text).toBe('Credit card');
    });

    it('should translate CCD data to CUI HowMuchHaveYouPaid model with all fields', () => {
      // Given
      const respondToAdmittedClaim = {
        howMuchWasPaid: 5500,
        whenWasThisAmountPaid: new Date('2022-03-25'),
        howWasThisAmountPaidOther: 'Credit card',
      } as CCDRespondToClaim;
      // When
      const cuiHowMuchHaveYouPaid = toCUIHowMuchHaveYouPaid(respondToAdmittedClaim);
      // Then
      expect(cuiHowMuchHaveYouPaid.amount).toBe(55);
      expect(cuiHowMuchHaveYouPaid.date.toDateString()).toBe('Fri Mar 25 2022');
      expect(cuiHowMuchHaveYouPaid.text).toBe('Credit card');
    });
  });

  describe('toCUIResponseTimelineOfEvents', () => {
    it('should translate CCD data to CUI DefendantTimeline model without TOEs and comments', () => {
      // Given
      const timelineOfEvents: CCDTimeLineOfEvents[] = undefined;
      const timelineComment: string = undefined;
      // When
      const cuiResponseTimelineOfEvents = toCUIResponseTimelineOfEvents(timelineOfEvents, timelineComment);
      // Then
      expect(cuiResponseTimelineOfEvents.rows).toBeUndefined();
      expect(cuiResponseTimelineOfEvents.comment).toBeUndefined();
    });

    it('should translate CCD data to CUI DefendantTimeline model with only comments', () => {
      // Given
      const timelineOfEvents: CCDTimeLineOfEvents[] = undefined;
      const timelineComment = 'timeline comment';
      // When
      const cuiResponseTimelineOfEvents = toCUIResponseTimelineOfEvents(timelineOfEvents, timelineComment);
      // Then
      expect(cuiResponseTimelineOfEvents.rows).toBeUndefined();
      expect(cuiResponseTimelineOfEvents.comment).toBe('timeline comment');
    });

    it('should translate CCD data to CUI DefendantTimeline model with TOEs', () => {
      // Given
      const timelineOfEvents: CCDTimeLineOfEvents[] = [
        <CCDTimeLineOfEvents>{
          value: <CCDTimeLineOfEventsItem>{
            timelineDate: new Date('2022-09-22'),
            timelineDescription: 'you might have signed a contract',
          },
        },
      ];
      const timelineComment: string = undefined;
      // When
      const cuiResponseTimelineOfEvents = toCUIResponseTimelineOfEvents(timelineOfEvents, timelineComment);
      // Then
      expect(cuiResponseTimelineOfEvents.rows.length).toBe(1);
      expect(cuiResponseTimelineOfEvents.rows[0].date.toDateString()).toBe('Thu Sep 22 2022');
      expect(cuiResponseTimelineOfEvents.rows[0].description).toBe('you might have signed a contract');
      expect(cuiResponseTimelineOfEvents.comment).toBeUndefined();
    });

    it('should translate CCD data to CUI DefendantTimeline model with TOEs and comment', () => {
      // Given
      const timelineOfEvents: CCDTimeLineOfEvents[] = [
        <CCDTimeLineOfEvents>{
          value: <CCDTimeLineOfEventsItem>{
            timelineDate: new Date('2022-09-22'),
            timelineDescription: 'you might have signed a contract',
          },
        },
      ];
      const timelineComment = 'timeline comment';
      // When
      const cuiResponseTimelineOfEvents = toCUIResponseTimelineOfEvents(timelineOfEvents, timelineComment);
      // Then
      expect(cuiResponseTimelineOfEvents.rows.length).toBe(1);
      expect(cuiResponseTimelineOfEvents.rows[0].date.toDateString()).toBe('Thu Sep 22 2022');
      expect(cuiResponseTimelineOfEvents.rows[0].description).toBe('you might have signed a contract');
      expect(cuiResponseTimelineOfEvents.comment).toBe('timeline comment');
    });
  });

  describe('toCUIPaymentIntention', () => {
    it('should translate CCD data to CUI PaymentIntention model with undefined', () => {
      // Given
      const ccdClaim: CCDClaim = undefined;
      // When
      const cuiPaymentIntention = toCUIPaymentIntention(ccdClaim);
      // Then
      expect(cuiPaymentIntention.paymentOption).toBeUndefined();
    });
    it('should translate CCD data to CUI PaymentIntention model with pay immediatelty and add 5 days', () => {
      // Given
      const submittedDate = new Date('2023-01-05');
      submittedDate.setHours(10, 0, 0, 0);
      const resultDate = new Date('2023-01-10');
      resultDate.setHours(10, 0, 0, 0);
      const ccdClaim: CCDClaim = {defenceAdmitPartPaymentTimeRouteRequired: CCDPaymentOption.IMMEDIATELY, submittedDate: submittedDate} as CCDClaim;
      // When
      const cuiPaymentIntention = toCUIPaymentIntention(ccdClaim);
      // Then
      expect(cuiPaymentIntention.paymentOption).toBe(PaymentOptionType.IMMEDIATELY);
      expect(cuiPaymentIntention.paymentDate.getDate()).toBe(resultDate.getDate());
      expect(cuiPaymentIntention.repaymentPlan).toBeUndefined();
    });
    it('should translate CCD data to CUI PaymentIntention model with pay immediatelty and add 6 days', () => {
      // Given
      const submittedDate = new Date('2023-01-05');
      submittedDate.setHours(22, 0, 0, 0);
      const resultDate = new Date('2023-01-11');
      resultDate.setHours(22, 0, 0, 0);
      const ccdClaim: CCDClaim = {defenceAdmitPartPaymentTimeRouteRequired: CCDPaymentOption.IMMEDIATELY, submittedDate: submittedDate} as CCDClaim;
      // When
      const cuiPaymentIntention = toCUIPaymentIntention(ccdClaim);
      // Then
      expect(cuiPaymentIntention.paymentOption).toBe(PaymentOptionType.IMMEDIATELY);
      expect(cuiPaymentIntention.paymentDate.getDate()).toBe(resultDate.getDate());
      expect(cuiPaymentIntention.repaymentPlan).toBeUndefined();
    });
    it('should translate CCD data to CUI PaymentIntention model with pay by set date', () => {
      // Given
      const ccdClaim: CCDClaim = {
        defenceAdmitPartPaymentTimeRouteRequired: CCDPaymentOption.BY_SET_DATE,
        respondToClaimAdmitPartLRspec: <CCDPayBySetDate>{
          whenWillThisAmountBePaid: new Date('2022-03-25'),
        },
      };
      // When
      const cuiPaymentIntention = toCUIPaymentIntention(ccdClaim);
      // Then
      expect(cuiPaymentIntention.paymentOption).toBe(PaymentOptionType.BY_SET_DATE);
      expect(cuiPaymentIntention.paymentDate.toDateString()).toBe('Fri Mar 25 2022');
      expect(cuiPaymentIntention.repaymentPlan).toBeUndefined();
    });
    it('should translate CCD data to CUI PaymentIntention model with repayment plan', () => {
      // Given
      const ccdClaim: CCDClaim = {
        defenceAdmitPartPaymentTimeRouteRequired: CCDPaymentOption.REPAYMENT_PLAN,
        respondent1RepaymentPlan: <CCDRepaymentPlan>{
          paymentAmount: 5500,
          repaymentFrequency: CCDRepaymentPlanFrequency.ONCE_ONE_MONTH,
          firstRepaymentDate: new Date('2022-03-25'),
        },
      };
      // When
      const cuiPaymentIntention = toCUIPaymentIntention(ccdClaim);
      // Then
      expect(cuiPaymentIntention.paymentOption).toBe(PaymentOptionType.INSTALMENTS);
      expect(cuiPaymentIntention.paymentDate).toBeUndefined();
      expect(cuiPaymentIntention.repaymentPlan.paymentAmount).toBe(55);
      expect(cuiPaymentIntention.repaymentPlan.firstRepaymentDate.toDateString()).toBe('Fri Mar 25 2022');
      expect(cuiPaymentIntention.repaymentPlan.repaymentFrequency).toBe('MONTH');
    });
  });

  describe('toCUIPaymentOption', () => {
    it('should translate CCDPaymentOption to CUI PaymentOption with undefined', () => {
      // Given
      const ccdPaymentOption: CCDPaymentOption = undefined;
      // When
      const cuiPaymentOption = toCUIPaymentOption(ccdPaymentOption);
      // Then
      expect(cuiPaymentOption).toBeUndefined();
    });
    it('should translate CCDPaymentOption to CUI PaymentOption with immediately', () => {
      // Given
      const ccdPaymentOption: CCDPaymentOption = CCDPaymentOption.IMMEDIATELY;
      // When
      const cuiPaymentOption = toCUIPaymentOption(ccdPaymentOption);
      // Then
      expect(cuiPaymentOption).toBe(PaymentOptionType.IMMEDIATELY);
    });
    it('should translate CCDPaymentOption to CUI PaymentOption with set date', () => {
      // Given
      const ccdPaymentOption: CCDPaymentOption = CCDPaymentOption.BY_SET_DATE;
      // When
      const cuiPaymentOption = toCUIPaymentOption(ccdPaymentOption);
      // Then
      expect(cuiPaymentOption).toBe(PaymentOptionType.BY_SET_DATE);
    });
    it('should translate CCDPaymentOption to CUI PaymentOption with repayment plan', () => {
      // Given
      const ccdPaymentOption: CCDPaymentOption = CCDPaymentOption.REPAYMENT_PLAN;
      // When
      const cuiPaymentOption = toCUIPaymentOption(ccdPaymentOption);
      // Then
      expect(cuiPaymentOption).toBe(PaymentOptionType.INSTALMENTS);
    });
  });

  describe('toCUIRepaymentPlan', () => {
    it('should translate CCDRepaymentPlan to CUI CCDRepaymentPlan model with empty respondToAdmittedClaim field', () => {
      // Given
      const ccdRepaymentPlan: CCDRepaymentPlan = undefined;
      // When
      const cuiRepaymentPlan = toCUIRepaymentPlan(ccdRepaymentPlan);
      // Then
      expect(cuiRepaymentPlan.paymentAmount).toBeUndefined();
      expect(cuiRepaymentPlan.firstRepaymentDate).toBeUndefined();
      expect(cuiRepaymentPlan.repaymentFrequency).toBeUndefined();
    });
    it('should translate CCDRepaymentPlan to CUI CCDRepaymentPlan model with paymentAmount field', () => {
      // Given
      const ccdRepaymentPlan = {paymentAmount: 5500} as CCDRepaymentPlan;
      // When
      const cuiRepaymentPlan = toCUIRepaymentPlan(ccdRepaymentPlan);
      // Then
      expect(cuiRepaymentPlan.paymentAmount).toBe(55);
      expect(cuiRepaymentPlan.firstRepaymentDate).toBeUndefined();
      expect(cuiRepaymentPlan.repaymentFrequency).toBeUndefined();
    });
    it('should translate CCDRepaymentPlan to CUI CCDRepaymentPlan model with firstRepaymentDate field', () => {
      // Given
      const ccdRepaymentPlan = {firstRepaymentDate: new Date('2022-03-25')} as CCDRepaymentPlan;
      // When
      const cuiRepaymentPlan = toCUIRepaymentPlan(ccdRepaymentPlan);
      // Then
      expect(cuiRepaymentPlan.paymentAmount).toBeUndefined();
      expect(cuiRepaymentPlan.firstRepaymentDate.toDateString()).toBe('Fri Mar 25 2022');
      expect(cuiRepaymentPlan.repaymentFrequency).toBeUndefined();
    });
    it('should translate CCDRepaymentPlan to CUI CCDRepaymentPlan model with repaymentFrequency field', () => {
      // Given
      const ccdRepaymentPlan = {repaymentFrequency: CCDRepaymentPlanFrequency.ONCE_ONE_MONTH} as CCDRepaymentPlan;
      // When
      const cuiRepaymentPlan = toCUIRepaymentPlan(ccdRepaymentPlan);
      // Then
      expect(cuiRepaymentPlan.paymentAmount).toBeUndefined();
      expect(cuiRepaymentPlan.firstRepaymentDate).toBeUndefined();
      expect(cuiRepaymentPlan.repaymentFrequency).toBe('MONTH');
    });
    it('should translate CCDRepaymentPlan to CUI CCDRepaymentPlan model with all fields', () => {
      // Given
      const ccdRepaymentPlan = {
        paymentAmount: 5500,
        firstRepaymentDate: new Date('2022-03-25'),
        repaymentFrequency: CCDRepaymentPlanFrequency.ONCE_ONE_MONTH,
      } as CCDRepaymentPlan;
      // When
      const cuiRepaymentPlan = toCUIRepaymentPlan(ccdRepaymentPlan);
      // Then
      expect(cuiRepaymentPlan.paymentAmount).toBe(55);
      expect(cuiRepaymentPlan.firstRepaymentDate.toDateString()).toBe('Fri Mar 25 2022');
      expect(cuiRepaymentPlan.repaymentFrequency).toBe('MONTH');
    });
  });

  describe('toCUIRepaymentPlanFrequency', () => {
    it('should translate CCDRepaymentPlanFrequency to CUI repaymentPlanFrequency with undefined', () => {
      // Given
      const ccdRepaymentPlanFrequency: CCDRepaymentPlanFrequency = undefined;
      // When
      const cuiRepaymentPlanFrequency = toCUIRepaymentPlanFrequency(ccdRepaymentPlanFrequency);
      // Then
      expect(cuiRepaymentPlanFrequency).toBeUndefined();
    });
    it('should translate CCDRepaymentPlanFrequency to CUI repaymentPlanFrequency with one week', () => {
      // Given
      const ccdRepaymentPlanFrequency: CCDRepaymentPlanFrequency = CCDRepaymentPlanFrequency.ONCE_ONE_WEEK;
      // When
      const cuiRepaymentPlanFrequency = toCUIRepaymentPlanFrequency(ccdRepaymentPlanFrequency);
      // Then
      expect(cuiRepaymentPlanFrequency).toBe('WEEK');
    });
    it('should translate CCDRepaymentPlanFrequency to CUI repaymentPlanFrequency with two weeks', () => {
      // Given
      const ccdRepaymentPlanFrequency: CCDRepaymentPlanFrequency = CCDRepaymentPlanFrequency.ONCE_TWO_WEEKS;
      // When
      const cuiRepaymentPlanFrequency = toCUIRepaymentPlanFrequency(ccdRepaymentPlanFrequency);
      // Then
      expect(cuiRepaymentPlanFrequency).toBe('TWO_WEEKS');
    });
    it('should translate CCDRepaymentPlanFrequency to CUI repaymentPlanFrequency with four weeks', () => {
      // Given
      const ccdRepaymentPlanFrequency: CCDRepaymentPlanFrequency = CCDRepaymentPlanFrequency.ONCE_FOUR_WEEKS;
      // When
      const cuiRepaymentPlanFrequency = toCUIRepaymentPlanFrequency(ccdRepaymentPlanFrequency);
      // Then
      expect(cuiRepaymentPlanFrequency).toBe('FOUR_WEEKS');
    });
    it('should translate CCDRepaymentPlanFrequency to CUI repaymentPlanFrequency with one moth', () => {
      // Given
      const ccdRepaymentPlanFrequency: CCDRepaymentPlanFrequency = CCDRepaymentPlanFrequency.ONCE_ONE_MONTH;
      // When
      const cuiRepaymentPlanFrequency = toCUIRepaymentPlanFrequency(ccdRepaymentPlanFrequency);
      // Then
      expect(cuiRepaymentPlanFrequency).toBe('MONTH');
    });
  });

  describe('toCUIPartialAdmission', () => {
    it('should translate CCDRepaymentPlanFrequency to CUI repaymentPlanFrequency with undefined', () => {
      // Given
      const ccdClaim: CCDClaim = undefined;
      // When
      const cuiPartialAdmission = toCUIPartialAdmission(ccdClaim);
      // Then
      expect(cuiPartialAdmission).toMatchObject(new PartialAdmission());
    });
    it('Respond to claim & PAID', () => {
      // Given
      const ccdClaim: CCDClaim = {
        respondent1LiPResponse: <CCDRespondentLiPResponse>{
          timelineComment: 'timeline comment',
        },
        specDefenceAdmittedRequired: YesNoUpperCamelCase.YES,
        detailsOfWhyDoesYouDisputeTheClaim: 'reason',
      } as CCDClaim;
      // When
      const cuiPartialAdmission = toCUIPartialAdmission(ccdClaim);
      // Then
      expect(cuiPartialAdmission.alreadyPaid.option).toBe(YesNo.YES);
      expect(cuiPartialAdmission.whyDoYouDisagree.text).toBe('reason');
      expect(cuiPartialAdmission.timeline.comment).toBe('timeline comment');
      expect(cuiPartialAdmission.paymentIntention.paymentOption).toBeUndefined();
    });
    it('Respond to claim & NOT PAID', () => {
      // Given
      const ccdClaim: CCDClaim = {
        specDefenceAdmittedRequired: YesNoUpperCamelCase.NO,
        respondToAdmittedClaimOwingAmountPounds: '55',
        detailsOfWhyDoesYouDisputeTheClaim: 'reason',
        defenceAdmitPartPaymentTimeRouteRequired: CCDPaymentOption.IMMEDIATELY,
      } as CCDClaim;
      // When
      const cuiPartialAdmission = toCUIPartialAdmission(ccdClaim);
      // Then
      expect(cuiPartialAdmission.alreadyPaid.option).toBe(YesNo.NO);
      expect(cuiPartialAdmission.howMuchDoYouOwe.amount).toBe(55);
      expect(cuiPartialAdmission.whyDoYouDisagree.text).toBe('reason');
      expect(cuiPartialAdmission.timeline.comment).toBeUndefined();
      expect(cuiPartialAdmission.paymentIntention.paymentOption).toBe(PaymentOptionType.IMMEDIATELY);
    });
  });
});
