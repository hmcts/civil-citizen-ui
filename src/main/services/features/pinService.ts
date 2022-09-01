import { saveDraftClaim } from '../../modules/draft-store/draftStoreService';
import { Claim } from '../../common/models/claim';

const { Logger } = require('@hmcts/nodejs-logging');
const logger = Logger.getLogger('defendantTimelineService');

// const getPartialAdmitTimeline = (claim: Claim): DefendantTimeline => {
//   if (claim.partialAdmission?.timeline) {
//     return DefendantTimeline.buildPopulatedForm(claim.partialAdmission.timeline.rows, claim.partialAdmission.timeline.comment);
//   }
//   return DefendantTimeline.buildEmptyForm();
// };

const savePin = async (claim: Claim, claimId: string) => {
  try {
    await saveDraftClaim(claimId, claim);
  } catch (error) {
    logger.error(error);
    throw error;
  }
};

export {
  savePin,
};
