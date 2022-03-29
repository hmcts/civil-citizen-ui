import {ChildrenDisability} from '../../../common/form/models/statementOfMeans/dependants/childrenDisability';
import {getCaseDataFromStore, saveDraftClaim} from '../../draft-store/draftStoreService';
import {StatementOfMeans} from '../../../common/models/statementOfMeans';
import {Claim} from '../../../common/models/claim';
import * as winston from 'winston';

const {Logger} = require('@hmcts/nodejs-logging');



export class ChildrenDisabilityService {
  static logger : winston.LoggerInstance = Logger.getLogger('childrenDisabilityService');

  public async getChildrenDisability(claimId: string) {
    try {
      const case_data = await getCaseDataFromStore(claimId);
      if (case_data && case_data.statementOfMeans && case_data.statementOfMeans.childrenDisability) {
        const childrenDisability = new ChildrenDisability();
        childrenDisability.option = case_data.statementOfMeans.childrenDisability.option;
        return childrenDisability;
      }
      return new ChildrenDisability();
    } catch (error) {
      ChildrenDisabilityService.logger.error(error);
      throw error;
    }
  }

  public async saveChildrenDisability(claimId: string, childrenDisability: ChildrenDisability) {
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
      ChildrenDisabilityService.logger.error(error);
      throw error;
    }
  }
}
