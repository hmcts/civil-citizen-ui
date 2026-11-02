import {Request} from 'express';
import {getResponseClaimById, getResponseDraft, updateResponseDraft} from 'modules/draft-store/response/responseDraftStoreService';
import {StatementOfMeans} from 'common/models/statementOfMeans';
import {PriorityDebts} from 'common/form/models/statementOfMeans/priorityDebts';
import {Transaction} from 'common/form/models/statementOfMeans/expensesAndIncome/transaction';
import {AppRequest} from 'models/AppRequest';
import {Claim} from 'models/claim';
import {getRouteParam} from 'common/utils/routeParamUtils';

const {Logger} = require('@hmcts/nodejs-logging');
const logger = Logger.getLogger('priorityDebtsService');

export const getPriorityDebts = async (req: AppRequest): Promise<PriorityDebts> => {
  try {
    const caseId = getRouteParam(req, 'id');
    const claim = await getResponseClaimById(req, caseId);

    if (claim.statementOfMeans?.priorityDebts) {
      return claim.statementOfMeans.priorityDebts;
    }
    return PriorityDebts.buildEmptyForm();
  } catch (error) {
    logger.error(error);
    throw error;
  }
};

export const getPriorityDebtsForm = (req: Request): PriorityDebts => {
  const priorityDebts = new PriorityDebts(req.body.model);
  Object.keys(req.body.model).forEach((key: keyof PriorityDebts) => {
    priorityDebts[key] = req.body.model[key]?.declared ?
      Transaction.buildPopulatedForm(
        req.body.model[key].transactionSource.name,
        req.body.model[key].transactionSource.amount,
        req.body.model[key].transactionSource.schedule,
      ) : Transaction.buildEmptyForm(req.body.model[key].transactionSource.name);
  });
  return priorityDebts;
};

export const savePriorityDebts = async (req: AppRequest, priorityDebts: PriorityDebts) => {
  try {
    const caseId = getRouteParam(req, 'id');
    const draftResult = await getResponseDraft(req, caseId);
    if (!draftResult) {
      throw new Error('[priorityDebtsService] no response draft found');
    }
    const claim = Object.assign(new Claim(), draftResult.claimResponse?.case_data as unknown as Claim);
    const draftId = draftResult.rawResponse?.draftId;

    if (!claim.statementOfMeans) {
      claim.statementOfMeans = new StatementOfMeans();
    }
    claim.statementOfMeans.priorityDebts = priorityDebts;

    if (draftResult.createdAt && !claim.draftClaimCreatedAt) {
      claim.draftClaimCreatedAt = new Date(draftResult.createdAt);
    }
    await updateResponseDraft(req, caseId, claim, draftId);
  } catch (error) {
    logger.error(error);
    throw error;
  }
};
