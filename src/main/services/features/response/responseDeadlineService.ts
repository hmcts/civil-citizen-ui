import {getCaseDataFromStore, saveDraftClaim} from '../../../modules/draft-store/draftStoreService';
import {ResponseDeadline, ResponseOptions} from '../../../common/form/models/responseDeadline';
import {AdditionalTimeOptions} from '../../../common/form/models/additionalTime';
import {AgreedResponseDeadline} from '../../../common/form/models/agreedResponseDeadline';
import {Claim} from '../../../common/models/claim';

const {Logger} = require('@hmcts/nodejs-logging');
const logger = Logger.getLogger('partialAdmissionService');

export class ResponseDeadlineService {
  getAdditionalTime(additionalTime: string): AdditionalTimeOptions {
    switch (additionalTime) {
      case AdditionalTimeOptions.UP_TO_28_DAYS:
        return AdditionalTimeOptions.UP_TO_28_DAYS;
      case AdditionalTimeOptions.MORE_THAN_28_DAYS:
        return AdditionalTimeOptions.MORE_THAN_28_DAYS;
      default:
        return undefined;
    }
  }

  public async saveDeadlineResponse(claimId: string, deadlineResponse: ResponseOptions): Promise<void> {
    try {
      const claim = await getCaseDataFromStore(claimId);
      if (claim.responseDeadline) {
        claim.responseDeadline.option = deadlineResponse;
        if (deadlineResponse !== ResponseOptions.YES) {
          claim.responseDeadline.additionalTime = undefined;
        }
      } else {
        claim.responseDeadline = new ResponseDeadline(deadlineResponse);
      }
      await saveDraftClaim(claimId, claim);
    } catch (error) {
      logger.error(error);
      throw error;
    }
  }

  public async saveAdditionalTime(claimId: string, additionalTime: AdditionalTimeOptions): Promise<void> {
    try {
      const claim = await getCaseDataFromStore(claimId);
      if (claim.responseDeadline) {
        claim.responseDeadline.additionalTime = additionalTime;
      } else {
        claim.responseDeadline = new ResponseDeadline();
        claim.responseDeadline.additionalTime = additionalTime;
      }
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

export function setDate(date: Date): AgreedResponseDeadline {
  const agreedResponseDeadline = new AgreedResponseDeadline();
  agreedResponseDeadline.date = new Date(date);
  agreedResponseDeadline.year = agreedResponseDeadline.date.getFullYear();
  agreedResponseDeadline.month = agreedResponseDeadline.date.getMonth() + 1;
  agreedResponseDeadline.day = agreedResponseDeadline.date.getDate();
  return agreedResponseDeadline;
}
