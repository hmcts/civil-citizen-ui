import {BreathingSpace} from "models/breathingSpace";
import {CcdBreathingSpace} from "models/ccdBreathingSpace/ccdBreathingScpace";
import {convertToCCDBreathingSpace} from "services/translation/breathingSpace/convertToCCDBreathingSpace";

export const translateBreathSpaceToCCD = (breathingSpace: BreathingSpace): CcdBreathingSpace =>{
  return {
    breathingSpaceEnterInfo: convertToCCDBreathingSpace(breathingSpace)
  }
}