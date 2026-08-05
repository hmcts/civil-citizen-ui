import {saveDraftClaim} from 'modules/draft-store/draftStoreService';
import {
  getDefaultStandardLiftEndDate,
  LiftBreathingSpaceForm,
  STANDARD_BREATHING_SPACE,
} from 'common/form/models/breathingSpace/liftBreathingSpaceForm';
import {Claim} from 'common/models/claim';

export const getBreathingSpaceEnterStartDate = (claim: Claim): Date => {
  if (claim.enterBreathing?.start) {
    const d = new Date(claim.enterBreathing.start);
    d.setHours(0, 0, 0, 0);
    return d;
  }
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return today;
};

export const getLiftBreathingSpaceForm = async (claimId: string, claim: Claim): Promise<LiftBreathingSpaceForm> => {
  const liftBreathing = claim.breathingSpace?.liftBreathing;
  const startDate = getBreathingSpaceEnterStartDate(claim);
  const breathingSpaceType = claim.enterBreathing?.type ?? claim.breathingSpace?.enterBreathing?.type;

  if (liftBreathing?.expectedEnd) {
    const date = new Date(liftBreathing.expectedEnd);
    return new LiftBreathingSpaceForm(
      date.getFullYear().toString(),
      (date.getMonth() + 1).toString(),
      date.getDate().toString(),
      liftBreathing.eventDescription,
      startDate,
      breathingSpaceType,
    );
  }
  if (breathingSpaceType === STANDARD_BREATHING_SPACE) {
    const endDate = getDefaultStandardLiftEndDate(startDate);
    return new LiftBreathingSpaceForm(
      endDate.getFullYear().toString(),
      (endDate.getMonth() + 1).toString(),
      endDate.getDate().toString(),
      undefined,
      startDate,
      breathingSpaceType,
    );
  }
  return new LiftBreathingSpaceForm(undefined, undefined, undefined, undefined, startDate, breathingSpaceType);
};

export const saveLiftBreathingSpace = async (claimId: string, claim: Claim, form: LiftBreathingSpaceForm): Promise<void> => {
  if (!claim.breathingSpace) {
    claim.breathingSpace = {};
  }
  claim.breathingSpace.liftBreathing = {
    expectedEnd: form.date?.toISOString().split('T')[0],
    eventDescription: form.text,
  };
  await saveDraftClaim(claimId, claim);
};
