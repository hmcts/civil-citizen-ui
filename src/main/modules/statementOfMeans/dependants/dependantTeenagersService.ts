import {DependantTeenagers} from '../../../common/form/models/statementOfMeans/dependants/dependantTeenagers';
import {getCaseDataFromStore, saveDraftClaim} from '../../../modules/draft-store/draftStoreService';
import {Claim} from '../../../common/models/claim';
import {StatementOfMeans} from '../../../common/models/statementOfMeans';
import {get} from 'lodash';


const {Logger} = require('@hmcts/nodejs-logging');
const logger = Logger.getLogger('dependantTeenagersService');

export const getForm = async (claimId: string): Promise<DependantTeenagers> => {
  try {
    const claim = await getCaseDataFromStore(claimId);
    let maxValue = 0;
    let value = undefined;
    if (claim) {
      maxValue = getMaxValue(claim);
      value = getNumberOfChildrenLivingWithYou(claim);
    }
    return new DependantTeenagers(value, maxValue);
  } catch (error) {
    logger.error(`${error.stack || error}`);
    return undefined;
  }
};

export const saveFormToDraftStore = async (claimId: string, form: DependantTeenagers) => {
  try {
    const claim = await getClaim(claimId);
    const statementOfMeans = claim.statementOfMeans ? claim.statementOfMeans : new StatementOfMeans();
    statementOfMeans.numberOfChildrenLivingWithYou = form.value;
    claim.statementOfMeans = statementOfMeans;
    await saveDraftClaim(claimId, claim);
  } catch (error) {
    logger.error(`${error.stack || error}`);
    throw new Error(error);
  }
};

const getMaxValue = (claim: Claim): number | undefined => {
  if (get(claim, 'statementOfMeans.dependants.numberOfChildren')) {
    return Number(claim.statementOfMeans.dependants.numberOfChildren.between16and19);
  }
  return undefined;
};
const getNumberOfChildrenLivingWithYou = (claim: Claim): number | undefined => {
  if (get(claim, 'statementOfMeans.numberOfChildrenLivingWithYou')) {
    return claim.statementOfMeans.numberOfChildrenLivingWithYou;
  }
  return undefined;
};
const getClaim = async (claimId: string): Promise<Claim> => {
  let claim;
  try {
    claim = await getCaseDataFromStore(claimId);
  } catch (error) {
    logger.error(`${error.stack || error}`);
  }
  if (!claim) {
    claim = new Claim();
  }
  return claim;
};
