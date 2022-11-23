import {
  BetweenSixteenAndNineteenDependants,
} from 'common/form/models/statementOfMeans/dependants/betweenSixteenAndNineteenDependants';
import {getCaseDataFromStore, saveDraftClaim} from 'modules/draft-store/draftStoreService';
import {Claim} from 'common/models/claim';
import {StatementOfMeans} from 'common/models/statementOfMeans';
import {GenericForm} from 'common/form/models/genericForm';

const {Logger} = require('@hmcts/nodejs-logging');
const logger = Logger.getLogger('betweenSixteenAndNineteenService');

export const getForm = async (claimId: string): Promise<GenericForm<BetweenSixteenAndNineteenDependants>> => {
  try {
    const claim = await getCaseDataFromStore(claimId);
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

export const saveFormToDraftStore = async (claimId: string, form: GenericForm<BetweenSixteenAndNineteenDependants>): Promise<Claim> => {
  try {
    const claim = await getClaim(claimId);
    const statementOfMeans = claim.statementOfMeans ? claim.statementOfMeans : new StatementOfMeans();
    statementOfMeans.numberOfChildrenLivingWithYou = form.model.value;
    claim.statementOfMeans = statementOfMeans;
    await saveDraftClaim(claimId, claim);
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

const getClaim = async (claimId: string): Promise<Claim> => {
  let claim;
  try {
    claim = await getCaseDataFromStore(claimId);
  } catch (error) {
    logger.error(`${error.stack || error}`);
    throw error;
  }
  if (!claim) {
    claim = new Claim();
  }
  return claim;
};
