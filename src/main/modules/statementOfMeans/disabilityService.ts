import {Disability} from '../../common/form/models/statementOfMeans/disability';
import {DraftStoreService} from '../../modules/draft-store/draftStoreService';
import {StatementOfMeans} from '../../common/models/statementOfMeans';

const {Logger} = require('@hmcts/nodejs-logging');
const logger = Logger.getLogger('disabilityService');

export class DisabilityService {

  public async getDisability(claimId: string) {
    try {
      const draftStoreService = new DraftStoreService();
      const civilClaimResponse = await draftStoreService.getDraftClaimFromStore(claimId);
      logger.info(civilClaimResponse);
      if (civilClaimResponse && civilClaimResponse.case_data && civilClaimResponse.case_data.statementOfMeans && civilClaimResponse.case_data.statementOfMeans.disability) {
        return civilClaimResponse.case_data.statementOfMeans.disability;
      }
      return new Disability('');
    } catch (err: any) {
      logger.error(`${err.stack || err}`);
    }
  }

  public async saveDisability(claimId: string, disability: Disability) {
    try {
      const draftStoreService = new DraftStoreService();
      const civilClaimResponse = await draftStoreService.getDraftClaimFromStore(claimId);
      logger.info(civilClaimResponse);
      if (civilClaimResponse && civilClaimResponse.case_data && civilClaimResponse.case_data.statementOfMeans) {
        civilClaimResponse.case_data.statementOfMeans.disability = disability;
      } else {
        const statementOfMeans = new StatementOfMeans();
        statementOfMeans.disability = disability;
        civilClaimResponse.case_data.statementOfMeans = statementOfMeans;
      }
      await draftStoreService.saveDraftClaim(claimId, civilClaimResponse.case_data);
      return new Disability('');
    } catch (err: any) {
      logger.error(`${err.stack || err}`);
    }
  }
}
