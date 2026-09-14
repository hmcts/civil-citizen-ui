import {getDraftClaim, updateDraftClaim} from '../../../../modules/draft-store/draftStoreManagerService';
import {Claim} from 'models/claim';
import {AppRequest} from 'models/AppRequest';
import {ClaimDetails} from '../../../../common/form/models/claim/details/claimDetails';
import {ClaimantTimeline} from '../../../../common/form/models/timeLineOfEvents/claimantTimeline';

const {Logger} = require('@hmcts/nodejs-logging');
const logger = Logger.getLogger('timelineService');

const getTimeline = (claimDetails: ClaimDetails) : ClaimantTimeline => {
  return (claimDetails?.timeline) ? ClaimantTimeline.buildPopulatedForm(claimDetails.timeline.rows) : ClaimantTimeline.buildEmptyForm();
};

const saveTimeline = async (req: AppRequest, timeline: ClaimantTimeline) => {
  try {
    const draftResult = await getDraftClaim(req);
    if (!draftResult) {
      throw new Error('[timelineService] no draft claim found');
    }

    const claim = Object.assign(new Claim(), draftResult.claimResponse?.case_data as unknown as Claim);
    const draftId = req.session?.draftId || draftResult.rawResponse?.draftId;

    if (!claim?.claimDetails) {
      claim.claimDetails = new ClaimDetails();
    }
    timeline.filterOutEmptyRows();
    claim.claimDetails.timeline = timeline;
    if (draftResult.createdAt && !claim.draftClaimCreatedAt) {
      claim.draftClaimCreatedAt = new Date(draftResult.createdAt);
    }
    await updateDraftClaim(req, claim, draftId);
  } catch (error) {
    logger.error(error);
    throw error;
  }
};

export {
  getTimeline,
  saveTimeline,
};
