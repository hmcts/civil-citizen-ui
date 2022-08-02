import * as express from 'express';
import {CITIZEN_DEBTS_URL, CITIZEN_MONTHLY_EXPENSES_URL} from '../../../../urls';
import {Debts} from '../../../../../common/form/models/statementOfMeans/debts/debts';
import {DebtItems} from '../../../../../common/form/models/statementOfMeans/debts/debtItems';
import {Claim} from '../../../../../common/models/claim';
import {getCaseDataFromStore, saveDraftClaim} from '../../../../../modules/draft-store/draftStoreService';
import {StatementOfMeans} from '../../../../../common/models/statementOfMeans';
import {YesNo} from '../../../../../common/form/models/yesNo';
import {constructResponseUrlWithIdParams} from '../../../../../common/utils/urlFormatter';
import {GenericForm} from '../../../../../common/form/models/genericForm';

const debtsViewPath = 'features/response/statementOfMeans/debts/debts';
const debtsController = express.Router();

function renderView(form: GenericForm<Debts>, res: express.Response): void {
  res.render(debtsViewPath, {form});
}

debtsController.get(CITIZEN_DEBTS_URL, async (req, res, next: express.NextFunction) => {
  try {
    const debtsForm: GenericForm<Debts> = new GenericForm(new Debts());
    const responseDataRedis: Claim = await getCaseDataFromStore(req.params.id);
    if (responseDataRedis.statementOfMeans?.debts) {
      debtsForm.model.option = responseDataRedis.statementOfMeans.debts.option;
      if (debtsForm.model.option === YesNo.YES) {
        debtsForm.model.debtsItems = responseDataRedis.statementOfMeans.debts.debtsItems.map(item => new DebtItems(item.debt, item.totalOwned, item.monthlyPayments));
      }
    }
    renderView(debtsForm, res);
  } catch (error) {
    next(error);
  }
});

debtsController.post(CITIZEN_DEBTS_URL,
  async (req, res, next: express.NextFunction) => {
    try {
      const debtsForm: GenericForm<Debts> = new GenericForm(new Debts(req.body.option, transformToDebts(req)));
      debtsForm.validateSync();
      if (debtsForm.hasErrors()) {
        renderView(debtsForm, res);
      } else {
        const claim = await getCaseDataFromStore(req.params.id);
        if (!claim.statementOfMeans) {
          claim.statementOfMeans = new StatementOfMeans();
        }
        claim.statementOfMeans.debts = new Debts(req.body.option, removeEmptyValueToDebts(req));
        await saveDraftClaim(req.params.id, claim);
        res.redirect(constructResponseUrlWithIdParams(req.params.id, CITIZEN_MONTHLY_EXPENSES_URL));
      }
    } catch (error) {
      next(error);
    }
  });

function transformToDebts(req: express.Request): DebtItems[] {
  return req.body.debtsItems
    .map((item: DebtItems) => {
      return new DebtItems(item.debt, item.totalOwned, item.monthlyPayments);
    });
}

function removeEmptyValueToDebts(req: express.Request): DebtItems[] {
  return req.body.debtsItems
    .filter((item: DebtItems) => item.debt && item.totalOwned && item.monthlyPayments)
    .map((item: DebtItems) => {
      return new DebtItems(item.debt, item.totalOwned, item.monthlyPayments);
    });
}

export default debtsController;
