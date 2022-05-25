import * as express from 'express';
import {CITIZEN_DEBTS_URL, CITIZEN_MONTHLY_EXPENSES_URL} from '../../../../urls';
import {Debts} from '../../../../../common/form/models/statementOfMeans/debts/debts';
import {DebtItems} from '../../../../../common/form/models/statementOfMeans/debts/debtItems';
import {validateFormNested} from '../../../../../common/form/validators/formValidator';
import {Claim} from '../../../../../common/models/claim';
import {getCaseDataFromStore, saveDraftClaim} from '../../../../../modules/draft-store/draftStoreService';
import {StatementOfMeans} from '../../../../../common/models/statementOfMeans';
import {YesNo} from '../../../../../common/form/models/yesNo';
import {constructResponseUrlWithIdParams} from '../../../../../common/utils/urlFormatter';

const debtsViewPath = 'features/response/statementOfMeans/debts/debts';
const debtsController = express.Router();
const {Logger} = require('@hmcts/nodejs-logging');
const logger = Logger.getLogger('debtsController');

function renderView(form: Debts, res: express.Response): void {
  res.render(debtsViewPath, {
    form,
  });
}

debtsController.get(CITIZEN_DEBTS_URL, async (req, res) => {
  try {
    const form: Debts = new Debts();
    const responseDataRedis: Claim = await getCaseDataFromStore(req.params.id);
    if (responseDataRedis.statementOfMeans?.debts) {
      form.option = responseDataRedis.statementOfMeans.debts.option;
      if (form.option === YesNo.YES) {
        form.debtsItems = responseDataRedis.statementOfMeans.debts.debtsItems.map(item => new DebtItems(item.debt, item.totalOwned, item.monthlyPayments));
      }
    }
    renderView(form, res);
  } catch (error) {
    logger.error(error);
    res.status(500).send({error: error.message});
  }
});

debtsController.post(CITIZEN_DEBTS_URL,
  async (req, res) => {
    try {
      const form: Debts = new Debts(req.body.option, transformToDebts(req));
      await validateFormNested(form);
      if (form.hasErrors()) {
        renderView(form, res);
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
      logger.error(error);
      res.status(500).send({error: error.message});
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
