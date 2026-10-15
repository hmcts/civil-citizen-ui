import {ClaimDetails} from '../../../../common/form/models/claim/details/claimDetails';
import {ClaimantTimeline} from '../../../../common/form/models/timeLineOfEvents/claimantTimeline';

const getTimeline = (claimDetails: ClaimDetails) : ClaimantTimeline => {
  return (claimDetails?.timeline) ? ClaimantTimeline.buildPopulatedForm(claimDetails.timeline.rows) : ClaimantTimeline.buildEmptyForm();
};

export {
  getTimeline,
};
