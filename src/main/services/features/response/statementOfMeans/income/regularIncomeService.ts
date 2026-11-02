import {getResponseDraft, getResponseClaimById, updateResponseDraft} from 'modules/draft-store/response/responseDraftStoreService';
import {StatementOfMeans} from 'common/models/statementOfMeans';
import {RegularIncome} from 'common/form/models/statementOfMeans/expensesAndIncome/regularIncome';
import {AppRequest} from 'models/AppRequest';
import {getRouteParam} from 'common/utils/routeParamUtils';
import {Claim} from 'models/claim';

const {Logger} = require('@hmcts/nodejs-logging');
const logger = Logger.getLogger('regularIncomeService');

const getRegularIncome = async (req: AppRequest): Promise<RegularIncome> => {
  try {
    const caseId = getRouteParam(req, 'id');
    const claim = await getResponseClaimById(req, caseId);

    if (claim.statementOfMeans?.regularIncome) {
      return claim.statementOfMeans.regularIncome;
    }
    return RegularIncome.buildEmptyForm();
  } catch (error) {
    logger.error(error);
    throw error;
  }
};

const saveRegularIncome = async (req: AppRequest, regularIncome: RegularIncome) => {
  try {
    const caseId = getRouteParam(req, 'id');
    const draftResult = await getResponseDraft(req, caseId);
    if (!draftResult) {
      throw new Error('[regularIncomeService] no response draft found');
    }
    const claim = Object.assign(new Claim(), draftResult.claimResponse?.case_data as unknown as Claim);
    const draftId = draftResult.rawResponse?.draftId;

    if (!claim.statementOfMeans) {
      claim.statementOfMeans = new StatementOfMeans();
    }
    claim.statementOfMeans.regularIncome = regularIncome;
    if (draftResult.createdAt && !claim.draftClaimCreatedAt) {
      claim.draftClaimCreatedAt = new Date(draftResult.createdAt);
    }
    await updateResponseDraft(req, caseId, claim, draftId);
  } catch (error) {
    logger.error(error);
    throw error;
  }
};

export {
  getRegularIncome,
  saveRegularIncome,
};
