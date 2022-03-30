import {ChildrenDisability} from '../../../common/form/models/statementOfMeans/dependants/childrenDisability';
import {getCaseDataFromStore, saveDraftClaim} from '../../draft-store/draftStoreService';
import {StatementOfMeans} from '../../../common/models/statementOfMeans';
import {Claim} from '../../../common/models/claim';
import * as winston from 'winston';
import {YesNo} from '../../../common/form/models/yesNo';
import {totalNumberOfChildren} from '../../../common/form/models/statementOfMeans/dependants/numberOfChildren';

const {Logger} = require('@hmcts/nodejs-logging');
const logger = Logger.getLogger('childrenDisabilityService');

export const isCheckChildrenDisabled = (claim : Claim) : boolean => {
  try {
    let result = false;
    const statementOfMeans = claim.statementOfMeans;
    if (statementOfMeans?.dependants?.numberOfChildren && totalNumberOfChildren(statementOfMeans.dependants.numberOfChildren) > 0) {
      if (statementOfMeans?.disability?.option == YesNo.NO) {
        result = true;
      } else if (statementOfMeans?.disability?.option == YesNo.YES && statementOfMeans?.severeDisability?.option == YesNo.NO && statementOfMeans?.partnerDisability?.option != YesNo.YES){
        result = true;
      }
    }
    return result;
  } catch (error) {
    logger.error(`${error.stack || error}`);
    throw error;
  }
};

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
