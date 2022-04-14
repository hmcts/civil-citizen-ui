import {getCaseDataFromStore, saveDraftClaim} from '../../../modules/draft-store/draftStoreService';
import {Claim} from '../../../common/models/claim';

const {Logger} = require('@hmcts/nodejs-logging');
const logger = Logger.getLogger('partialAdmissionService');

export class PartialAdmissionService {
  public async getClaimAlreadyPaid(claimId: string) {
    try {
      const claim = await getCaseDataFromStore(claimId);
      return claim?.claimAlreadyPaid;
    } catch (error) {
      logger.error(error);
      throw error;
    }
  }

  public async saveClaimAlreadyPaid(claimId: string, alreadyPaid: boolean): Promise<void> {
    try {
      const claim = await getCaseDataFromStore(claimId) || new Claim();
      claim.claimAlreadyPaid = alreadyPaid;
      await saveDraftClaim(claimId, claim);
    } catch (error) {
      logger.error(error);
      throw error;
    }
  }
}
