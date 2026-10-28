import {getResponseClaimById, getResponseDraft, updateResponseDraft} from 'modules/draft-store/response/responseDraftStoreService';
import {PartialAdmission} from 'models/partialAdmission';
import {GenericYesNo} from 'form/models/genericYesNo';
import {AppRequest} from 'models/AppRequest';
import {getRouteParam} from 'common/utils/routeParamUtils';
import {Claim} from 'models/claim';

const {Logger} = require('@hmcts/nodejs-logging');
const logger = Logger.getLogger('partialAdmissionService');

export class PartialAdmissionService {
  public async getClaimAlreadyPaid(req: AppRequest) {
    try {
      const caseId = getRouteParam(req, 'id');
      const claim = await getResponseClaimById(req, caseId);
      return claim.partialAdmission?.alreadyPaid?.option;
    } catch (error) {
      logger.error(error);
      throw error;
    }
  }

  public async saveClaimAlreadyPaid(req: AppRequest, alreadyPaid: string): Promise<void> {
    try {
      const caseId = getRouteParam(req, 'id');
      const draftResult = await getResponseDraft(req, caseId);
      if (!draftResult) {
        throw new Error('[partialAdmissionService] no draft response found');
      }
      const claim = Object.assign(new Claim(), draftResult.claimResponse?.case_data as unknown as Claim);
      const draftId = draftResult.rawResponse?.draftId;

      if (claim.partialAdmission?.alreadyPaid) {
        claim.partialAdmission.alreadyPaid.option = alreadyPaid;
        logger.info('Resetting Payment Intention.');
        claim.partialAdmission.paymentIntention = undefined;
      } else {
        claim.partialAdmission = new PartialAdmission();
        claim.partialAdmission.alreadyPaid = new GenericYesNo(alreadyPaid);
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
}
