import {Disability} from '../../common/form/models/statementOfMeans/disability';
import {getDraftClaimFromStore, saveDraftClaim} from '../../modules/draft-store/draftStoreService';
import {StatementOfMeans} from '../../common/models/statementOfMeans';

const {Logger} = require('@hmcts/nodejs-logging');
const logger = Logger.getLogger('disabilityService');

export class DisabilityService {

  public async getDisability(claimId: string) {
    try {
      const civilClaimResponse = await getDraftClaimFromStore(claimId);
      if (civilClaimResponse && civilClaimResponse.case_data && civilClaimResponse.case_data.statementOfMeans && civilClaimResponse.case_data.statementOfMeans.disability) {
        return civilClaimResponse.case_data.statementOfMeans.disability;
      }
      return new Disability('');
    } catch (err: unknown) {
      logger.error(`${(err as Error).stack || err}`);
    }
  }

  public async saveDisability(claimId: string, disability: Disability) {
    try {
      const civilClaimResponse = await getDraftClaimFromStore(claimId);
      if (civilClaimResponse && civilClaimResponse.case_data && civilClaimResponse.case_data.statementOfMeans) {
        civilClaimResponse.case_data.statementOfMeans.disability = disability;
      } else {
        const statementOfMeans = new StatementOfMeans();
        statementOfMeans.disability = disability;
        civilClaimResponse.case_data.statementOfMeans = statementOfMeans;
      }
      await saveDraftClaim(claimId, civilClaimResponse.case_data);
    } catch (err: unknown) {
      logger.error(`${(err as Error).stack || err}`);
    }
  }
}
