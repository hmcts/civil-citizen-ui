import {getCaseDataFromStore, saveDraftClaim} from '../../../modules/draft-store/draftStoreService';
import {BreathingSpace} from '../../../common/models/breathingSpace';
import {ClaimDetails} from '../../../common/form/models/claim/details/claimDetails';

const {Logger} = require('@hmcts/nodejs-logging');
const logger = Logger.getLogger('breathingSpaceService');

const getBreathingSpace = async (claimId: string): Promise<BreathingSpace> => {
  try {
    const caseData = await getCaseDataFromStore(claimId, true);
    return caseData.claimDetails?.breathingSpace ?? new BreathingSpace();
  } catch (error) {
    logger.error(error);
    throw error;
  }
};

const saveBreathingSpace = async (claimId: string, value: any, breathingSpacePropertyName: string): Promise<void> => {
  try {
    const claim: any = await getCaseDataFromStore(claimId, true);
    if (!claim.claimDetails) {
      claim.claimDetails = new ClaimDetails();
    }
    if (claim.claimDetails.breathingSpace) {
      claim.claimDetails.breathingSpace[breathingSpacePropertyName] = value;
    } else {
      const breathingSpace: any = new BreathingSpace();
      breathingSpace[breathingSpacePropertyName] = value;
      claim.claimDetails.breathingSpace = breathingSpace;
    }
    await saveDraftClaim(claimId, claim, true);
  } catch (error) {
    logger.error(error);
    throw error;
  }
};

export {
  getBreathingSpace,
  saveBreathingSpace,
};
