import {AppRequest} from 'common/models/AppRequest';
import {getDraftClaim, updateDraftClaim} from '../../../../modules/draft-store/draftStoreManagerService';
import {ClaimDetails} from '../../../../common/form/models/claim/details/claimDetails';
import {ClaimantTimeline} from '../../../../common/form/models/timeLineOfEvents/claimantTimeline';

const getTimeline = (claimDetails: ClaimDetails) : ClaimantTimeline => {
  return (claimDetails?.timeline) ? ClaimantTimeline.buildPopulatedForm(claimDetails.timeline.rows) : ClaimantTimeline.buildEmptyForm();
};

const saveTimeline = async (req: AppRequest, timeline: ClaimantTimeline) => {
  const claim = await getDraftClaim(req);
  if (!claim?.claimDetails) {
    claim.claimDetails = new ClaimDetails();
  }
  timeline.filterOutEmptyRows();
  claim.claimDetails.timeline = timeline;
  await updateDraftClaim(req, claim, req.session?.draftId);
};

export {
  getTimeline,
  saveTimeline,
};
