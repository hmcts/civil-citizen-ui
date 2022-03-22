import {ChildrenDisability} from 'common/form/models/statementOfMeans/dependants/childrenDisability';
import {getCaseDataFromStore, saveDraftClaim} from '../../draft-store/draftStoreService';
import {StatementOfMeans} from '../../../common/models/statementOfMeans';
import {Claim} from '../../../common/models/claim';

const {Logger} = require('@hmcts/nodejs-logging');
const logger = Logger.getLogger('partnerSevereDisabilityService');
const childrenDisability = new ChildrenDisability();

export class ChildrenDisabilityService {

  public async getChildrenLiveWithYouDisability(claimId: string) {
    try {
      const case_data = await getCaseDataFromStore(claimId);
      if (case_data && case_data.statementOfMeans && case_data.statementOfMeans.childrenDisability) {
        childrenDisability.option = case_data.statementOfMeans.childrenDisability.option;
        return childrenDisability;
      }
      return new ChildrenDisability();
    } catch (error) {
      logger.error(`${(error as Error).stack || error}`);
    }
  }

  public async saveChildrenLiveWithYouDisability(claimId: string, childrenDisability: ChildrenDisability) {
    try {
      const case_data = await getCaseDataFromStore(claimId) || new Claim();
      if (case_data && case_data.statementOfMeans) {
        case_data.statementOfMeans.childrenDisability = childrenDisability;
      } else {
        const statementOfMeans = new StatementOfMeans();
        statementOfMeans.childrenDisability = childrenDisability;
        case_data.statementOfMeans = statementOfMeans;
      }
      await saveDraftClaim(claimId, case_data);
    } catch (error) {
      logger.error(`${(error as Error).stack || error}`);
    }
  }
}
