import {SevereDisability} from '../../common/form/models/statementOfMeans/severeDisability';
import {getDraftClaimFromStore, saveDraftClaim} from '../../modules/draft-store/draftStoreService';
import {StatementOfMeans} from '../../common/models/statementOfMeans';

const {Logger} = require('@hmcts/nodejs-logging');
const logger = Logger.getLogger('severeDisabilityService');

export class SevereDisabilityService {

  public async getSevereDisability(claimId: string) {
    try {
      const civilClaimResponse = await getDraftClaimFromStore(claimId);
      if (civilClaimResponse && civilClaimResponse.case_data && civilClaimResponse.case_data.statementOfMeans && civilClaimResponse.case_data.statementOfMeans.severeDisability) {
        return civilClaimResponse.case_data.statementOfMeans.severeDisability;
      }
      return new SevereDisability('');
    } catch (err: unknown) {
      logger.error(`${(err as Error).stack || err}`);
    }
  }

  public async saveSevereDisability(claimId: string, severeDisability: SevereDisability) {
    try {
      const civilClaimResponse = await getDraftClaimFromStore(claimId);
      if (civilClaimResponse && civilClaimResponse.case_data && civilClaimResponse.case_data.statementOfMeans) {
        civilClaimResponse.case_data.statementOfMeans.severeDisability = severeDisability;
      } else {
        const statementOfMeans = new StatementOfMeans();
        statementOfMeans.severeDisability = severeDisability;
        civilClaimResponse.case_data.statementOfMeans = statementOfMeans;
      }
      await saveDraftClaim(claimId, civilClaimResponse.case_data);
    } catch (err: unknown) {
      logger.error(`${(err as Error).stack || err}`);
    }
  }
}
