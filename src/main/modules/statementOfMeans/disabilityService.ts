import {Disability} from '../../common/form/models/statementOfMeans/disability';
import {getCaseDataFromStore, saveDraftClaim} from '../../modules/draft-store/draftStoreService';
import {StatementOfMeans} from '../../common/models/statementOfMeans';
import {Claim} from '../../common/models/claim';

const {Logger} = require('@hmcts/nodejs-logging');
const logger = Logger.getLogger('disabilityService');

export class DisabilityService {

  public async getDisability(claimId: string) {
    try {
      const case_data = await getCaseDataFromStore(claimId);
      if (case_data?.statementOfMeans?.disability) {
        const disability = new Disability();
        disability.option = case_data.statementOfMeans.disability.option;
        return disability;
      }
      return new Disability();
    } catch (error) {
      logger.error(error);
      throw error;
    }
  }

  public async saveDisability(claimId: string, disability: Disability) {
    try {
      const case_data = await getCaseDataFromStore(claimId) || new Claim();
      if (case_data?.statementOfMeans) {
        case_data.statementOfMeans.disability = disability;
      } else {
        const statementOfMeans = new StatementOfMeans();
        statementOfMeans.disability = disability;
        case_data.statementOfMeans = statementOfMeans;
      }
      await saveDraftClaim(claimId, case_data);
    } catch (error) {
      logger.error(error);
      throw error;
    }
  }
}
