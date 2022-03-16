import {Cohabiting} from '../../../common/form/models/statementOfMeans/partner/cohabiting';
import {getDraftClaimFromStore, saveDraftClaim} from '../../draft-store/draftStoreService';
import {StatementOfMeans} from '../../../common/models/statementOfMeans';

const {Logger} = require('@hmcts/nodejs-logging');
const logger = Logger.getLogger('cohabitingService');

export class CohabitingService {

  public async getCohabiting(claimId: string) {
    try {
      const civilClaimResponse = await getDraftClaimFromStore(claimId);
      logger.info(civilClaimResponse);
      if (civilClaimResponse && civilClaimResponse.case_data && civilClaimResponse.case_data.statementOfMeans && civilClaimResponse.case_data.statementOfMeans.cohabiting) {
        return civilClaimResponse.case_data.statementOfMeans.cohabiting;
      }
      return new Cohabiting('');
    } catch (err: any) {
      logger.error(`${err.stack || err}`);
    }
  }

  public async saveCohabiting(claimId: string, cohabiting: Cohabiting) {
    try {
      const civilClaimResponse = await getDraftClaimFromStore(claimId);
      logger.info(civilClaimResponse);
      if (civilClaimResponse && civilClaimResponse.case_data && civilClaimResponse.case_data.statementOfMeans) {
        civilClaimResponse.case_data.statementOfMeans.cohabiting = cohabiting;
      } else {
        const statementOfMeans = new StatementOfMeans();
        statementOfMeans.cohabiting = cohabiting;
        civilClaimResponse.case_data.statementOfMeans = statementOfMeans;
      }
      await saveDraftClaim(claimId, civilClaimResponse.case_data);
    } catch (err: any) {
      logger.error(`${err.stack || err}`);
    }
  }
}
