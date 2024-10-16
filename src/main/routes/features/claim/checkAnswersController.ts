import {NextFunction, Request, Response, Router} from 'express';
import {CLAIM_CHECK_ANSWERS_URL, CLAIM_CONFIRMATION_URL} from '../../urls';
import {
  getStatementOfTruth,
  getSummarySections,
  saveStatementOfTruth,
} from 'services/features/claim/checkAnswers/checkAnswersService';
import {
  deleteDraftClaimFromStore,
  getCaseDataFromStore,
} from 'modules/draft-store/draftStoreService';
import {Claim} from 'common/models/claim';
import {constructResponseUrlWithIdParams} from 'common/utils/urlFormatter';
import {AppRequest} from 'common/models/AppRequest';
import {submitClaim} from 'services/features/claim/submission/submitClaim';
import {GenericForm} from 'common/form/models/genericForm';
import {StatementOfTruthForm} from 'common/form/models/statementOfTruth/statementOfTruthForm';
import {QualifiedStatementOfTruth} from 'common/form/models/statementOfTruth/qualifiedStatementOfTruth';
import {YesNo} from 'common/form/models/yesNo';
import {checkYourAnswersClaimGuard} from 'routes/guards/checkYourAnswersGuard';
import {StatementOfTruthFormClaimIssue} from 'form/models/statementOfTruth/statementOfTruthFormClaimIssue';
import {QualifiedStatementOfTruthClaimIssue} from 'form/models/statementOfTruth/qualifiedStatementOfTruthClaimIssue';
import {isFirstTimeInPCQ} from 'routes/guards/pcqGuardClaim';
import {isCarmEnabledForCase} from '../../../app/auth/launchdarkly/launchDarklyClient';
import {FormValidationError} from 'form/validationErrors/formValidationError';

const checkAnswersViewPath = 'features/claim/check-answers';
//const paymentUrl = 'https://www.payments.service.gov.uk/card_details/:id';
const claimCheckAnswersController = Router();

function renderView(res: Response, form: GenericForm<StatementOfTruthForm> | GenericForm<QualifiedStatementOfTruth>, claim: Claim, userId: string, lang: string, isCarmEnabled = true) {

  const summarySections = getSummarySections(userId, claim, lang, isCarmEnabled);
  const signatureType = form.model?.type;
  let payment;
  if (claim.claimDetails?.helpWithFees?.option === YesNo.NO) {
    payment = 100;
  }
  res.render(checkAnswersViewPath, {
    form, summarySections, signatureType,
    payment,
    pageTitle: 'PAGES.CHECK_YOUR_ANSWER.TITLE',
  });
}

claimCheckAnswersController.get(CLAIM_CHECK_ANSWERS_URL,
  checkYourAnswersClaimGuard,isFirstTimeInPCQ,
  async (req: AppRequest, res: Response, next: NextFunction) => {
    try {
      const userId = req.session?.user?.id;
      const lang = req.query.lang ? req.query.lang : req.cookies.lang;
      const claim = await getCaseDataFromStore(userId);
      const form = new GenericForm(getStatementOfTruth(claim));
      const isCarmEnabled = await isCarmEnabledForCase(claim.draftClaimCreatedAt);
      renderView(res, form, claim, userId, lang, isCarmEnabled);
    } catch (error) {
      next(error);
    }
  });

claimCheckAnswersController.post(CLAIM_CHECK_ANSWERS_URL, async (req: Request | AppRequest, res: Response, next: NextFunction) => {
  let form;
  let claim;
  let userId;
  let lang;
  let isCarmEnabled;

  try {

    userId = (<AppRequest>req).session?.user?.id;
    const isFullAmountRejected = (req.body?.isFullAmountRejected === 'true');
    lang = req.query.lang ? req.query.lang : req.cookies.lang;
    claim = await getCaseDataFromStore(userId);
    isCarmEnabled = await isCarmEnabledForCase(claim.draftClaimCreatedAt);
    const acceptNotChangesAllowedValue =  (claim.claimDetails.helpWithFees.option === YesNo.YES) ? false : req.body.acceptNoChangesAllowed;

    form = new GenericForm((req.body.type === 'qualified')
      ? new QualifiedStatementOfTruthClaimIssue(isFullAmountRejected, req.body.signed, req.body.directionsQuestionnaireSigned, req.body.signerName, req.body.signerRole, acceptNotChangesAllowedValue)
      : new StatementOfTruthFormClaimIssue(isFullAmountRejected, req.body.type, req.body.signed, req.body.directionsQuestionnaireSigned, acceptNotChangesAllowedValue));

    await form.validate();
    if (form.hasErrors()) {
      renderView(res, form, claim, userId, lang, isCarmEnabled);
    } else {
      await saveStatementOfTruth(userId, form.model);
      const submittedClaim = await submitClaim(<AppRequest>req);
      res.clearCookie('eligibilityCompleted');
      res.clearCookie('eligibility');
      if (claim.claimDetails.helpWithFees.option === YesNo.NO) {
        //TODO Will be implemented after integration ready
        //const paymentUrlWithId = constructResponseUrlWithIdParams(userId, paymentUrl);
        //res.redirect(paymentUrlWithId);
        await deleteDraftClaimFromStore(userId);
        res.clearCookie('eligibilityCompleted');
        res.redirect(constructResponseUrlWithIdParams(submittedClaim.id, CLAIM_CONFIRMATION_URL));
      } else {
        await deleteDraftClaimFromStore(userId);
        res.redirect(constructResponseUrlWithIdParams(submittedClaim.id, CLAIM_CONFIRMATION_URL));
      }
    }
  } catch (error) {
    if (error.response.data.exception === 'uk.gov.hmcts.ccd.endpoint.exceptions.CaseValidationException') {

      const fieldErrorMessages: FormValidationError[] = error.response.data.details.field_errors
        .map((e:any) => new FormValidationError(new FormValidationError({
          constraints: {
            isInvalid : e.message,
          },
          property: e.id,
        }), e.id));

      form.errors = fieldErrorMessages;
      renderView(res, form, claim, userId, lang, isCarmEnabled);

    } else {
      res.status(500).json({
        errors: [error.message],
      });
    }
  }
});

export default claimCheckAnswersController;
