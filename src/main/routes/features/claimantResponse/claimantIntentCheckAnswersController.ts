import {NextFunction, Request, Response, Router} from 'express';
import {
  CONFIRMATION_URL,
  CLAIMANT_RESPONSE_CHECK_ANSWERS_URL,
} from '../../urls';
import {
  getStatementOfTruth,
  getSummarySections,
  saveStatementOfTruth,
} from 'services/features/claimantResponse/checkAnswers/checkAnswersService';
import {GenericForm} from 'form/models/genericForm';
import {deleteDraftClaimFromStore, getCaseDataFromStore} from 'modules/draft-store/draftStoreService';
import {StatementOfTruthForm} from 'form/models/statementOfTruth/statementOfTruthForm';
import {Claim} from 'models/claim';
import {constructResponseUrlWithIdParams} from 'common/utils/urlFormatter';
import {QualifiedStatementOfTruth} from 'form/models/statementOfTruth/qualifiedStatementOfTruth';import {AppRequest} from 'models/AppRequest';
import {SignatureType} from 'models/signatureType';
import {submitClaimantResponse} from 'services/features/claimantResponse/submitClaimantResponse';

const checkAnswersViewPath = 'features/claimantResponse/check-answers';
const claimantIntentCheckAnswersController = Router();

function renderView(req: Request, res: Response, form: GenericForm<StatementOfTruthForm> | GenericForm<QualifiedStatementOfTruth>, claim: Claim) {
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
      const form = new GenericForm(getStatementOfTruth(claim));
      renderView(req, res, form, claim);
    } catch (error) {
      next(error);
    }
  });

claimantIntentCheckAnswersController.post(CLAIMANT_RESPONSE_CHECK_ANSWERS_URL, async (req: Request, res: Response, next: NextFunction) => {
  try {
    // TODO : check if it's required
    const isFullAmountRejected = (req.body.isFullAmountRejected === 'true');
    const form = new GenericForm((req.body.type === SignatureType.QUALIFIED)
      ? new QualifiedStatementOfTruth(isFullAmountRejected, req.body.signed, req.body.directionsQuestionnaireSigned, req.body.signerName, req.body.signerRole)
      : new StatementOfTruthForm(isFullAmountRejected, req.body.type, req.body.signed, req.body.directionsQuestionnaireSigned));
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


