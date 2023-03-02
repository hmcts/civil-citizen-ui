import {PartialAdmission} from 'models/partialAdmission';
import {PaymentOptionType} from 'form/models/admission/paymentOption/paymentOptionType';
import {toCCDAdmitPartRoute} from 'services/translation/response/convertToCCDAdmitPartRoute';
import {PaymentMethod} from 'models/ccdResponse/ccdAdmitPartRoute';

describe('convert respond to Claim', () => {

  it('should all values be ok', () => {
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
      timeline: {
        rows: [
          {
            date: '2022-11-11',
            description: 'some description of this event',
            isAtLeastOneFieldPopulated(): boolean {
              return true;
            },
            isEmpty(): boolean {
              return false;
            },
          },
        ],
        comment: 'Timeline comment',
        filterOutEmptyRows() {
          // not needed for tests but linter complaining about being missed
        },
      },
      paymentIntention: {
        paymentOption: PaymentOptionType.IMMEDIATELY,
        paymentDate: null,
        repaymentPlan: null,
      },
    };

    const converted = toCCDAdmitPartRoute(respondToClaim);
    expect(respondToClaim.howMuchHaveYouPaid.amount).toEqual(converted.howMuchWasPaid);
    expect(respondToClaim.howMuchHaveYouPaid.date).toEqual(converted.whenWasThisAmountPaid);
    expect(PaymentMethod.OTHER).toEqual(converted.howWasThisAmountPaid);
    expect(respondToClaim.howMuchHaveYouPaid.text).toEqual(converted.howWasThisAmountPaidOther);
    expect(respondToClaim.howMuchDoYouOwe.amount).toEqual(converted.respondToAdmittedClaimOwingAmount);
  });
});
