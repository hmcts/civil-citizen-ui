import {NextFunction, Request, RequestHandler, Response, Router} from 'express';
import {
  CLAIMANT_RESPONSE_CHECK_ANSWERS_URL,
  CLAIMANT_RESPONSE_CONFIRMATION_URL,
} from '../../urls';
import {
  getSummarySections,
  saveStatementOfTruth,
} from 'services/features/claimantResponse/checkAnswers/checkAnswersService';
import {GenericForm} from 'form/models/genericForm';
import {generateRedisKey} from 'modules/draft-store/draftStoreService';
import {StatementOfTruthForm} from 'form/models/statementOfTruth/statementOfTruthForm';
import {Claim} from 'models/claim';
import {constructResponseUrlWithIdParams} from 'common/utils/urlFormatter';
import {AppRequest} from 'models/AppRequest';
import {submitClaimantResponse} from 'services/features/claimantResponse/submitClaimantResponse';
import {YesNo} from 'common/form/models/yesNo';
import {claimantResponsecheckYourAnswersGuard } from 'routes/guards/claimantResponseCheckYourAnswersGuard';
import {convertToPoundsFilter} from 'common/utils/currencyFormat';
import {isMintiEnabledForCase, isCarmEnabledForCase} from '../../../app/auth/launchdarkly/launchDarklyClient';
import {getClaimById} from 'modules/utilityService';
import {SpecificCourtLocation} from 'models/directionsQuestionnaire/hearing/specificCourtLocation';
import {ValidationError, Validator} from 'class-validator';

const checkAnswersViewPath = 'features/claimantResponse/check-answers';
const validator = new Validator();
const claimantResponseCheckAnswersController = Router();

async function renderView(req: AppRequest, res: Response, form: GenericForm<StatementOfTruthForm>, claim: Claim, isCarmApplicable: boolean, isMintiApplicable: boolean) {
  const lang = req.query.lang ? req.query.lang : req.cookies.lang;
  const claimFee = convertToPoundsFilter(claim.claimFee?.calculatedAmountInPence);
  const summarySections = getSummarySections(req.params.id, claim, lang, claimFee, isCarmApplicable, isMintiApplicable);

  res.render(checkAnswersViewPath, {
    form,
    summarySections,
    pageTitle: 'PAGES.CHECK_YOUR_ANSWER.CLAIMANT_INTENT_PAGE_TITLE',
  });
}

claimantResponseCheckAnswersController.get(CLAIMANT_RESPONSE_CHECK_ANSWERS_URL,claimantResponsecheckYourAnswersGuard,
  (async (req: Request, res: Response, next: NextFunction) => {
    try {
      const claimId = req.params.id;
      const claim = await getClaimById(claimId, req, true);
      const isClaimantRejectedDefendantOffer = claim?.claimantResponse?.hasPartAdmittedBeenAccepted?.option === YesNo.NO;
      const form = new GenericForm(new StatementOfTruthForm(isClaimantRejectedDefendantOffer));
      const isCarmApplicable = await isCarmEnabledForCase(claim.submittedDate);
      const isMintiApplicable = await isMintiEnabledForCase(claim.submittedDate);
      await renderView(<AppRequest>req, res, form, claim, isCarmApplicable, isMintiApplicable);
    } catch (error) {
      next(error);
    }
  }) as RequestHandler);

claimantResponseCheckAnswersController.post(CLAIMANT_RESPONSE_CHECK_ANSWERS_URL, (async (req: Request, res: Response, next: NextFunction) => {
  try {
    const isClaimantRejectedDefendantOffer = req.body.isClaimantRejectedDefendantOffer === 'true';
    const form = new GenericForm(new StatementOfTruthForm(isClaimantRejectedDefendantOffer, req.body.type, true, req.body.directionsQuestionnaireSigned));
    await form.validate();
    const claimId = req.params.id;
    const redisKey = generateRedisKey(<AppRequest>req);
    const claim = await getClaimById(claimId, req, true);
    const carmEnabled = await isCarmEnabledForCase(claim.submittedDate);
    const mintiEnabled = await isMintiEnabledForCase(claim.submittedDate);
    if (claim.claimantResponse?.directionQuestionnaire?.hearing && !claim.claimantResponse.directionQuestionnaire.hearing?.specificCourtLocation?.courtLocation) {
      form.errors = validateFields(new GenericForm<SpecificCourtLocation>(SpecificCourtLocation.fromObject(claim.claimantResponse.directionQuestionnaire.hearing?.specificCourtLocation as any)), form.errors);
    }
    if (form.hasErrors()) {
      const claim = await getClaimById(claimId, req, true);
      await renderView(<AppRequest>req, res, form, claim, carmEnabled, mintiEnabled);
    } else {
      await saveStatementOfTruth(redisKey, form.model);
      await submitClaimantResponse(<AppRequest>req);
      res.redirect(constructResponseUrlWithIdParams(req.params.id, CLAIMANT_RESPONSE_CONFIRMATION_URL));
    }
  } catch (error) {
    next(error);
  }
}) as RequestHandler);

export default claimantResponseCheckAnswersController;
const validateFields = (genericForm: GenericForm<any>, formErrors: ValidationError[]): ValidationError[] => {
  return [...formErrors, ...validator.validateSync(genericForm.model)];
};
