import {Disability} from '../../../../common/form/models/statementOfMeans/disability';
import {getCaseDataFromStore, saveDraftClaim} from '../../../../modules/draft-store/draftStoreService';
import {StatementOfMeans} from '../../../../common/models/statementOfMeans';
import {Claim} from '../../../../common/models/claim';
import {GenericForm} from '../../../../common/form/models/genericForm';

const {Logger} = require('@hmcts/nodejs-logging');
const logger = Logger.getLogger('disabilityService');

export class DisabilityService {

  public async getDisability(claimId: string) {
    try {
      const case_data = await getCaseDataFromStore(claimId);
      if (case_data?.statementOfMeans?.disability) {
        const disability = new GenericForm(new Disability());
        disability.model.option = case_data.statementOfMeans.disability.option;
        return disability;
      }
      return new GenericForm(new Disability());
    } catch (error) {
      logger.error(error);
      throw error;
    }
  }

  public async saveDisability(claimId: string, disability: GenericForm<Disability>) {
    try {
      const case_data = await getCaseDataFromStore(claimId) || new Claim();
      if (case_data?.statementOfMeans) {
        case_data.statementOfMeans.disability = disability.model;
      } else {
        const statementOfMeans = new StatementOfMeans();
        statementOfMeans.disability = disability.model;
        case_data.statementOfMeans = statementOfMeans;
      }
      await saveDraftClaim(claimId, case_data);
    } catch (error) {
      logger.error(error);
      throw error;
    }
  }
}
