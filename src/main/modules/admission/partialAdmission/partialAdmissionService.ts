import {getCaseDataFromStore, saveDraftClaim} from '../../../modules/draft-store/draftStoreService';
import {PartialAdmission} from '../../../common/models/partialAdmission';
import {AlreadyPaid} from '../../../common/form/models/admission/partialAdmission/alreadyPaid';

const {Logger} = require('@hmcts/nodejs-logging');
const logger = Logger.getLogger('partialAdmissionService');

export class PartialAdmissionService {
  public async getClaimAlreadyPaid(claimId: string) {
    try {
      const claim = await getCaseDataFromStore(claimId);
      return claim.partialAdmission?.alreadyPaid?.option;
    } catch (error) {
      logger.error(error);
      throw error;
    }
  }

  public async saveClaimAlreadyPaid(claimId: string, alreadyPaid: string): Promise<void> {
    try {
      const claim = await getCaseDataFromStore(claimId);
      if (claim.partialAdmission?.alreadyPaid) {
        claim.partialAdmission.alreadyPaid.option = alreadyPaid;
      } else {
        claim.partialAdmission = new PartialAdmission();
        claim.partialAdmission.alreadyPaid = new AlreadyPaid(alreadyPaid);
      }
      await saveDraftClaim(claimId, claim);
    } catch (error) {
      logger.error(error);
      throw error;
    }
  }
}
