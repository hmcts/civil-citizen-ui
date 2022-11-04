import {getCaseDataFromStore, saveDraftClaim} from '../../../../../modules/draft-store/draftStoreService';
import {StatementOfMeans} from '../../../../../common/models/statementOfMeans';
import {Claim} from '../../../../../common/models/claim';
import {YesNo} from '../../../../../common/form/models/yesNo';
import {NumberOfChildren} from '../../../../../common/form/models/statementOfMeans/dependants/numberOfChildren';
import {GenericYesNo} from '../../../../../common/form/models/genericYesNo';

const {Logger} = require('@hmcts/nodejs-logging');
const logger = Logger.getLogger('childrenDisabilityService');

export const hasDisabledChildren = (claim: Claim): boolean => {
  const statementOfMeans = claim.statementOfMeans;
  const numberOfChildren: NumberOfChildren = new NumberOfChildren(statementOfMeans?.dependants?.numberOfChildren?.under11, statementOfMeans?.dependants?.numberOfChildren?.between11and15, statementOfMeans?.dependants?.numberOfChildren?.between16and19);
  return (numberOfChildren.totalNumberOfChildren() > 0 &&
    ((isDefendantNotDisabled(statementOfMeans)) || (isDefendantDisabledButNotSeverely(statementOfMeans) && !isDefendantPartnerDisabled(statementOfMeans))));
};

export const isDefendantNotDisabled = (statementOfMeans: StatementOfMeans): boolean => {
  return statementOfMeans?.disability?.option === YesNo.NO;
};

export const isDefendantDisabledButNotSeverely = (statementOfMeans: StatementOfMeans): boolean => {
  // Note that no ? needed on statementOfMeans in 2nd condition, as false && means it's never evaluated
  return statementOfMeans?.disability?.option === YesNo.YES &&
    statementOfMeans.severeDisability?.option === YesNo.NO;
};

export const isDefendantPartnerDisabled = (statementOfMeans: StatementOfMeans): boolean => {
  return statementOfMeans?.cohabiting?.option === YesNo.YES && statementOfMeans.partnerDisability?.option === YesNo.YES;
};

export const getChildrenDisability = async (claimId: string): Promise<GenericYesNo> => {
  try {
    const case_data = await getCaseDataFromStore(claimId);
    if (case_data?.statementOfMeans?.childrenDisability) {
      const childrenDisability = new GenericYesNo();
      childrenDisability.option = case_data.statementOfMeans.childrenDisability.option;
      return childrenDisability;
    }
    return new GenericYesNo();
  } catch (error) {
    logger.error(error);
    throw error;
  }
};

export const saveChildrenDisability = async (claimId: string, childrenDisability: GenericYesNo) => {
  try {
    const case_data = await getCaseDataFromStore(claimId);
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
