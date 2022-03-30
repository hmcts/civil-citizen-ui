import {ChildrenDisability} from '../../../common/form/models/statementOfMeans/dependants/childrenDisability';
import {getCaseDataFromStore, saveDraftClaim} from '../../draft-store/draftStoreService';
import {StatementOfMeans} from '../../../common/models/statementOfMeans';
import {Claim} from '../../../common/models/claim';
import {YesNo} from '../../../common/form/models/yesNo';
import {totalNumberOfChildren} from '../../../common/form/models/statementOfMeans/dependants/numberOfChildren';

const {Logger} = require('@hmcts/nodejs-logging');
const logger = Logger.getLogger('childrenDisabilityService');

export const isCheckChildrenDisabled = (claim: Claim): boolean => {
  try {
    const statementOfMeans = claim.statementOfMeans;
    if (statementOfMeans?.dependants?.numberOfChildren && totalNumberOfChildren(statementOfMeans.dependants.numberOfChildren) > 0) {
      if ((statementOfMeans?.disability?.option == YesNo.NO) || (statementOfMeans?.disability?.option == YesNo.YES && statementOfMeans?.severeDisability?.option == YesNo.NO && statementOfMeans?.partnerDisability?.option != YesNo.YES)){
        return true;
      }
    }
    return false;
  } catch (error) {
    logger.error(`${error.stack || error}`);
    throw error;
  }
};


export const getChildrenDisability = async (claimId: string) => {
  try {
    const case_data = await getCaseDataFromStore(claimId);
    if (case_data && case_data.statementOfMeans && case_data.statementOfMeans.childrenDisability) {
      const childrenDisability = new ChildrenDisability();
      childrenDisability.option = case_data.statementOfMeans.childrenDisability.option;
      return childrenDisability;
    }
    return new ChildrenDisability();
  } catch (error) {
    logger.error(error);
    throw error;
  }
};

export const saveChildrenDisability = async (claimId: string, childrenDisability: ChildrenDisability) => {
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
    logger.error(error);
    throw error;
  }
};

