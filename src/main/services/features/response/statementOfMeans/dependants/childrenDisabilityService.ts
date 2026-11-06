import {getResponseDraft, getResponseClaimById, updateResponseDraft} from 'modules/draft-store/response/responseDraftStoreService';
import {StatementOfMeans} from 'common/models/statementOfMeans';
import {Claim} from 'common/models/claim';
import {YesNo} from 'common/form/models/yesNo';
import {NumberOfChildren} from 'common/form/models/statementOfMeans/dependants/numberOfChildren';
import {GenericYesNo} from 'common/form/models/genericYesNo';
import {getRouteParam} from 'common/utils/routeParamUtils';
import {AppRequest} from 'models/AppRequest';

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

export const getChildrenDisability = async (req: AppRequest): Promise<GenericYesNo> => {
  try {
    const caseId = getRouteParam(req, 'id');
    const claim = await getResponseClaimById(req, caseId);
    if (claim?.statementOfMeans?.childrenDisability) {
      const childrenDisability = new GenericYesNo();
      childrenDisability.option = claim.statementOfMeans.childrenDisability.option;
      return childrenDisability;
    }
    return new GenericYesNo();
  } catch (error) {
    logger.error(error);
    throw error;
  }
};

export const saveChildrenDisability = async (req: AppRequest, childrenDisability: GenericYesNo) => {
  try {
    const caseId = getRouteParam(req, 'id');
    const draftResult = await getResponseDraft(req, caseId);
    if (!draftResult) {
      throw new Error('[childrenDisabilityService] no response draft found');
    }
    const claim = Object.assign(new Claim(), draftResult.claimResponse?.case_data as unknown as Claim);
    const draftId = draftResult.rawResponse?.draftId;

    if (claim.statementOfMeans) {
      claim.statementOfMeans.childrenDisability = childrenDisability;
    } else {
      const statementOfMeans = new StatementOfMeans();
      statementOfMeans.childrenDisability = childrenDisability;
      claim.statementOfMeans = statementOfMeans;
    }
    if (draftResult.createdAt && !claim.draftClaimCreatedAt) {
      claim.draftClaimCreatedAt = new Date(draftResult.createdAt);
    }
    await updateResponseDraft(req, caseId, claim, draftId);
  } catch (error) {
    logger.error(error);
    throw error;
  }
};
