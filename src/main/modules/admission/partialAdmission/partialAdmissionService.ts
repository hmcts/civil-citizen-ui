import {getCaseDataFromStore, saveDraftClaim} from '../../../modules/draft-store/draftStoreService';
import {PartialAdmission} from '../../../common/models/partialAdmission';

const {Logger} = require('@hmcts/nodejs-logging');
const logger = Logger.getLogger('partialAdmissionService');

export class PartialAdmissionService {
  public async getClaimAlreadyPaid(claimId: string) {
    try {
      const claim = await getCaseDataFromStore(claimId);
      return claim.partialAdmission?.claimAlreadyPaid;
    } catch (error) {
      logger.error(error);
      throw error;
    }
  }

  public async saveClaimAlreadyPaid(claimId: string, alreadyPaid: boolean): Promise<void> {
    try {
      const claim = await getCaseDataFromStore(claimId);
      if (!claim.partialAdmission) {
        claim.partialAdmission = new PartialAdmission();
      }
      claim.partialAdmission.claimAlreadyPaid = alreadyPaid;
      await saveDraftClaim(claimId, claim);
    } catch (error) {
      logger.error(error);
      throw error;
    }
  }
}
