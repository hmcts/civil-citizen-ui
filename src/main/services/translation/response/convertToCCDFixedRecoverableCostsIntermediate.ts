import {toCCDYesNo} from 'services/translation/response/convertToCCDYesNo';
import {FixedRecoverableCosts} from 'models/directionsQuestionnaire/fixedRecoverableCosts/fixedRecoverableCosts';
import {CCDComplexityBand} from 'models/ccdResponse/ccdFixedRecoverableCostsIntermediate';
import {ComplexityBandOptions} from 'models/directionsQuestionnaire/fixedRecoverableCosts/complexityBandOptions';
import {YesNo} from 'form/models/yesNo';

export const toCCDFixedRecoverableCostsIntermediate = (fixedRecoverableCosts: FixedRecoverableCosts | undefined) => {
  if (fixedRecoverableCosts) {
    let reasons;
    if (fixedRecoverableCosts?.subjectToFrc.option === YesNo.NO) {
      reasons = fixedRecoverableCosts?.reasonsForNotSubjectToFrc;
    } else {
      reasons = fixedRecoverableCosts?.reasonsForBandSelection;
    }
    return {
      isSubjectToFixedRecoverableCostRegime: toCCDYesNo(fixedRecoverableCosts?.subjectToFrc?.option),
      band: toComplexityBand(fixedRecoverableCosts?.complexityBand),
      complexityBandingAgreed: toCCDYesNo(fixedRecoverableCosts?.frcBandAgreed?.option),
      reasons: reasons,
    };
  }
};

const toComplexityBand = (band: string): CCDComplexityBand => {
  switch (band) {
    case ComplexityBandOptions.BAND_1:
      return CCDComplexityBand.BAND_1;
    case ComplexityBandOptions.BAND_2:
      return CCDComplexityBand.BAND_2;
    case ComplexityBandOptions.BAND_3:
      return CCDComplexityBand.BAND_3;
    case ComplexityBandOptions.BAND_4:
      return CCDComplexityBand.BAND_4;
    default:
      return undefined;
  }
};
