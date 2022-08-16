import {Cohabiting} from '../../../../../common/form/models/statementOfMeans/partner/cohabiting';
import {getCaseDataFromStore, saveDraftClaim} from '../../../../../modules/draft-store/draftStoreService';
import {StatementOfMeans} from '../../../../../common/models/statementOfMeans';
import {Claim} from '../../../../../common/models/claim';
import {GenericForm} from '../../../../../common/form/models/genericForm';

const {Logger} = require('@hmcts/nodejs-logging');
const logger = Logger.getLogger('cohabitingService');

export class CohabitingService {

  public async getCohabiting(claimId: string) {
    try {
      const case_data = await getCaseDataFromStore(claimId);
      return (case_data?.statementOfMeans?.cohabiting)
        ? new GenericForm(new Cohabiting(case_data.statementOfMeans.cohabiting.option))
        : new GenericForm(new Cohabiting());
    } catch (error) {
      logger.error(error);
      throw error;
    }
  }

  public async saveCohabiting(claimId: string, cohabiting: GenericForm<Cohabiting>) {
    try {
      const case_data = await getCaseDataFromStore(claimId) || new Claim();
      if (case_data?.statementOfMeans) {
        case_data.statementOfMeans.cohabiting = cohabiting.model;
      } else {
        const statementOfMeans = new StatementOfMeans();
        statementOfMeans.cohabiting = cohabiting.model;
        case_data.statementOfMeans = statementOfMeans;
      }
      await saveDraftClaim(claimId, case_data);
    } catch (error) {
      logger.error(error);
      throw error;
    }
  }
}
