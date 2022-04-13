import {ChildrenDisability} from '../../../common/form/models/statementOfMeans/dependants/childrenDisability';
import {getCaseDataFromStore, saveDraftClaim} from '../../draft-store/draftStoreService';
import {StatementOfMeans} from '../../../common/models/statementOfMeans';
import {Claim} from '../../../common/models/claim';
import {YesNo} from '../../../common/form/models/yesNo';
import * as winston from 'winston';
import {NumberOfChildren} from '../../../common/form/models/statementOfMeans/dependants/numberOfChildren';

const {Logger} = require('@hmcts/nodejs-logging');
let logger = Logger.getLogger('childrenDisabilityService');


export function setChildrenDisabilityServiceLogger(winstonLogger: winston.Logger) {
  logger = winstonLogger;
}

export const hasDisabledChildren = (claim: Claim): boolean => {
  const statementOfMeans = claim.statementOfMeans;
  const numberOfChildren : NumberOfChildren = new NumberOfChildren(statementOfMeans?.dependants?.numberOfChildren?.under11, statementOfMeans?.dependants?.numberOfChildren?.between11and15, statementOfMeans?.dependants?.numberOfChildren?.between16and19);
  return (numberOfChildren.totalNumberOfChildren() > 0 &&
      ((isDefendantNotDisabled(statementOfMeans)) || (isDefendantDisabledButNotSeverely(statementOfMeans) && !isDefendantPartnerDisabled(statementOfMeans))));
};

export const isDefendantNotDisabled = (statementOfMeans : StatementOfMeans) : boolean => {
  return statementOfMeans?.disability?.option === YesNo.NO;
};

export const isDefendantDisabledButNotSeverely = (statementOfMeans : StatementOfMeans) : boolean => {
  // Note that no ? needed on statementOfMeans in 2nd condition, as false && means it's never evaluated
  return statementOfMeans?.disability?.option === YesNo.YES &&
    statementOfMeans.severeDisability?.option === YesNo.NO;
};

export const isDefendantPartnerDisabled = (statementOfMeans : StatementOfMeans) : boolean => {
  // Note that no ? needed on statementOfMeans in 2nd condition, as false && means it's never evaluated
  return statementOfMeans?.cohabiting?.option === YesNo.YES && statementOfMeans.partnerDisability?.option === YesNo.YES;
};


export const getChildrenDisability = async (claimId: string) : Promise<ChildrenDisability> => {
  try {
    const case_data = await getCaseDataFromStore(claimId);
    if (case_data?.statementOfMeans?.childrenDisability) {
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
    if (case_data.statementOfMeans) {
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





