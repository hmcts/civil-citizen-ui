import {DefendantTimeline} from 'common/form/models/timeLineOfEvents/defendantTimeline';
import {getResponseDraft, updateResponseDraft} from 'modules/draft-store/response/responseDraftStoreService';
import {PartialAdmission} from 'common/models/partialAdmission';
import {Claim} from 'common/models/claim';
import {RejectAllOfClaim} from 'form/models/rejectAllOfClaim';
import {normalizeRouteParam} from 'common/utils/routeParamUtils';
import {AppRequest} from 'models/AppRequest';

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

const saveDefendantTimeline = async (req: AppRequest, timeline: DefendantTimeline) => {
  try {
    const caseId = normalizeRouteParam(req.params.id);
    const draftResult = await getResponseDraft(req, caseId);
    if (!draftResult) {
      throw new Error('[defendantTimelineService] no response draft found');
    }

    const claim = Object.assign(new Claim(), draftResult.claimResponse?.case_data as unknown as Claim);
    const draftId = draftResult.rawResponse?.draftId;

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
    if (draftResult.createdAt && !claim.draftClaimCreatedAt) {
      claim.draftClaimCreatedAt = new Date(draftResult.createdAt);
    }
    await updateResponseDraft(req, caseId, claim, draftId);
  } catch (error) {
    logger.error(error);
    throw error;
  }
};

export {
  getDefendantTimeline,
  saveDefendantTimeline,
};
