import {saveDraftClaim} from 'modules/draft-store/draftStoreService';
import {LiftBreathingSpaceForm} from 'common/form/models/breathingSpace/liftBreathingSpaceForm';
import {Claim} from 'common/models/claim';

export const getLiftBreathingSpaceForm = async (claimId: string, claim: Claim): Promise<LiftBreathingSpaceForm> => {
  const liftBreathing = claim.breathingSpace?.liftBreathing;
  if (liftBreathing?.expectedEnd) {
    const date = new Date(liftBreathing.expectedEnd);
    return new LiftBreathingSpaceForm(
      date.getFullYear().toString(),
      (date.getMonth() + 1).toString(),
      date.getDate().toString(),
      liftBreathing.eventDescription,
    );
  }
  return new LiftBreathingSpaceForm();
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
