import {Cohabiting} from '../../../common/form/models/statementOfMeans/partner/cohabiting';
import {getCaseDataFromStore, saveDraftClaim} from '../../draft-store/draftStoreService';
import {StatementOfMeans} from '../../../common/models/statementOfMeans';
import {Claim} from '../../../common/models/claim';

const {Logger} = require('@hmcts/nodejs-logging');
const logger = Logger.getLogger('cohabitingService');
const cohabiting = new Cohabiting();

export class CohabitingService {

  public async getCohabiting(claimId: string) {
    try {
      const case_data = await getCaseDataFromStore(claimId);
      if (case_data && case_data.statementOfMeans && case_data.statementOfMeans.cohabiting) {
        cohabiting.option = case_data.statementOfMeans.cohabiting.option;
        return cohabiting;
      }
      return new Cohabiting();
    } catch (err: unknown) {
      logger.error(`${err as Error || err}`);
    }
  }

  public async saveCohabiting(claimId: string, cohabiting: Cohabiting) {
    try {
      const case_data = await getCaseDataFromStore(claimId) || new Claim();
      if (case_data && case_data.statementOfMeans) {
        case_data.statementOfMeans.cohabiting = cohabiting;
      } else {
        const statementOfMeans = new StatementOfMeans();
        statementOfMeans.cohabiting = cohabiting;
        case_data.statementOfMeans = statementOfMeans;
      }
      await saveDraftClaim(claimId, case_data);
    } catch (err: unknown) {
      logger.error(`${err as Error || err}`);
    }
  }
}
