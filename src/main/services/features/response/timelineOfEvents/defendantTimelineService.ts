import {Timeline} from '../../../../common/form/models/timeLineOfEvents/timeline';
import {getCaseDataFromStore, saveDraftClaim} from '../../../../modules/draft-store/draftStoreService';
import {PartialAdmission} from '../../../../common/models/partialAdmission';
import {Claim} from '../../../../common/models/claim';

const {Logger} = require('@hmcts/nodejs-logging');
const logger = Logger.getLogger('defendantTimelineService');

const getPartialAdmitTimeline = (claim: Claim): Timeline => {
  if (claim.partialAdmission?.timeline) {
    return Timeline.buildPopulatedForm(claim.partialAdmission.timeline.rows, claim.partialAdmission.timeline.comment);
  }
  return Timeline.buildEmptyForm();
};

const savePartialAdmitTimeline = async (claimId: string, timeline: Timeline) => {
  try {
    const claim = await getCaseDataFromStore(claimId);
    if (!claim.partialAdmission) {
      claim.partialAdmission = new PartialAdmission();
    }
    timeline.filterOutEmptyRows();
    claim.partialAdmission.timeline = timeline;
    await saveDraftClaim(claimId, claim);
  } catch (error) {
    logger.error(error);
    throw error;
  }
};

export {
  getPartialAdmitTimeline,
  savePartialAdmitTimeline,
};
