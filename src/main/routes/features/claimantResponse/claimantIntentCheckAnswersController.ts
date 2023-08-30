import {NextFunction, Request, Response, Router} from 'express';
import {
  CONFIRMATION_URL,
  CLAIMANT_RESPONSE_CHECK_ANSWERS_URL,
} from '../../urls';
import {
  getSummarySections,
  saveStatementOfTruth,
} from 'services/features/claimantResponse/checkAnswers/checkAnswersService';
import {GenericForm} from 'form/models/genericForm';
import {
  deleteDraftClaimFromStore,
  getCaseDataFromStore
} from 'modules/draft-store/draftStoreService';
import {StatementOfTruthForm} from 'form/models/statementOfTruth/statementOfTruthForm';
import {Claim} from 'models/claim';
import {constructResponseUrlWithIdParams} from 'common/utils/urlFormatter';
import {AppRequest} from 'models/AppRequest';
import {submitClaimantResponse} from 'services/features/claimantResponse/submitClaimantResponse';

const checkAnswersViewPath = 'features/claimantResponse/check-answers';
const claimantIntentCheckAnswersController = Router();

function renderView(req: Request, res: Response, form: GenericForm<StatementOfTruthForm>, claim: Claim) {
  const lang = req.query.lang ? req.query.lang : req.cookies.lang;
  const summarySections = getSummarySections(req.params.id, claim, lang);
  res.render(checkAnswersViewPath, {
    form,
    summarySections,
  });
}

claimantIntentCheckAnswersController.get(CLAIMANT_RESPONSE_CHECK_ANSWERS_URL,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const claim = await getCaseDataFromStore(req.params.id);
      const form = new GenericForm(new StatementOfTruthForm());
      renderView(req, res, form, claim);
    } catch (error) {
      next(error);
    }
  });

claimantIntentCheckAnswersController.post(CLAIMANT_RESPONSE_CHECK_ANSWERS_URL, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const form = new GenericForm(new StatementOfTruthForm(true, req.body.type, true, req.body.directionsQuestionnaireSigned));
    await form.validate();
    if (form.hasErrors()) {
      const claim = await getCaseDataFromStore(req.params.id);
      renderView(req, res, form, claim);
    } else {
      await saveStatementOfTruth(req.params.id, form.model);
      await submitClaimantResponse(<AppRequest>req);
      await deleteDraftClaimFromStore(req.params.id);
      res.redirect(constructResponseUrlWithIdParams(req.params.id, CONFIRMATION_URL));
    }
  } catch (error) {
    next(error);
  }
});

export default claimantIntentCheckAnswersController;


