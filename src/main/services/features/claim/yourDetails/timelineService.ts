import {getCaseDataFromStore, saveDraftClaim} from '../../../../modules/draft-store/draftStoreService';
import {ClaimDetails} from '../../../../common/form/models/claim/details/claimDetails';
import {ClaimantTimeline} from '../../../../common/form/models/timeLineOfEvents/claimantTimeline';

const getTimeline = (claimDetails: ClaimDetails) : ClaimantTimeline => {
  return (claimDetails?.timeline) ? ClaimantTimeline.buildPopulatedForm(claimDetails.timeline.rows) : ClaimantTimeline.buildEmptyForm();
};

const saveTimeline = async (claimId: string, timeline: ClaimantTimeline) => {
  const claim = await getCaseDataFromStore(claimId);
  if (!claim?.claimDetails) {
    claim.claimDetails = new ClaimDetails();
  }
  timeline.filterOutEmptyRows();
  claim.claimDetails.timeline = timeline;
  await saveDraftClaim(claimId, claim);
};

export {
  getTimeline,
  saveTimeline,
};
