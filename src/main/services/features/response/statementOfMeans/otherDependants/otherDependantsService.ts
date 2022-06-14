import {OtherDependants} from '../../../../../common/form/models/statementOfMeans/otherDependants';
import {
  getCaseDataFromStore,
  getDraftClaimFromStore,
  saveDraftClaim,
} from '../../../../../modules/draft-store/draftStoreService';
import {StatementOfMeans} from '../../../../../common/models/statementOfMeans';
import {get} from 'lodash';

const {Logger} = require('@hmcts/nodejs-logging');
const logger = Logger.getLogger('otherDependantsService');

export class OtherDependantsService {

  public async getOtherDependants(claimId: string) {
    try {
      const civilClaimResponse = await getDraftClaimFromStore(claimId);
      logger.info(civilClaimResponse);
      if (get(civilClaimResponse, 'case_data.statementOfMeans.otherDependants')) {
        return civilClaimResponse.case_data.statementOfMeans.otherDependants;
      }
      return new OtherDependants();
    } catch (error) {
      logger.error(`${error.stack || error}`);
      throw error;
    }
  }

  public async saveOtherDependants(claimId: string, otherDependants: OtherDependants) {
    try {
      const claim = await getCaseDataFromStore(claimId);
      if (!claim.statementOfMeans) {
        claim.statementOfMeans = new StatementOfMeans();
      }
      claim.statementOfMeans.otherDependants = otherDependants;
      await saveDraftClaim(claimId, claim);
    } catch (error) {
      logger.error(`${error.stack || error}`);
      throw error;
    }
  }
}
