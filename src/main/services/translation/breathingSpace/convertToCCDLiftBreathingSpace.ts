import {Claim} from 'models/claim';
import {CCDLiftBreathingSpace} from 'models/ccdResponse/ccdBreathingSpace';

export const translateDraftLiftBreathingSpaceToCCD = (claim: Claim): CCDLiftBreathingSpace => {
  const liftBreathing = claim.breathingSpace?.liftBreathing;

  return {
    liftBreathing: {
      ...(liftBreathing?.expectedEnd ? {expectedEnd: liftBreathing.expectedEnd} : {}),
      ...(liftBreathing?.eventDescription ? {eventDescription: liftBreathing.eventDescription} : {}),
    },
  };
};
