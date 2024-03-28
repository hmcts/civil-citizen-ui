import {DefendantTimeline} from '../../../../common/form/models/timeLineOfEvents/defendantTimeline';
import {getCaseDataFromStore, saveDraftClaim} from '../../../../modules/draft-store/draftStoreService';
import {PartialAdmission} from '../../../../common/models/partialAdmission';
import {Claim} from '../../../../common/models/claim';
import {RejectAllOfClaim} from 'form/models/rejectAllOfClaim';

const {Logger} = require('@hmcts/nodejs-logging');
const logger = Logger.getLogger('defendantTimelineService');

const getDefendantTimeline = (claim: Claim): DefendantTimeline => {
  const timeline: DefendantTimeline = claim.isPartialAdmission()
    ? claim.partialAdmission?.timeline
    : claim.rejectAllOfClaim?.timeline;
  if (timeline) {
    return DefendantTimeline.buildPopulatedForm(timeline.rows, timeline.comment);
  }
  return DefendantTimeline.buildEmptyForm();
};

const saveDefendantTimeline = async (claimId: string, timeline: DefendantTimeline) => {
  try {
    const claim = await getCaseDataFromStore(claimId);
    timeline.filterOutEmptyRows();
    if (claim.isPartialAdmission()) {
      if (!claim.partialAdmission) {
        claim.partialAdmission = new PartialAdmission();
      }
      claim.partialAdmission.timeline = timeline;
    } else {
      if (!claim.rejectAllOfClaim) {
        claim.rejectAllOfClaim = new RejectAllOfClaim();
      }
      claim.rejectAllOfClaim.timeline = timeline;
    }
    await saveDraftClaim(claimId, claim);
  } catch (error) {
    logger.error(error);
    throw error;
  }
};

export {
  getDefendantTimeline,
  saveDefendantTimeline,
};
