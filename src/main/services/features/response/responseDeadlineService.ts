import {getResponseDraft, updateResponseDraft} from 'modules/draft-store/response/responseDraftStoreService';
import {ResponseDeadline, ResponseOptions} from 'common/form/models/responseDeadline';
import {AdditionalTimeOptions} from 'common/form/models/additionalTime';
import {AgreedResponseDeadline} from 'common/form/models/agreedResponseDeadline';
import {Claim} from 'common/models/claim';
import {getRouteParam} from 'common/utils/routeParamUtils';
import {AppRequest} from 'models/AppRequest';

const {Logger} = require('@hmcts/nodejs-logging');
const logger = Logger.getLogger('responseDeadlineService');

async function loadDraftClaim(req: AppRequest) {
  const caseId = getRouteParam(req, 'id');
  const draftResult = await getResponseDraft(req, caseId);
  if (!draftResult) {
    throw new Error('[responseDeadlineService] no response draft found');
  }
  const claim = Object.assign(new Claim(), draftResult.claimResponse?.case_data as unknown as Claim);
  const draftId = draftResult.rawResponse?.draftId;
  return {caseId, claim, draftId, draftResult};
}

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

  public async saveDeadlineResponse(req: AppRequest, deadlineResponse: ResponseOptions): Promise<void> {
    try {
      const {caseId, claim, draftId, draftResult} = await loadDraftClaim(req);

      if (claim.responseDeadline) {
        claim.responseDeadline.option = deadlineResponse;
        if (deadlineResponse !== ResponseOptions.YES) {
          claim.responseDeadline.additionalTime = undefined;
        }
      } else {
        claim.responseDeadline = new ResponseDeadline(deadlineResponse);
      }
      if (draftResult.createdAt && !claim.draftClaimCreatedAt) {
        claim.draftClaimCreatedAt = new Date(draftResult.createdAt);
      }
      await updateResponseDraft(req, caseId, claim, draftId);
    } catch (error) {
      logger.error(error);
      throw error;
    }
  }

  public async saveAdditionalTime(req: AppRequest, additionalTime: AdditionalTimeOptions): Promise<void> {
    try {
      const {caseId, claim, draftId, draftResult} = await loadDraftClaim(req);

      if (claim.responseDeadline) {
        claim.responseDeadline.additionalTime = additionalTime;
      } else {
        claim.responseDeadline = new ResponseDeadline();
        claim.responseDeadline.additionalTime = additionalTime;
      }
      if (draftResult.createdAt && !claim.draftClaimCreatedAt) {
        claim.draftClaimCreatedAt = new Date(draftResult.createdAt);
      }
      await updateResponseDraft(req, caseId, claim, draftId);
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

  public async saveAgreedResponseDeadline(req: AppRequest, agreedResponseDeadline: Date): Promise<void> {
    try {
      const {caseId, claim, draftId, draftResult} = await loadDraftClaim(req);

      if (!claim.responseDeadline) {
        claim.responseDeadline = new ResponseDeadline();
      }
      claim.responseDeadline.agreedResponseDeadline = agreedResponseDeadline;
      if (draftResult.createdAt && !claim.draftClaimCreatedAt) {
        claim.draftClaimCreatedAt = new Date(draftResult.createdAt);
      }
      await updateResponseDraft(req, caseId, claim, draftId);
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
