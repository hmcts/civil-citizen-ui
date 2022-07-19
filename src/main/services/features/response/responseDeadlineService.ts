import {getCaseDataFromStore, saveDraftClaim} from '../../../modules/draft-store/draftStoreService';
import {ResponseDeadline, ResponseOptions} from '../../../common/form/models/responseDeadline';

const {Logger} = require('@hmcts/nodejs-logging');
const logger = Logger.getLogger('partialAdmissionService');

export class ResponseDeadlineService {
  public async saveDeadlineResponse(claimId: string, deadlineResponse: ResponseOptions): Promise<void> {
    try {
      const claim = await getCaseDataFromStore(claimId);
      (claim.responseDeadline) ?
        claim.responseDeadline.option = deadlineResponse :
        claim.responseDeadline = new ResponseDeadline(deadlineResponse);
      await saveDraftClaim(claimId, claim);
    } catch (error) {
      logger.error(error);
      throw error;
    }
  }
}
