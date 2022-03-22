import {OtherDependants} from '../../../common/form/models/statementOfMeans/otherDependants';
import {getDraftClaimFromStore, saveDraftClaim} from '../../draft-store/draftStoreService';
import {StatementOfMeans} from '../../../common/models/statementOfMeans';

const {Logger} = require('@hmcts/nodejs-logging');
const logger = Logger.getLogger('otherDependantsService');

export class OtherDependantsService {

  public async getOtherDependants(claimId: string) {
    try {
      const civilClaimResponse = await getDraftClaimFromStore(claimId);
      logger.info(civilClaimResponse);
      if (civilClaimResponse && civilClaimResponse.case_data && civilClaimResponse.case_data.statementOfMeans && civilClaimResponse.case_data.statementOfMeans.otherDependants) {
        return civilClaimResponse.case_data.statementOfMeans.otherDependants;
      }
      return new OtherDependants('');
    } catch (err) {
      logger.error(`${err.stack || err}`);
      throw new Error(err);
    }
  }

  public async saveOtherDependants(claimId: string, otherDependants: OtherDependants) {
    try {
      const civilClaimResponse = await getDraftClaimFromStore(claimId);
      if (civilClaimResponse && civilClaimResponse.case_data && civilClaimResponse.case_data.statementOfMeans) {
        civilClaimResponse.case_data.statementOfMeans.otherDependants = otherDependants;
      } else {
        const statementOfMeans = new StatementOfMeans();
        statementOfMeans.otherDependants = otherDependants;
        civilClaimResponse.case_data.statementOfMeans = statementOfMeans;
      }
      await saveDraftClaim(claimId, civilClaimResponse.case_data);
    } catch (err) {
      logger.error(`${err.stack || err}`);
      throw new Error(err);
    }
  }
}
