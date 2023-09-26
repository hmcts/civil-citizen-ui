import {CCDClaim} from 'models/civilClaimResponse';
import {BreathingSpace} from 'models/breathingSpace';
import {toCCDBreathingSpaceStartInfo} from 'services/translation/breathingSpace/convertToCCDBreathingSpaceStartInfo';

export const translateBreathingSpaceToCCD = (breathingSpace: BreathingSpace): CCDClaim => {
  return {
    enterBreathing: toCCDBreathingSpaceStartInfo(breathingSpace),
  };
};
