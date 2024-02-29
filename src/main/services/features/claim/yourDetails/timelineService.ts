import {getCaseDataFromStore, saveDraftClaim} from '../../../../modules/draft-store/draftStoreService';
import {ClaimDetails} from '../../../../common/form/models/claim/details/claimDetails';
import {ClaimantTimeline} from '../../../../common/form/models/timeLineOfEvents/claimantTimeline';
import {Claim} from 'models/claim';
import {TimeLineOfEventDetails} from 'models/timelineOfEvents/timeLineOfEvents';
import {formatDateToFullDate} from 'common/utils/dateUtils';

const getTimeline = (claimDetails: ClaimDetails) : ClaimantTimeline => {
  return (claimDetails?.timeline) ? ClaimantTimeline.buildPopulatedForm(claimDetails.timeline.rows) : ClaimantTimeline.buildEmptyForm();
};

const getDisplayedTimeline = (claim: Claim, lng: string) : TimeLineOfEventDetails[] => {
  const timeline : TimeLineOfEventDetails[] = [];
  if (claim.timelineOfEvents) {
    claim.timelineOfEvents.forEach(event => timeline.push({
      timelineDate: formatDateToFullDate(new Date(event.value.timelineDate), lng),
      timelineDescription: event.value.timelineDescription,
    }));
  }
  return timeline;
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
  getDisplayedTimeline,
  saveTimeline,
};
