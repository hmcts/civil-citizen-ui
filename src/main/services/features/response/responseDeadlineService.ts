import {getCaseDataFromStore, saveDraftClaim} from '../../../modules/draft-store/draftStoreService';
import {ResponseDeadline, ResponseOptions} from '../../../common/form/models/responseDeadline';
import {AgreedResponseDeadline} from '../../../common/form/models/agreedResponseDeadline';
import {Claim} from '../../../common/models/claim';

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

  public getAgreedResponseDeadline(claim: Claim): AgreedResponseDeadline {
    if (claim.responseDeadline?.agreedResponseDeadline) {
      return setDate(claim.responseDeadline?.agreedResponseDeadline);
    }
    return undefined;
  }

  public async saveAgreedResponseDeadline(claimId: string, agreedResponseDeadline: Date): Promise<void> {
    try {
      const claim = await getCaseDataFromStore(claimId);
      if (!claim.responseDeadline) {
        claim.responseDeadline = new ResponseDeadline();
      }
      claim.responseDeadline.agreedResponseDeadline = agreedResponseDeadline;
      await saveDraftClaim(claimId, claim);
    } catch (error) {
      logger.error(error);
      throw error;
    }

  }
}

function setDate(date: Date): AgreedResponseDeadline {
  const dateOfResponseDeadline = new Date(date);
  const agreedResponseDeadline = new AgreedResponseDeadline();
  agreedResponseDeadline.date = dateOfResponseDeadline;
  agreedResponseDeadline.year = dateOfResponseDeadline.getFullYear();
  agreedResponseDeadline.month = dateOfResponseDeadline.getMonth() + 1;
  agreedResponseDeadline.day = dateOfResponseDeadline.getDate();
  return agreedResponseDeadline;
}
