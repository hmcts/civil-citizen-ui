import {getResponseClaimById, getResponseDraft, updateResponseDraft} from 'modules/draft-store/response/responseDraftStoreService';
import {StatementOfMeans} from 'common/models/statementOfMeans';
import {GenericForm} from 'common/form/models/genericForm';
import {GenericYesNo} from 'common/form/models/genericYesNo';
import {AppRequest} from 'models/AppRequest';
import {getRouteParam} from 'common/utils/routeParamUtils';
import {Claim} from 'models/claim';

const {Logger} = require('@hmcts/nodejs-logging');
const logger = Logger.getLogger('severeDisabilityService');

export class SevereDisabilityService {
  public async getSevereDisability(req: AppRequest) {
    try {
      const caseId = await getRouteParam(req, 'id');
      const claim = await getResponseClaimById(req, caseId);
      if (claim?.statementOfMeans?.severeDisability) {
        const severeDisability = new GenericForm(new GenericYesNo());
        severeDisability.model.option = claim.statementOfMeans.severeDisability.option;
        return severeDisability;
      }
      return new GenericForm(new GenericYesNo());
    } catch (error) {
      logger.error(error);
      throw error;
    }
  }

  public async saveSevereDisability(req: AppRequest, severeDisability: GenericForm<GenericYesNo>) {
    try {
      const caseId = getRouteParam(req, 'id');
      const draftResult = await getResponseDraft(req, caseId);
      if (!draftResult) {
        throw new Error('[severeDisabilityService] no response draft found');
      }
      const claim = Object.assign(new Claim(), draftResult.claimResponse?.case_data as unknown as Claim);
      const draftId = draftResult.rawResponse?.draftId;

      if (claim?.statementOfMeans) {
        claim.statementOfMeans.severeDisability = severeDisability.model;
      } else {
        const statementOfMeans = new StatementOfMeans();
        statementOfMeans.severeDisability = severeDisability.model;
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
