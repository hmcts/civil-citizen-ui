import * as express from 'express';
import {
  CLAIM_INTEREST_URL,
  CLAIM_INTEREST_TYPE_URL,
  CLAIM_HELP_WITH_FEES_URL,
} from  '../../../../routes/urls';
import {GenericForm} from '../../../../common/form/models/genericForm';
import {GenericYesNo} from '../../../../common/form/models/genericYesNo';
import {YesNo} from '../../../../common/form/models/yesNo';
import {
  getClaimInterest,
  getClaimInterestForm,
  saveClaimInterest,
} from '../../../../services/features/claim/interest/claimInterestService';
import {AppRequest} from '../../../../common/models/AppRequest';
import {RequestHandler} from 'express';

const claimInterestController = express.Router();
const claimInterestPath = 'features/claim/interest/claim-interest';
const {Logger} = require('@hmcts/nodejs-logging');
const logger = Logger.getLogger('claimInterestController');

function renderView(form: GenericForm<GenericYesNo>, res: express.Response): void {
  res.render(claimInterestPath, {form, pageTitle: 'PAGES.CLAIM_JOURNEY.CLAIM_INTEREST.PAGE_TITLE'});
}

claimInterestController.get(CLAIM_INTEREST_URL, (async (req:AppRequest, res:express.Response, next: express.NextFunction) => {
  const caseId = req.session?.user?.id;

  try {
    renderView(new GenericForm(await getClaimInterest(caseId)), res);
  } catch (error) {
    next(error);
  }
}) as RequestHandler);

claimInterestController.post(CLAIM_INTEREST_URL, (async (req: AppRequest & express.Request, res: express.Response, next: express.NextFunction) => {
  try {
    const userId = req.session?.user?.id;
    const claimInterest = getClaimInterestForm(req.body.option);
    const form = new GenericForm(claimInterest);
    form.validateSync();

    if (form.hasErrors()) {
      renderView(form, res);
    } else {
      logger.info(`Claim interest yesOrNo updated for user ${userId}, claimInterestOption: ${form.model.option}`);
      await saveClaimInterest(userId, form.model.option as YesNo);
      (form.model.option === YesNo.YES) ?
        res.redirect(CLAIM_INTEREST_TYPE_URL) :
        res.redirect(CLAIM_HELP_WITH_FEES_URL);
    }
  } catch (error) {
    next(error);
  }
}) as express.RequestHandler);

export default claimInterestController;
