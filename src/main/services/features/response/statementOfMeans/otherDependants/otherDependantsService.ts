import {OtherDependants} from 'common/form/models/statementOfMeans/otherDependants';
import {getResponseClaimById, getResponseDraft, updateResponseDraft,} from 'modules/draft-store/response/responseDraftStoreService';
import {StatementOfMeans} from 'common/models/statementOfMeans';
import {GenericForm} from 'common/form/models/genericForm';
import {YesNo} from 'common/form/models/yesNo';
import {Claim} from 'models/claim';
import {AppRequest} from 'models/AppRequest';
import {getRouteParam} from 'common/utils/routeParamUtils';

const {Logger} = require('@hmcts/nodejs-logging');
const logger = Logger.getLogger('otherDependantsService');

export class OtherDependantsService {

  public async getOtherDependants(req: AppRequest) {
    try {
      const caseId = getRouteParam(req, 'id');
      const claim = await getResponseClaimById(req, caseId);
      if (claim?.statementOfMeans?.otherDependants) {
        return claim.statementOfMeans.otherDependants;
      }
      return new OtherDependants();
    } catch (error) {
      logger.error(`${error.stack || error}`);
      throw error;
    }
  }

  public async saveOtherDependants(req: AppRequest, otherDependants: GenericForm<OtherDependants>) {
    try {
      const caseId = getRouteParam(req, 'id');
      const draftResult = await getResponseDraft(req, caseId);
      if (!draftResult) {
        throw new Error('[otherDependantsService] no response draft found');
      }
      const claim = Object.assign(new Claim(), draftResult.claimResponse?.case_data as unknown as Claim);
      const draftId = draftResult.rawResponse?.draftId;
      if (!claim.statementOfMeans) {
        claim.statementOfMeans = new StatementOfMeans();
      }
      claim.statementOfMeans.otherDependants = this.setOtherDependants(otherDependants);
      if (draftResult.createdAt && !claim.draftClaimCreatedAt) {
        claim.draftClaimCreatedAt = new Date(draftResult.createdAt);
      }
      await updateResponseDraft(req, caseId, claim, draftId);
    } catch (error) {
      logger.error(`${error.stack || error}`);
      throw error;
    }
  }

  public setOtherDependants(otherDependants: GenericForm<OtherDependants>): OtherDependants {
    return otherDependants.model.option === YesNo.YES ? otherDependants.model : new OtherDependants(otherDependants.model.option);
  }
}
