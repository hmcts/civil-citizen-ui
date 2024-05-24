import {CuiJudgmentPaidInFull} from 'models/judgmentOnline/cuiJudgmentPaidInFull';
import {toCCDjudgmentPaidInFull} from 'services/translation/judgmentOnline/convertToCCDjudgmentPaidInFull';
import {Claim} from 'models/claim';
import {CCDJudgmentPaidInFull} from 'models/judgmentOnline/ccdJudgmentPaidInFull';

describe('should convert Judgment Paid In Full to CCD', () => {

  it('should map all values properly', () => {
    // Given
    const claim = new Claim();
    const judgmentPaidInFullClaim = new CuiJudgmentPaidInFull;
    judgmentPaidInFullClaim.dateOfFullPaymentMade = new Date(2022, 10, 11);
    judgmentPaidInFullClaim.confirmFullPaymentMade = true;
    claim.joJudgmentPaidInFull = judgmentPaidInFullClaim;

    // When
    const converted = toCCDjudgmentPaidInFull(claim);

    // Then
    const judgmentPaidInFullCCD: CCDJudgmentPaidInFull = {
      joJudgmentPaidInFull: {
        dateOfFullPaymentMade: new Date(2022, 10, 11),
        confirmFullPaymentMade: ['CONFIRMED'],
      },
    };

    expect(judgmentPaidInFullCCD.joJudgmentPaidInFull.dateOfFullPaymentMade).toEqual(converted.joJudgmentPaidInFull.dateOfFullPaymentMade);
    expect(judgmentPaidInFullCCD.joJudgmentPaidInFull.confirmFullPaymentMade).toEqual(converted.joJudgmentPaidInFull.confirmFullPaymentMade);
  });

  it('should handle null values', () => {
    // Given
    const claim = new Claim();
    const judgmentPaidInFullClaim = new CuiJudgmentPaidInFull;
    judgmentPaidInFullClaim.dateOfFullPaymentMade = null;
    judgmentPaidInFullClaim.confirmFullPaymentMade = null;
    claim.joJudgmentPaidInFull = judgmentPaidInFullClaim;

    // When
    const converted = toCCDjudgmentPaidInFull(claim);

    // Then
    const judgmentPaidInFullCCD: CCDJudgmentPaidInFull = {
      joJudgmentPaidInFull: {
        dateOfFullPaymentMade: null,
        confirmFullPaymentMade: null,
      },
    };

    expect(judgmentPaidInFullCCD.joJudgmentPaidInFull.dateOfFullPaymentMade).toEqual(converted.joJudgmentPaidInFull.dateOfFullPaymentMade);
    expect(judgmentPaidInFullCCD.joJudgmentPaidInFull.confirmFullPaymentMade).toEqual(converted.joJudgmentPaidInFull.confirmFullPaymentMade);
  });

  it('should handle null values for judgmentPaidInFull', () => {
    // Given
    const claim = new Claim();
    claim.joJudgmentPaidInFull = null;

    // When
    const converted = toCCDjudgmentPaidInFull(claim);

    // Then
    expect(converted.joJudgmentPaidInFull.dateOfFullPaymentMade).toBeNull();
    expect(converted.joJudgmentPaidInFull.confirmFullPaymentMade).toBeNull();
  });
});
