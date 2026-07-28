import {saveDraftClaim} from 'modules/draft-store/draftStoreService';
import {LiftBreathingSpaceForm} from 'common/form/models/breathingSpace/liftBreathingSpaceForm';
import {Claim} from 'common/models/claim';

const getStartDate = (claim: Claim): Date => {
  // TODO: replace with actual startDate from claim.breathingSpace.enterBreathing.start when JIRA for start date is complete
  if (claim.breathingSpace?.enterBreathing?.start) {
    const d = new Date(claim.breathingSpace.enterBreathing.start);
    d.setHours(0, 0, 0, 0);
    return d;
  }
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return today;
};

export const getLiftBreathingSpaceForm = async (claimId: string, claim: Claim): Promise<LiftBreathingSpaceForm> => {
  const liftBreathing = claim.breathingSpace?.liftBreathing;
  const startDate = getStartDate(claim);
  const breathingSpaceType = claim.breathingSpace?.enterBreathing?.type;

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
