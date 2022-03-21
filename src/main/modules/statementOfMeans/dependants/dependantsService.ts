import {boolean} from 'boolean';
import {parseInt} from 'lodash';
import {getDraftClaimFromStore, saveDraftClaim} from '../../../modules/draft-store/draftStoreService';
import {StatementOfMeans} from '../../../common/models/statementOfMeans';
import {Validator} from 'class-validator';
import {Dependants} from '../../../common/form/models/statementOfMeans/dependants/dependants';
import {NumberOfChildren} from '../../../common/form/models/statementOfMeans/dependants/numberOfChildren';
import {GenericForm} from '../../../common/form/models/genericForm';

const {Logger} = require('@hmcts/nodejs-logging');
const logger = Logger.getLogger('dependantsService');
const validator = new Validator();

class DependantsService {

  public async getDependants(claimId: string): Promise<Dependants> {
    try {
      const civilClaimResponse = await getDraftClaimFromStore(claimId);
      if (civilClaimResponse && civilClaimResponse.case_data && civilClaimResponse.case_data.statementOfMeans && civilClaimResponse.case_data.statementOfMeans.dependants) {
        return civilClaimResponse.case_data.statementOfMeans.dependants;
      }
      return new Dependants();
    } catch (err) {
      logger.error(`${(err as Error).stack || err}`);
    }
  }

  public async saveDependants(claimId: string, dependants: Dependants) {
    try {
      const civilClaimResponse = await getDraftClaimFromStore(claimId);
      if (civilClaimResponse && civilClaimResponse.case_data && civilClaimResponse.case_data.statementOfMeans) {
        civilClaimResponse.case_data.statementOfMeans.dependants = dependants;
      } else {
        const statementOfMeans = new StatementOfMeans();
        statementOfMeans.dependants = dependants;
        civilClaimResponse.case_data.statementOfMeans = statementOfMeans;
      }
      await saveDraftClaim(claimId, civilClaimResponse.case_data);
    } catch (err) {
      logger.error(`${(err as Error).stack || err}`);
    }
  }

  public buildDependants(_declared: unknown, under11?: string, between11and15?: string, between16and19?: string): Dependants {
    const numberOfChildren: NumberOfChildren = new NumberOfChildren(parseInt(under11), parseInt(between11and15), parseInt(between16and19));
    const declared: boolean = _declared == null ? undefined : boolean(_declared);
    const dependants = new Dependants(declared, numberOfChildren);
    return dependants;
  }

  public validateDependants(dependants: Dependants): GenericForm<Dependants> {
    const form: GenericForm<Dependants> = new GenericForm(dependants);
    form.errors = validator.validateSync(form.model);
    return form;
  }
}

const dependantsService = new DependantsService();
export default dependantsService;
