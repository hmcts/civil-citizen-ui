import {OtherDependants} from '../../../common/form/models/statementOfMeans/otherDependants';
import {getDraftClaimFromStore, saveDraftClaim} from '../../draft-store/draftStoreService';
import {StatementOfMeans} from '../../../common/models/statementOfMeans';
import { get } from 'lodash';

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
      const civilClaimResponse = await getDraftClaimFromStore(claimId);
      if (get(civilClaimResponse, 'case_data.statementOfMeans.otherDependants')) {
        civilClaimResponse.case_data.statementOfMeans.otherDependants = otherDependants;
      } else {
        const statementOfMeans = new StatementOfMeans();
        statementOfMeans.otherDependants = otherDependants;
        civilClaimResponse.case_data.statementOfMeans = statementOfMeans;
      }
      await saveDraftClaim(claimId, civilClaimResponse.case_data);
    } catch (error) {
      logger.error(`${error.stack || error}`);
      throw error;
    }
  }
}
