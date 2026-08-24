import {convertDateToStringFormat} from 'common/utils/dateUtils';
import {BreathingSpaceEnterInfo} from 'models/breathingSpace/breathingSpaceEnterInfo';
import {BreathingSpaceLiftInfo} from 'models/breathingSpace/breathingSpaceLiftInfo';
import {
  CCDBreathingSpaceEnterInfo,
  CCDBreathingSpaceLiftInfo,
} from 'models/ccdResponse/ccdBreathingSpace';

export const toCCDBreathingSpaceEnterInfo = (
  enterBreathing?: BreathingSpaceEnterInfo,
): CCDBreathingSpaceEnterInfo | undefined => {
  if (!enterBreathing) {
    return undefined;
  }

  return {
    type: enterBreathing.type,
    reference: enterBreathing.reference,
    ...(enterBreathing.start ? {start: convertDateToStringFormat(enterBreathing.start)} : {}),
    expectedEnd: enterBreathing.expectedEnd
      ? convertDateToStringFormat(enterBreathing.expectedEnd)
      : enterBreathing.expectedEnd === null ? null : undefined,
  };
};

export const toCCDBreathingSpaceLiftInfo = (
  liftBreathing?: BreathingSpaceLiftInfo,
): CCDBreathingSpaceLiftInfo | undefined => {
  if (!liftBreathing?.expectedEnd) {
    return undefined;
  }

  return {
    expectedEnd: convertDateToStringFormat(liftBreathing.expectedEnd),
  };
};
