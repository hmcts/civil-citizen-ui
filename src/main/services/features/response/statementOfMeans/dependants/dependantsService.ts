import {getResponseClaimById, getResponseDraft, updateResponseDraft} from 'modules/draft-store/response/responseDraftStoreService';
import {StatementOfMeans} from 'common/models/statementOfMeans';
import {Validator} from 'class-validator';
import {Dependants} from 'common/form/models/statementOfMeans/dependants/dependants';
import {GenericForm} from 'common/form/models/genericForm';
import {Claim} from 'common/models/claim';
import {AppRequest} from 'models/AppRequest';
import {getRouteParam} from 'common/utils/routeParamUtils';

const {Logger} = require('@hmcts/nodejs-logging');
const logger = Logger.getLogger('dependantsService');
const validator = new Validator();

class DependantsService {

  public async getDependants(req: AppRequest): Promise<Dependants> {
    try {
      const caseId = getRouteParam(req, 'id');
      const claim = await getResponseClaimById(req, caseId);
      if (claim?.statementOfMeans?.dependants) {
        return claim.statementOfMeans.dependants;
      }
      return new Dependants();
    } catch (error) {
      logger.error(`${(error as Error).stack || error}`);
      throw error;
    }
  }

  public async saveDependants(req: AppRequest, dependants: Dependants): Promise<Claim> {
    try {
      const caseId = getRouteParam(req, 'id');
      const draftResult = await getResponseDraft(req, caseId);
      if (!draftResult) {
        throw new Error('[dependantsService] no response draft found');
      }
      const claim = Object.assign(new Claim(), draftResult.claimResponse?.case_data as unknown as Claim);
      const draftId = draftResult.rawResponse?.draftId;

      if (claim?.statementOfMeans) {
        claim.statementOfMeans.dependants = dependants;
      } else {
        const statementOfMeans = new StatementOfMeans();
        statementOfMeans.dependants = dependants;
        claim.statementOfMeans = statementOfMeans;
      }
      if (draftResult.createdAt && !claim.draftClaimCreatedAt) {
        claim.draftClaimCreatedAt = new Date(draftResult.createdAt);
      }
      await updateResponseDraft(req, caseId, claim, draftId);
      return claim;
    } catch (error) {
      logger.error(`${(error as Error).stack || error}`);
      throw error;
    }
  }

  public buildDependants(_declared: unknown, under11?: string, between11and15?: string, between16and19?: string): Dependants {
    return Dependants.fromObject(_declared, under11, between11and15, between16and19);
  }

  public validateDependants(dependants: Dependants): GenericForm<Dependants> {
    const form: GenericForm<Dependants> = new GenericForm(dependants);
    form.errors = validator.validateSync(form.model);
    return form;
  }
}

const dependantsService = new DependantsService();
export default dependantsService;
