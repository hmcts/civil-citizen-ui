import {PartialAdmission} from 'models/partialAdmission';
import {HowMuchHaveYouPaid} from 'form/models/admission/howMuchHaveYouPaid';
import {Claim} from 'models/claim';
import {toCCDRespondToClaim} from 'services/translation/response/convertToCCDRespondToClaim';
import {CCDHowWasThisAmountPaid} from 'models/ccdResponse/ccdRespondToClaim';

describe('convert respond to claim', () => {
  it('should translate to Respond to Claim', () => {
    // Given
    const claim = new Claim();
    claim.partialAdmission = <PartialAdmission>{
      howMuchHaveYouPaid: <HowMuchHaveYouPaid> {
        amount: 10000,
        year: 2022,
        month: 2,
        day: 3,
        date: new Date(2022, 2, 3),
        text: 'this is some text',
        totalClaimAmount: 10000,
      },
    };
    // When
    const ccdResponse = toCCDRespondToClaim(claim.partialAdmission);
    // Then
    expect(ccdResponse.howMuchWasPaid).toEqual(claim.partialAdmission.howMuchHaveYouPaid.amount);
    expect(ccdResponse.howWasThisAmountPaid).toEqual(CCDHowWasThisAmountPaid.OTHER);
    expect(ccdResponse.howWasThisAmountPaidOther).toEqual(claim.partialAdmission.howMuchHaveYouPaid.text);
    expect(ccdResponse.whenWasThisAmountPaid).toEqual(claim.partialAdmission.howMuchHaveYouPaid.date);
  });
});
