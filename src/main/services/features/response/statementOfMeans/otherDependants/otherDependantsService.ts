import {OtherDependants} from '../../../../../common/form/models/statementOfMeans/otherDependants';
import {
  getCaseDataFromStore,
  getDraftClaimFromStore,
  saveDraftClaim,
} from '../../../../../modules/draft-store/draftStoreService';
import {StatementOfMeans} from '../../../../../common/models/statementOfMeans';
import {get} from 'lodash';
import {GenericForm} from '../../../../../common/form/models/genericForm';
import {YesNo} from '../../../../../common/form/models/yesNo';

const {Logger} = require('@hmcts/nodejs-logging');
const logger = Logger.getLogger('otherDependantsService');

export class OtherDependantsService {

  public async getOtherDependants(claimId: string) {
    try {
      const civilClaimResponse = await getDraftClaimFromStore(claimId);
      if (get(civilClaimResponse, 'case_data.statementOfMeans.otherDependants')) {
        return civilClaimResponse.case_data.statementOfMeans.otherDependants;
      }
      return new OtherDependants();
    } catch (error) {
      logger.error(`${error.stack || error}`);
      throw error;
    }
  }

  public async saveOtherDependants(claimId: string, otherDependants: GenericForm<OtherDependants>) {
    try {
      const claim = await getCaseDataFromStore(claimId);
      if (!claim.statementOfMeans) {
        claim.statementOfMeans = new StatementOfMeans();
      }

      (otherDependants.model.option === YesNo.YES)
        ? claim.statementOfMeans.otherDependants = otherDependants.model
        : claim.statementOfMeans.otherDependants = new OtherDependants(otherDependants.model.option);

      await saveDraftClaim(claimId, claim);
    } catch (error) {
      logger.error(`${error.stack || error}`);
      throw error;
    }
  }
}
