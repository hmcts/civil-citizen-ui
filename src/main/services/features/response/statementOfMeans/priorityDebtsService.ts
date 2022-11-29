import {Request} from 'express';
import {getCaseDataFromStore, saveDraftClaim} from '../../../../modules/draft-store/draftStoreService';
import {StatementOfMeans} from '../../../../common/models/statementOfMeans';
import {PriorityDebts} from '../../../../common/form/models/statementOfMeans/priorityDebts';
import {Transaction} from 'common/form/models/statementOfMeans/expensesAndIncome/transaction';

const {Logger} = require('@hmcts/nodejs-logging');
const logger = Logger.getLogger('priorityDebtsService');

export const getPriorityDebts = async (claimId: string): Promise<PriorityDebts> => {
  try {
    const claim = await getCaseDataFromStore(claimId);
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

export const savePriorityDebts = async (claimId: string, priorityDebts: PriorityDebts) => {
  try {
    const claim = await getCaseDataFromStore(claimId);
    if (!claim.statementOfMeans) {
      claim.statementOfMeans = new StatementOfMeans();
    }
    claim.statementOfMeans.priorityDebts = priorityDebts;
    await saveDraftClaim(claimId, claim);
  } catch (error) {
    logger.error(error);
    throw error;
  }
};
