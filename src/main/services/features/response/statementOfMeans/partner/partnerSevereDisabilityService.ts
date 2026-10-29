import {getResponseDraft, getResponseClaimById, updateResponseDraft} from 'modules/draft-store/response/responseDraftStoreService';
import {StatementOfMeans} from 'common/models/statementOfMeans';
import {GenericForm} from 'common/form/models/genericForm';
import {GenericYesNo} from 'common/form/models/genericYesNo';
import {AppRequest} from 'models/AppRequest';
import {Claim} from 'models/claim';
import {getRouteParam} from 'common/utils/routeParamUtils';

const {Logger} = require('@hmcts/nodejs-logging');
const logger = Logger.getLogger('partnerSevereDisabilityService');

export class PartnerSevereDisabilityService {

  public async getPartnerSevereDisability(req: AppRequest) {
    try {
      const caseId = getRouteParam(req, 'id');
      const claim = await getResponseClaimById(req, caseId);
      if (claim?.statementOfMeans?.partnerSevereDisability) {
        const partnerSevereDisability = new GenericForm(new GenericYesNo());
        partnerSevereDisability.model.option = claim.statementOfMeans.partnerSevereDisability.option;
        return partnerSevereDisability;
      }
      return new GenericForm(new GenericYesNo());
    } catch (error) {
      logger.error(error);
      throw error;
    }
  }

  public async savePartnerSevereDisability(req: AppRequest, partnerSevereDisability: GenericForm<GenericYesNo>) {
    try {
      const caseId = getRouteParam(req, 'id');
      const draftResult = await getResponseDraft(req, caseId);
      if (!draftResult) {
        throw new Error('[partnerSevereDisabilityService] no response draft found');
      }
      const claim = Object.assign(new Claim(), draftResult.claimResponse?.case_data as unknown as Claim);
      const draftId = draftResult.rawResponse?.draftId;

      if (claim?.statementOfMeans) {
        claim.statementOfMeans.partnerSevereDisability = partnerSevereDisability.model;
      } else {
        const statementOfMeans = new StatementOfMeans();
        statementOfMeans.partnerSevereDisability = partnerSevereDisability.model;
        claim.statementOfMeans = statementOfMeans;
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
