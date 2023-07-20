import {PartialAdmission} from 'models/partialAdmission';
import {PaymentOptionType} from 'form/models/admission/paymentOption/paymentOptionType';
import {toCCDRespondToClaim} from 'services/translation/response/convertToCCDRespondToClaim';
import {CCDHowWasThisAmountPaid} from 'models/ccdResponse/ccdRespondToClaim';
import {DefendantTimeline} from 'form/models/timeLineOfEvents/defendantTimeline';
import {TimelineRow} from 'form/models/timeLineOfEvents/timelineRow';

describe('convert respond to Claim', () => {

  it('should all values be mapped properly', () => {
    const timeline: DefendantTimeline = new DefendantTimeline([new TimelineRow(11, 11, 2022, 'Event description')]);
    // Given
    const respondToClaim: PartialAdmission = {
      whyDoYouDisagree: {
        text: 'Cause I can',
      },
      howMuchDoYouOwe: {
        amount: 10000,
        totalAmount: 222222,
      },
      alreadyPaid: {
        option:  'String option',
        messageName: 'This is a message',
      },
      howMuchHaveYouPaid: {
        text: 'This is an tex',
        amount: 20000,
        day: 11,
        date: new Date(2022, 10, 11),
        month: 10,
        totalClaimAmount: 222222,
        year: 2022,
      },
      timeline: timeline,
      paymentIntention: {
        paymentOption: PaymentOptionType.IMMEDIATELY,
        paymentDate: null,
        repaymentPlan: null,
      },
    };

    // When
    const converted = toCCDRespondToClaim(respondToClaim.howMuchHaveYouPaid);

    // Then
    expect(respondToClaim.howMuchHaveYouPaid.amount).toEqual(converted.howMuchWasPaid/100);
    expect(respondToClaim.howMuchHaveYouPaid.date).toEqual(converted.whenWasThisAmountPaid);
    expect(CCDHowWasThisAmountPaid.OTHER).toEqual(converted.howWasThisAmountPaid);
    expect(respondToClaim.howMuchHaveYouPaid.text).toEqual(converted.howWasThisAmountPaidOther);
  });
});
