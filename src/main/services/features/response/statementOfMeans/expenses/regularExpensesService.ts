import {RegularExpenses} from 'common/form/models/statementOfMeans/expensesAndIncome/regularExpenses';
import {getResponseDraft, getResponseClaimById, updateResponseDraft} from 'modules/draft-store/response/responseDraftStoreService';
import {StatementOfMeans} from 'common/models/statementOfMeans';
import {getRouteParam} from 'common/utils/routeParamUtils';
import {AppRequest} from 'models/AppRequest';
import {Claim} from 'models/claim';

const {Logger} = require('@hmcts/nodejs-logging');
const logger = Logger.getLogger('regularExpensesService');

const getRegularExpenses = async (req: AppRequest): Promise<RegularExpenses> => {
  try {
    const caseId = getRouteParam(req, 'id');
    const claim = await getResponseClaimById(req, caseId);

    if (claim.statementOfMeans?.regularExpenses) {
      return claim.statementOfMeans.regularExpenses;
    }
    return RegularExpenses.buildEmptyForm();
  } catch (error) {
    logger.error(error);
    throw error;
  }
};

const saveRegularExpenses = async (req: AppRequest, regularExpenses: RegularExpenses) => {
  try {
    const caseId = getRouteParam(req, 'id');
    const draftResult = await getResponseDraft(req, caseId);
    if (!draftResult) {
      throw new Error('[regularExpensesService] no response draft found');
    }
    const claim = Object.assign(new Claim(), draftResult.claimResponse?.case_data as unknown as Claim);
    const draftId = draftResult.rawResponse?.draftId;

    if (!claim.statementOfMeans) {
      claim.statementOfMeans = new StatementOfMeans();
    }
    claim.statementOfMeans.regularExpenses = regularExpenses;
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
  getRegularExpenses,
  saveRegularExpenses,
};
