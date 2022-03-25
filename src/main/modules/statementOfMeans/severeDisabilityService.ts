import {SevereDisability} from '../../common/form/models/statementOfMeans/severeDisability';
import {getCaseDataFromStore, saveDraftClaim} from '../../modules/draft-store/draftStoreService';
import {StatementOfMeans} from '../../common/models/statementOfMeans';
import {Claim} from '../../common/models/claim';

const {Logger} = require('@hmcts/nodejs-logging');
const logger = Logger.getLogger('dependantsService');
const severeDisability = new SevereDisability();

export class SevereDisabilityService {

  public async getSevereDisability(claimId: string) {
    try {
      const case_data = await getCaseDataFromStore(claimId);
      if (case_data && case_data.statementOfMeans && case_data.statementOfMeans.severeDisability) {
        severeDisability.option = case_data.statementOfMeans.severeDisability.option;
        return severeDisability;
      }
      return new SevereDisability();
    } catch (error) {
      logger.error(error);
      throw error;
    }
  }

  public async saveSevereDisability(claimId: string, severeDisability: SevereDisability) {
    try {
      const case_data = await getCaseDataFromStore(claimId) || new Claim();
      if (case_data && case_data.statementOfMeans) {
        case_data.statementOfMeans.severeDisability = severeDisability;
      } else {
        const statementOfMeans = new StatementOfMeans();
        statementOfMeans.severeDisability = severeDisability;
        case_data.statementOfMeans = statementOfMeans;
      }
      await saveDraftClaim(claimId, case_data);
    } catch (error) {
      logger.error(error);
      throw error;
    }
  }
}
