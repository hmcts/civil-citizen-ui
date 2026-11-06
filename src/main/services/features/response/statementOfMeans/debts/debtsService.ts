import {Request} from 'express';
import {getResponseClaimById, getResponseDraft, updateResponseDraft} from 'modules/draft-store/response/responseDraftStoreService';
import {StatementOfMeans} from 'common/models/statementOfMeans';
import {Debts} from 'common/form/models/statementOfMeans/debts/debts';
import {DebtItems} from 'common/form/models/statementOfMeans/debts/debtItems';
import {YesNo} from 'common/form/models/yesNo';
import {AppRequest} from 'models/AppRequest';
import {Claim} from 'models/claim';
import {getRouteParam} from 'common/utils/routeParamUtils';

const {Logger} = require('@hmcts/nodejs-logging');
const logger = Logger.getLogger('debtsService');

export const getDebts = async (req: AppRequest): Promise<Debts> => {
  try {
    const caseId = getRouteParam(req, 'id');
    const claim = await getResponseClaimById(req, caseId);
    const debts = new Debts();

    if (claim.statementOfMeans?.debts) {
      debts.option = claim.statementOfMeans.debts.option;
      if (debts.option === YesNo.YES) {
        debts.debtsItems = claim.statementOfMeans.debts.debtsItems.map(
          item => new DebtItems(item.debt, item.totalOwned, item.monthlyPayments),
        );
      }
    }
    return debts;
  } catch (error) {
    logger.error(error);
    throw error;
  }
};

export const saveDebts = async (req: AppRequest, debts: Debts) => {
  try {
    const caseId = getRouteParam(req, 'id');
    const draftResult = await getResponseDraft(req, caseId);
    if (!draftResult) {
      throw new Error('[debtsService] no response draft found');
    }
    const claim = Object.assign(new Claim(), draftResult.claimResponse?.case_data as unknown as Claim);
    const draftId = draftResult.rawResponse?.draftId;

    if (!claim.statementOfMeans) {
      claim.statementOfMeans = new StatementOfMeans();
    }
    claim.statementOfMeans.debts = debts;

    if (draftResult.createdAt && !claim.draftClaimCreatedAt) {
      claim.draftClaimCreatedAt = new Date(draftResult.createdAt);
    }
    await updateResponseDraft(req, caseId, claim, draftId);
  } catch (error) {
    logger.error(error);
    throw error;
  }
};

export const transformToDebts = (req: Request): DebtItems[] => {
  return req.body.debtsItems
    .map((item: DebtItems) => new DebtItems(item.debt, item.totalOwned, item.monthlyPayments));
};

export const removeEmptyValueToDebts = (req: Request): DebtItems[] => {
  return req.body.debtsItems
    .filter((item: DebtItems) => item.debt && item.totalOwned && item.monthlyPayments)
    .map((item: DebtItems) => new DebtItems(item.debt, item.totalOwned, item.monthlyPayments));
};
