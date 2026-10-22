import {YesNo, YesNoUpperCamelCase} from 'form/models/yesNo';
import {CCDClaim} from 'common/models/civilClaimResponse';
import {toCUIFixedRecoverableCosts} from 'services/translation/convertToCUI/convertToCUIFixedRecoverableCosts';
import {CCDComplexityBand} from 'models/ccdResponse/ccdFixedRecoverableCostsIntermediate';
import {ComplexityBandOptions} from 'models/directionsQuestionnaire/fixedRecoverableCosts/complexityBandOptions';

describe('toCUIFixedRecoverableCosts', () => {
  it('should return undefined when ccdClaim is undefined', () => {
    expect(toCUIFixedRecoverableCosts(undefined)).toBeUndefined();
  });

  it('should return undefined when FRC regime field is missing', () => {
    const ccdClaim = {
      respondent1DQFixedRecoverableCostsIntermediate: {},
    } as CCDClaim;
    expect(toCUIFixedRecoverableCosts(ccdClaim)).toBeUndefined();
  });

  it('should map YES subject to FRC with band and reasons for band selection', () => {
    const ccdClaim = {
      respondent1DQFixedRecoverableCostsIntermediate: {
        isSubjectToFixedRecoverableCostRegime: YesNoUpperCamelCase.YES,
        complexityBandingAgreed: YesNoUpperCamelCase.YES,
        band: CCDComplexityBand.BAND_2,
        reasons: 'band reason',
      },
    } as CCDClaim;

    const result = toCUIFixedRecoverableCosts(ccdClaim);

    expect(result.subjectToFrc.option).toBe(YesNo.YES);
    expect(result.frcBandAgreed.option).toBe(YesNo.YES);
    expect(result.complexityBand).toBe(ComplexityBandOptions.BAND_2);
    expect(result.reasonsForBandSelection).toBe('band reason');
    expect(result.reasonsForNotSubjectToFrc).toBeUndefined();
  });

  it('should map NO subject to FRC and use reasons for not subject', () => {
    const ccdClaim = {
      respondent1DQFixedRecoverableCostsIntermediate: {
        isSubjectToFixedRecoverableCostRegime: YesNoUpperCamelCase.NO,
        complexityBandingAgreed: YesNoUpperCamelCase.NO,
        band: CCDComplexityBand.BAND_4,
        reasons: 'not frc reason',
      },
    } as CCDClaim;

    const result = toCUIFixedRecoverableCosts(ccdClaim);

    expect(result.subjectToFrc.option).toBe(YesNo.NO);
    expect(result.complexityBand).toBe(ComplexityBandOptions.BAND_4);
    expect(result.reasonsForNotSubjectToFrc).toBe('not frc reason');
    expect(result.reasonsForBandSelection).toBeUndefined();
  });

  it('should map all complexity bands including unknown as undefined', () => {
    const build = (band: CCDComplexityBand | string) => toCUIFixedRecoverableCosts({
      respondent1DQFixedRecoverableCostsIntermediate: {
        isSubjectToFixedRecoverableCostRegime: YesNoUpperCamelCase.YES,
        band,
      },
    } as CCDClaim);

    expect(build(CCDComplexityBand.BAND_1).complexityBand).toBe(ComplexityBandOptions.BAND_1);
    expect(build(CCDComplexityBand.BAND_2).complexityBand).toBe(ComplexityBandOptions.BAND_2);
    expect(build(CCDComplexityBand.BAND_3).complexityBand).toBe(ComplexityBandOptions.BAND_3);
    expect(build(CCDComplexityBand.BAND_4).complexityBand).toBe(ComplexityBandOptions.BAND_4);
    expect(build('UNKNOWN' as CCDComplexityBand).complexityBand).toBeUndefined();
  });
});
