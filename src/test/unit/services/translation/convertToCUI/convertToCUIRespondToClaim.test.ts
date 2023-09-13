import {CCDHowWasThisAmountPaid, CCDRespondToClaim} from 'models/ccdResponse/ccdRespondToClaim';
import {toCUIRespondToClaim} from 'services/translation/convertToCUI/convertToCUIRespondToClaim';

describe('convert to CUI respond to claim', () => {
  it('should translate to CUI Respond to Claim Full Reject', () => {
    // Given
    const ccdRespondToClaim = <CCDRespondToClaim> {
      howMuchWasPaid: 10000,
      howWasThisAmountPaid: CCDHowWasThisAmountPaid.OTHER,
      whenWasThisAmountPaid: new Date(2022, 2, 3),
      howWasThisAmountPaidOther: 'this is some text',
    };
    // When
    const ccdResponse = toCUIRespondToClaim(ccdRespondToClaim);
    // Then
    expect(ccdResponse.amount).toEqual(ccdRespondToClaim.howMuchWasPaid/100);
    expect(ccdResponse.text).toEqual(ccdRespondToClaim.howWasThisAmountPaidOther);
    expect(ccdResponse.date).toEqual(ccdRespondToClaim.whenWasThisAmountPaid);
  });
});
