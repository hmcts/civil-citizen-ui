import {CCDClaim} from 'common/models/civilClaimResponse';
import {toCUIGenericYesNo} from './convertToCUIYesNo';
import {FixedRecoverableCosts} from 'models/directionsQuestionnaire/fixedRecoverableCosts/fixedRecoverableCosts';
import {CCDComplexityBand} from 'models/ccdResponse/ccdFixedRecoverableCostsIntermediate';
import {ComplexityBandOptions} from 'models/directionsQuestionnaire/fixedRecoverableCosts/complexityBandOptions';
import {YesNo} from 'form/models/yesNo';

export const toCUIFixedRecoverableCosts = (ccdClaim: CCDClaim): FixedRecoverableCosts => {
  if (ccdClaim && ccdClaim.respondent1DQFixedRecoverableCostsIntermediate?.isSubjectToFixedRecoverableCostRegime) {
    const fixedRecoverableCosts: FixedRecoverableCosts = new FixedRecoverableCosts();
    fixedRecoverableCosts.subjectToFrc = toCUIGenericYesNo(ccdClaim.respondent1DQFixedRecoverableCostsIntermediate?.isSubjectToFixedRecoverableCostRegime);
    fixedRecoverableCosts.frcBandAgreed = toCUIGenericYesNo(ccdClaim.respondent1DQFixedRecoverableCostsIntermediate?.complexityBandingAgreed);
    fixedRecoverableCosts.complexityBand = toCUIComplexityBand(ccdClaim.respondent1DQFixedRecoverableCostsIntermediate?.band);
    if (fixedRecoverableCosts.subjectToFrc?.option === YesNo.YES) {
      fixedRecoverableCosts.reasonsForBandSelection = ccdClaim.respondent1DQFixedRecoverableCostsIntermediate?.reasons;
    } else {
      fixedRecoverableCosts.reasonsForNotSubjectToFrc = ccdClaim.respondent1DQFixedRecoverableCostsIntermediate?.reasons;
    }
    return fixedRecoverableCosts;
  }
};

const toCUIComplexityBand = (band : CCDComplexityBand) : string => {
  switch(band) {
    case CCDComplexityBand.BAND_1 :
      return ComplexityBandOptions.BAND_1;
    case CCDComplexityBand.BAND_2 :
      return ComplexityBandOptions.BAND_2;
    case CCDComplexityBand.BAND_3 :
      return ComplexityBandOptions.BAND_3;
    case CCDComplexityBand.BAND_4 :
      return ComplexityBandOptions.BAND_4;
    default:
      return undefined;
  }
};
