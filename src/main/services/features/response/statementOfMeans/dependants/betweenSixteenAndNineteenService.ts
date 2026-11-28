import {
  BetweenSixteenAndNineteenDependants,
} from 'common/form/models/statementOfMeans/dependants/betweenSixteenAndNineteenDependants';
import {getResponseDraft, getResponseClaimById, updateResponseDraft} from 'modules/draft-store/response/responseDraftStoreService';
import {Claim} from 'common/models/claim';
import {StatementOfMeans} from 'common/models/statementOfMeans';
import {GenericForm} from 'common/form/models/genericForm';
import {AppRequest} from 'models/AppRequest';
import {getRouteParam} from 'common/utils/routeParamUtils';

const {Logger} = require('@hmcts/nodejs-logging');
const logger = Logger.getLogger('betweenSixteenAndNineteenService');

export const getForm = async (req: AppRequest): Promise<GenericForm<BetweenSixteenAndNineteenDependants>> => {
  try {
    const caseId = getRouteParam(req, 'id');
    const claim = await getResponseClaimById(req, caseId);
    let maxValue = 0;
    let value = undefined;
    if (claim) {
      maxValue = getMaxValue(claim);
      value = getNumberOfChildrenLivingWithYou(claim);
    }
    return new GenericForm(new BetweenSixteenAndNineteenDependants(value, maxValue));
  } catch (error) {
    logger.error(`${error.stack || error}`);
    throw error;
  }
};

export const saveFormToDraftStore = async (req: AppRequest, form: GenericForm<BetweenSixteenAndNineteenDependants>): Promise<Claim> => {
  try {
    const caseId = getRouteParam(req, 'id');
    const draftResult = await getResponseDraft(req, caseId);
    if (!draftResult) {
      throw new Error('[betweenSixteenAndNineteenService] no response draft found');
    }
    const claim = Object.assign(new Claim(), draftResult.claimResponse?.case_data as unknown as Claim);
    const draftId = draftResult.rawResponse?.draftId;
    const statementOfMeans = claim.statementOfMeans ? claim.statementOfMeans : new StatementOfMeans();
    statementOfMeans.numberOfChildrenLivingWithYou = form.model.value;
    claim.statementOfMeans = statementOfMeans;
    if (draftResult.createdAt && !claim.draftClaimCreatedAt) {
      claim.draftClaimCreatedAt = new Date(draftResult.createdAt);
    }
    await updateResponseDraft(req, caseId, claim, draftId);
    return claim;
  } catch (error) {
    logger.error(`${error.stack || error}`);
    throw error;
  }
};

const getMaxValue = (claim: Claim): number | undefined => {
  return (claim?.statementOfMeans?.dependants?.numberOfChildren)
    ? Number(claim.statementOfMeans.dependants.numberOfChildren.between16and19)
    : undefined;
};

const getNumberOfChildrenLivingWithYou = (claim: Claim): number | undefined => {
  return (claim?.statementOfMeans?.numberOfChildrenLivingWithYou)
    ? claim.statementOfMeans.numberOfChildrenLivingWithYou
    : undefined;
};
