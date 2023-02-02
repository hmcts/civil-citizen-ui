import {CCDClaim} from "models/civilClaimResponse";
import {BreathingSpace} from "models/breathingSpace";
import {toCCDBreathingSpaceStartInfo} from "services/translation/breathingSpace/convertToCCDBreathingSpaceStrartInfo";

export const translateBreathingSpaceToCCD = (breathingSpace: BreathingSpace): CCDClaim => {
  return {
    enterBreathing: toCCDBreathingSpaceStartInfo(breathingSpace),
  }
}
