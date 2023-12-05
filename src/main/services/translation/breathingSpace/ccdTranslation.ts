import {CCDClaim} from 'models/civilClaimResponse';
import {BreathingSpace} from 'models/breathingSpace';
import {
  toCCDBreathingSpaceLiftInfo,
  toCCDBreathingSpaceStartInfo,
} from 'services/translation/breathingSpace/convertToCCDBreathingSpaceStartInfo';

export const translateBreathingSpaceToCCD = (breathingSpace: BreathingSpace): CCDClaim => {
  return {
    enterBreathing: toCCDBreathingSpaceStartInfo(breathingSpace),
    liftBreathing: toCCDBreathingSpaceLiftInfo(breathingSpace),

  };
};
