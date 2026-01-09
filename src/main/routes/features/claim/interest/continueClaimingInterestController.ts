import {NextFunction, RequestHandler, Response, Router} from 'express';
import {GenericForm} from 'form/models/genericForm';
import {GenericYesNo} from 'form/models/genericYesNo';
import {
  CLAIM_HELP_WITH_FEES_URL,
  CLAIM_INTEREST_CONTINUE_CLAIMING_URL,
  CLAIM_INTEREST_HOW_MUCH_URL,
} from 'routes/urls';
import {AppRequest} from 'models/AppRequest';
import {YesNo} from 'form/models/yesNo';
import {getInterest, saveInterest} from 'services/features/claim/interest/interestService';
import {getClaimInterestForm} from 'services/features/claim/interest/claimInterestService';

const {Logger} = require('@hmcts/nodejs-logging');
const logger = Logger.getLogger('continueClaimingInterestController');
const continueClaimingInterestController = Router();
const continueClaimingInterestPath = 'features/claim/interest/continue-claiming-interest';

function renderView(form: GenericForm<GenericYesNo>, res: Response): void {
  res.render(continueClaimingInterestPath, {form, pageTitle: 'PAGES.CLAIM_JOURNEY.CONTINUE_CLAIMING_INTEREST.PAGE_TITLE'});
}

continueClaimingInterestController.get(CLAIM_INTEREST_CONTINUE_CLAIMING_URL, (async (req:AppRequest, res:Response, next: NextFunction) => {
  const caseId = req.session?.user?.id;
  try {
    const interest = await getInterest(caseId);
    renderView(new GenericForm(new GenericYesNo(interest.continueClaimingInterest)), res);
  } catch (error) {
    next(error);
  }
}) as RequestHandler);

continueClaimingInterestController.post(CLAIM_INTEREST_CONTINUE_CLAIMING_URL, (async (req: AppRequest, res: Response, next: NextFunction) => {
  try {
    const caseId = req.session?.user?.id;
    const body = req.body as Record<string, string>;
    const continueClaimingInterest = getClaimInterestForm(body.option);
    const form = new GenericForm(continueClaimingInterest);
    form.validateSync();

    if (form.hasErrors()) {
      renderView(form, res);
    } else {
      logger.info(`continueClaimingInterest option for user ${caseId}, option: ${form.model.option}`);
      await saveInterest(caseId, form.model.option as YesNo, 'continueClaimingInterest');
      (form.model.option === YesNo.YES) ?
        res.redirect(CLAIM_INTEREST_HOW_MUCH_URL) :
        res.redirect(CLAIM_HELP_WITH_FEES_URL);
    }
  } catch (error) {
    next(error);
  }
}) as RequestHandler);

export default continueClaimingInterestController;
