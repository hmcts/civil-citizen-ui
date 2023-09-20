import {
  CCDBreathingSpaceStartInfo,
} from 'models/ccd/ccdBreathingSpace/ccdBreathingSpaceStartInfo';
import {BreathingSpace} from 'models/breathingSpace';

export const toCCDBreathingSpaceStartInfo = (breathingSpace: BreathingSpace): CCDBreathingSpaceStartInfo => {
  return {
    reference: breathingSpace?.debtRespiteReferenceNumber?.referenceNumber,
    start: breathingSpace?.debtRespiteStartDate?.date,
    type: breathingSpace?.debtRespiteOption?.type,
    expectedEnd: breathingSpace?.debtRespiteEndDate?.date,
  };
};
