import {YesNoUpperCamelCase} from 'form/models/yesNo';

export enum CCDComplexityBand {
  BAND_1 = 'BAND_1',
  BAND_2 = 'BAND_2',
  BAND_3 = 'BAND_3',
  BAND_4 = 'BAND_4'
}

export interface CCDFixedRecoverableCostsIntermediate {
  isSubjectToFixedRecoverableCostRegime?: YesNoUpperCamelCase,
  band?: CCDComplexityBand,
  complexityBandingAgreed?: YesNoUpperCamelCase,
  reasons: string,
}
