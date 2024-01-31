import {NextFunction, Request, Response, Router} from 'express';
import {CONFIRMATION_URL, RESPONSE_CHECK_ANSWERS_URL, RESPONSE_INCOMPLETE_SUBMISSION_URL} from '../../urls';
import {
  getStatementOfTruth,
  getSummarySections,
  saveStatementOfTruth,
} from 'services/features/response/checkAnswers/checkAnswersService';
import {GenericForm} from 'form/models/genericForm';
import {deleteDraftClaimFromStore, generateRedisKey, getCaseDataFromStore} from 'modules/draft-store/draftStoreService';
import {StatementOfTruthForm} from 'form/models/statementOfTruth/statementOfTruthForm';
import {Claim} from 'models/claim';
import {constructResponseUrlWithIdParams} from 'common/utils/urlFormatter';
import {QualifiedStatementOfTruth} from 'form/models/statementOfTruth/qualifiedStatementOfTruth';
import {AllResponseTasksCompletedGuard} from 'routes/guards/allResponseTasksCompletedGuard';
import {submitResponse} from 'services/features/response/submission/submitResponse';
import {AppRequest} from 'models/AppRequest';
import {SignatureType} from 'models/signatureType';
import {isFirstTimeInPCQ} from 'routes/guards/pcqGuard';
import {isCarmEnabledForCase} from 'common/utils/carmToggleUtils';

const checkAnswersViewPath = 'features/response/check-answers';
const checkAnswersController = Router();

function renderView(req: Request, res: Response, form: GenericForm<StatementOfTruthForm> | GenericForm<QualifiedStatementOfTruth>, claim: Claim, carmApplicable = false) {
  const lang = req.query.lang ? req.query.lang : req.cookies.lang;
  const summarySections = getSummarySections(req.params.id, claim, lang, carmApplicable);
  res.render(checkAnswersViewPath, {
    form,
    summarySections,
  });
}

checkAnswersController.get(RESPONSE_CHECK_ANSWERS_URL,
  [AllResponseTasksCompletedGuard.apply(RESPONSE_INCOMPLETE_SUBMISSION_URL),
    isFirstTimeInPCQ],
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const claim = await getCaseDataFromStore(generateRedisKey(<AppRequest>req));
      const carmApplicable = await isCarmEnabledForCase(claim.submittedDate);
      const form = new GenericForm(getStatementOfTruth(claim));
      renderView(req, res, form, claim, carmApplicable);
    } catch (error) {
      next(error);
    }
  });

checkAnswersController.post(RESPONSE_CHECK_ANSWERS_URL, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const isFullAmountRejected = (req.body.isFullAmountRejected === 'true');
    const redisKey = generateRedisKey(<AppRequest>req);
    const form = new GenericForm((req.body.type === SignatureType.QUALIFIED)
      ? new QualifiedStatementOfTruth(isFullAmountRejected, req.body.signed, req.body.directionsQuestionnaireSigned, req.body.signerName, req.body.signerRole)
      : new StatementOfTruthForm(isFullAmountRejected, req.body.type, req.body.signed, req.body.directionsQuestionnaireSigned));
    await form.validate();
    if (form.hasErrors()) {
      const claim = await getCaseDataFromStore(redisKey);
      renderView(req, res, form, claim);
    } else {
      await saveStatementOfTruth(redisKey, form.model);
      await submitResponse(<AppRequest>req);
      await deleteDraftClaimFromStore(redisKey);
      res.redirect(constructResponseUrlWithIdParams(req.params.id, CONFIRMATION_URL));
    }
  } catch (error) {
    next(error);
  }
});

export default checkAnswersController;

