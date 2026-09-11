import {
  CCDBreathingSpaceEnterInfo,
  CCDBreathingSpaceLiftInfo,
} from 'models/ccdResponse/ccdBreathingSpace';
import {BreathingSpaceEnterInfo} from 'models/breathingSpace/breathingSpaceEnterInfo';
import {BreathingSpaceLiftInfo} from 'models/breathingSpace/breathingSpaceLiftInfo';

const toDate = (value?: string | null): Date | undefined => {
  if (!value) {
    return undefined;
  }
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? undefined : date;
};

export const toCUIBreathingSpaceEnterInfo = (
  ccdEnterBreathing?: CCDBreathingSpaceEnterInfo,
): BreathingSpaceEnterInfo | undefined => {
  if (!ccdEnterBreathing) {
    return undefined;
  }

  return new BreathingSpaceEnterInfo(
    ccdEnterBreathing.type,
    ccdEnterBreathing.reference,
    toDate(ccdEnterBreathing.start),
    ccdEnterBreathing.expectedEnd === null
      ? null
      : toDate(ccdEnterBreathing.expectedEnd),
  );
};

export const toCUIBreathingSpaceLiftInfo = (
  ccdLiftBreathing?: CCDBreathingSpaceLiftInfo,
): BreathingSpaceLiftInfo | undefined => {
  if (!ccdLiftBreathing?.expectedEnd) {
    return undefined;
  }

  return new BreathingSpaceLiftInfo(toDate(ccdLiftBreathing.expectedEnd));
};
