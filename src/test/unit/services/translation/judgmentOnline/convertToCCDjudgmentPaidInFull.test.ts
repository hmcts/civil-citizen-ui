import {CuiJudgmentPaidInFull} from 'models/judgmentOnline/cuiJudgmentPaidInFull';
import {toCCDjudgmentPaidInFull} from 'services/translation/judgmentOnline/convertToCCDjudgmentPaidInFull';
import {Claim} from 'models/claim';
import {CCDJudgmentPaidInFull} from 'models/judgmentOnline/ccdJudgmentPaidInFull';

describe('convert Judgment Paid In Full', () => {

  it('should all values be mapped properly', () => {
    // Given
    const claim = new Claim();
    const judgmentPaidInFullClaim = new CuiJudgmentPaidInFull;
    judgmentPaidInFullClaim.dateOfFullPaymentMade = new Date(2022, 10, 11);
    judgmentPaidInFullClaim.confirmFullPaymentMade = true;
    claim.judgmentPaidInFull = judgmentPaidInFullClaim;

    // When
    const converted = toCCDjudgmentPaidInFull(claim);

    // Then
    const judgmentPaidInFullCCD: CCDJudgmentPaidInFull = {
      dateOfFullPaymentMade: new Date(2022, 10, 11),
      confirmFullPaymentMade: ['CONFIRMED'],
    };

    expect(judgmentPaidInFullCCD.dateOfFullPaymentMade).toEqual(converted.dateOfFullPaymentMade);
    expect(judgmentPaidInFullCCD.confirmFullPaymentMade).toEqual(converted.confirmFullPaymentMade);
  });
});
