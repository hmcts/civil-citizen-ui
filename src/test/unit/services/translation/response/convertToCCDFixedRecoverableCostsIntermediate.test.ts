import {Claim} from 'common/models/claim';
import {DirectionQuestionnaire} from 'models/directionsQuestionnaire/directionQuestionnaire';
import {YesNo, YesNoUpperCamelCase} from 'form/models/yesNo';
import {
  toCCDFixedRecoverableCostsIntermediate,
} from 'services/translation/response/convertToCCDFixedRecoverableCostsIntermediate';
import {ComplexityBandOptions} from 'models/directionsQuestionnaire/fixedRecoverableCosts/complexityBandOptions';
import {
  CCDComplexityBand,
  CCDFixedRecoverableCostsIntermediate,
} from 'models/ccdResponse/ccdFixedRecoverableCostsIntermediate';

describe('translate fixed recoverable costs to CCD model', () => {
  const claim = new Claim();
  claim.directionQuestionnaire = new DirectionQuestionnaire();

  it('should return undefined if frc doesnt exist', () => {
    const claimEmpty = new Claim();
    const ccdClaim = toCCDFixedRecoverableCostsIntermediate(claimEmpty?.directionQuestionnaire?.fixedRecoverableCosts);
    expect(ccdClaim).toBe(undefined);
  });

  it('should translate frc with bands to CCD', () => {
    claim.directionQuestionnaire.fixedRecoverableCosts = {
      subjectToFrc: {
        option: YesNo.YES,
      },
      frcBandAgreed: {
        option: YesNo.YES,
      },
      complexityBand: ComplexityBandOptions.BAND_3,
      reasonsForBandSelection: 'reasons',
    };
    const ccdClaim = toCCDFixedRecoverableCostsIntermediate(claim.directionQuestionnaire?.fixedRecoverableCosts);

    const expected: CCDFixedRecoverableCostsIntermediate = {
      isSubjectToFixedRecoverableCostRegime: YesNoUpperCamelCase.YES,
      band: CCDComplexityBand.BAND_3,
      complexityBandingAgreed: YesNoUpperCamelCase.YES,
      reasons: 'reasons',
    };
    expect(ccdClaim).toMatchObject(expected);
  });

  it('should translate frc to CCD when not subject to frc', () => {
    claim.directionQuestionnaire.fixedRecoverableCosts = {
      subjectToFrc: {
        option: YesNo.NO,
      },
      reasonsForNotSubjectToFrc: 'reasons',
    };
    const ccdClaim = toCCDFixedRecoverableCostsIntermediate(claim.directionQuestionnaire?.fixedRecoverableCosts);

    const expected: CCDFixedRecoverableCostsIntermediate = {
      isSubjectToFixedRecoverableCostRegime: YesNoUpperCamelCase.NO,
      reasons: 'reasons',
    };
    expect(ccdClaim).toMatchObject(expected);
  });

});
