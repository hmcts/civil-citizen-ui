import {NextFunction, Request, RequestHandler, Response, Router} from 'express';
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
import {isMintiEnabledForCase, isCarmEnabledForCase} from '../../../app/auth/launchdarkly/launchDarklyClient';
import {ValidationError, Validator} from 'class-validator';
import {SpecificCourtLocation} from 'models/directionsQuestionnaire/hearing/specificCourtLocation';

const checkAnswersViewPath = 'features/response/check-answers';
const validator = new Validator();
const checkAnswersController = Router();

const {Logger} = require('@hmcts/nodejs-logging');
const logger = Logger.getLogger('checkAnswersController');

function renderView(req: Request, res: Response, form: GenericForm<StatementOfTruthForm> | GenericForm<QualifiedStatementOfTruth>, claim: Claim, carmApplicable = false, mintiApplicable = false) {
  const lang = req.query.lang ? req.query.lang : req.cookies.lang;
  const summarySections = getSummarySections(req.params.id, claim, lang, carmApplicable, mintiApplicable);
  res.render(checkAnswersViewPath, {
    form,
    summarySections,
  });
}

checkAnswersController.get(RESPONSE_CHECK_ANSWERS_URL,
  [AllResponseTasksCompletedGuard.apply(RESPONSE_INCOMPLETE_SUBMISSION_URL),
    isFirstTimeInPCQ],
  (async (req: Request, res: Response, next: NextFunction) => {
    try {
      const claim = await getCaseDataFromStore(generateRedisKey(<AppRequest>req));
      const carmApplicable = await isCarmEnabledForCase(claim.submittedDate);
      const mintiApplicable = await isMintiEnabledForCase(claim.submittedDate);
      const form = new GenericForm(getStatementOfTruth(claim));
      renderView(req, res, form, claim, carmApplicable, mintiApplicable);
    } catch (error) {
      logger.error(`Error when getting check your answers -  ${error.message}`);
      next(error);
    }
  }) as RequestHandler);

checkAnswersController.post(RESPONSE_CHECK_ANSWERS_URL, (async (req: Request, res: Response, next: NextFunction) => {
  try {
    const isFullAmountRejected = (req.body.isFullAmountRejected === 'true');
    const redisKey = generateRedisKey(<AppRequest>req);
    const claim = await getCaseDataFromStore(redisKey);
    const form = new GenericForm((req.body.type === SignatureType.QUALIFIED)
      ? new QualifiedStatementOfTruth(isFullAmountRejected, req.body.signed, req.body.directionsQuestionnaireSigned, req.body.signerName, req.body.signerRole)
      : new StatementOfTruthForm(isFullAmountRejected, req.body.type, req.body.signed, req.body.directionsQuestionnaireSigned));
    await form.validate();

    if (claim?.directionQuestionnaire?.hearing && !claim.directionQuestionnaire.hearing?.specificCourtLocation?.courtLocation) {
      form.errors = validateFields(new GenericForm<SpecificCourtLocation>(SpecificCourtLocation.fromObject(claim.directionQuestionnaire.hearing?.specificCourtLocation as any)), form.errors);
    }
    if (form.hasErrors()) {
      logger.info(`form has error -  ${req.params.id}`);
      renderView(req, res, form, claim);
    } else {
      logger.info('form has no error');
      await saveStatementOfTruth(redisKey, form.model);
      await submitResponse(<AppRequest>req);
      await deleteDraftClaimFromStore(redisKey);
      res.redirect(constructResponseUrlWithIdParams(req.params.id, CONFIRMATION_URL));
    }
  } catch (error) {
    logger.error(`Error when posting check your answers -  ${error.message}`);
    next(error);
  }
}) as RequestHandler);

export default checkAnswersController;

const validateFields = (genericForm: GenericForm<any>, formErrors: ValidationError[]): ValidationError[] => {
  return [...formErrors, ...validator.validateSync(genericForm.model)];
};
