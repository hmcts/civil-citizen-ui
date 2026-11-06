import {getResponseClaimById, getResponseDraft, updateResponseDraft} from 'modules/draft-store/response/responseDraftStoreService';
import {StatementOfMeans} from 'common/models/statementOfMeans';
import {GenericForm} from 'common/form/models/genericForm';
import {GenericYesNo} from 'common/form/models/genericYesNo';
import {AppRequest} from 'models/AppRequest';
import {Claim} from 'models/claim';
import {getRouteParam} from 'common/utils/routeParamUtils';

const {Logger} = require('@hmcts/nodejs-logging');
const logger = Logger.getLogger('cohabitingService');

export class CohabitingService {

  public async getCohabiting(req: AppRequest) {
    try {
      const caseId = getRouteParam(req, 'id');
      const claim = await getResponseClaimById(req, caseId);
      return (claim?.statementOfMeans?.cohabiting)
        ? new GenericForm(new GenericYesNo(claim.statementOfMeans.cohabiting.option))
        : new GenericForm(new GenericYesNo());
    } catch (error) {
      logger.error(error);
      throw error;
    }
  }

  public async saveCohabiting(req: AppRequest, cohabiting: GenericForm<GenericYesNo>) {
    try {
      const caseId = getRouteParam(req, 'id');
      const draftResult = await getResponseDraft(req, caseId);
      if (!draftResult) {
        throw new Error('[cohabitingService] no response draft found');
      }
      const claim = Object.assign(new Claim(), draftResult.claimResponse?.case_data as unknown as Claim);
      const draftId = draftResult.rawResponse?.draftId;

      if (claim?.statementOfMeans) {
        claim.statementOfMeans.cohabiting = cohabiting.model;
      } else {
        const statementOfMeans = new StatementOfMeans();
        statementOfMeans.cohabiting = cohabiting.model;
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
