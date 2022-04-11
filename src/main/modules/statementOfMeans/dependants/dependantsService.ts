import {getDraftClaimFromStore, saveDraftClaim} from '../../../modules/draft-store/draftStoreService';
import {StatementOfMeans} from '../../../common/models/statementOfMeans';
import {Validator} from 'class-validator';
import {Dependants} from '../../../common/form/models/statementOfMeans/dependants/dependants';
import {GenericForm} from '../../../common/form/models/genericForm';
import {Claim} from '../../../common/models/claim';

const {Logger} = require('@hmcts/nodejs-logging');
const logger = Logger.getLogger('dependantsService');
const validator = new Validator();

class DependantsService {

  public async getDependants(claimId: string): Promise<Dependants> {
    try {
      const civilClaimResponse = await getDraftClaimFromStore(claimId);
      if (civilClaimResponse?.case_data?.statementOfMeans?.dependants) {
        return civilClaimResponse.case_data.statementOfMeans.dependants;
      }
      return new Dependants();
    } catch (error) {
      logger.error(`${(error as Error).stack || error}`);
      throw error;
    }
  }

  public async saveDependants(claimId: string, dependants: Dependants) : Promise<Claim> {
    try {
      const civilClaimResponse = await getDraftClaimFromStore(claimId);
      if (civilClaimResponse?.case_data?.statementOfMeans) {
        civilClaimResponse.case_data.statementOfMeans.dependants = dependants;
      } else {
        const statementOfMeans = new StatementOfMeans();
        statementOfMeans.dependants = dependants;
        civilClaimResponse.case_data.statementOfMeans = statementOfMeans;
      }
      await saveDraftClaim(claimId, civilClaimResponse.case_data);
      return civilClaimResponse.case_data;
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
