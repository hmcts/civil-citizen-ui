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
import {YesNo} from 'common/form/models/yesNo';
import {checkYourAnswersClaimGuard} from 'routes/guards/checkYourAnswersGuard';
import {StatementOfTruthFormClaimIssue} from 'form/models/statementOfTruth/statementOfTruthFormClaimIssue';
import {QualifiedStatementOfTruthClaimIssue} from 'form/models/statementOfTruth/qualifiedStatementOfTruthClaimIssue';
import {isFirstTimeInPCQ} from 'routes/guards/pcqGuardClaim';
import {isCarmEnabledForCase} from '../../../app/auth/launchdarkly/launchDarklyClient';
import {ValidationError, Validator} from 'class-validator';
import {EmailValidationWithMessage} from 'form/models/EmailValidationWithMessage';
import {PhoneValidationWithMessage} from 'form/models/PhoneValidationWithMessage';
import config from 'config';
import {CivilServiceClient} from 'client/civilServiceClient';
import {saveClaimFee} from 'services/features/claim/amount/claimFeesService';
import {calculateInterestToDate} from 'common/utils/interestUtils';
const validator = new Validator();

const civilServiceApiBaseUrl = config.get<string>('services.civilService.url');
const civilServiceClient: CivilServiceClient = new CivilServiceClient(civilServiceApiBaseUrl);
const checkAnswersViewPath = 'features/claim/check-answers';
//const paymentUrl = 'https://www.payments.service.gov.uk/card_details/:id';
const claimCheckAnswersController = Router();

function renderView(res: Response, form: GenericForm<any>, claim: Claim, userId: string, lang: string, isCarmEnabled = true) {

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
  try {

    const userId = (<AppRequest>req).session?.user?.id;
    const isFullAmountRejected = (req.body?.isFullAmountRejected === 'true');
    const lang = req.query.lang ? req.query.lang : req.cookies.lang;
    const claim = await getCaseDataFromStore(userId);
    const isCarmEnabled = await isCarmEnabledForCase(claim.draftClaimCreatedAt);
    const acceptNotChangesAllowedValue =  (claim.claimDetails.helpWithFees.option === YesNo.YES) ? false : req.body.acceptNoChangesAllowed;

    const form = new GenericForm((req.body.type === 'qualified')
      ? new QualifiedStatementOfTruthClaimIssue(isFullAmountRejected, req.body.signed, req.body.directionsQuestionnaireSigned, req.body.signerName, req.body.signerRole, acceptNotChangesAllowedValue)
      : new StatementOfTruthFormClaimIssue(isFullAmountRejected, req.body.type, req.body.signed, req.body.directionsQuestionnaireSigned, acceptNotChangesAllowedValue));

    await form.validate();

    if (claim.applicant1?.emailAddress?.emailAddress) {
      form.errors = validateFields(new GenericForm(new EmailValidationWithMessage(claim.applicant1.emailAddress.emailAddress, 'ERRORS.ENTER_VALID_EMAIL_CLAIMANT')), form.errors);
    }
    if (claim.respondent1?.emailAddress?.emailAddress) {
      form.errors = validateFields(new GenericForm(new EmailValidationWithMessage(claim.respondent1.emailAddress.emailAddress, 'ERRORS.ENTER_VALID_EMAIL_DEFENDANT')), form.errors);
    }
    // fixing CIV-17259
    if (claim.applicant1?.partyPhone === undefined) {
      form.errors = validateFields(new GenericForm(new PhoneValidationWithMessage('invalid phone', 'ERRORS.ENTER_VALID_PHONE_CLAIMANT')), form.errors);
    }

    if (claim.respondent1?.partyPhone?.phone) {
      form.errors = validateFields(new GenericForm(new PhoneValidationWithMessage(claim.respondent1.partyPhone.phone, 'ERRORS.ENTER_VALID_CONTACT_DEFENDANT')), form.errors);
    }
    const interestToDate = await calculateInterestToDate(claim);
    const claimFeeData = await civilServiceClient.getClaimFeeData(claim.totalClaimAmount + interestToDate, req as AppRequest);
    await saveClaimFee(userId, claimFeeData);
    if (form.hasErrors() ) {
      renderView(res, form, claim, userId, lang, isCarmEnabled);
      return;
    } else {
      await saveStatementOfTruth(userId, form.model);
      const submittedClaim = await submitClaim(<AppRequest>req);
      res.clearCookie('eligibilityCompleted');
      res.clearCookie('eligibility');
      if (claim.claimDetails.helpWithFees.option === YesNo.NO) {
        //TODO Will be implemented after integration ready
        //const paymentUrlWithId = constructResponseUrlWithIdParams(userId, paymentUrl);
        //res.redirect(paymentUrlWithId);
        res.clearCookie('eligibilityCompleted');
      }
      await deleteDraftClaimFromStore(userId);
      res.redirect(constructResponseUrlWithIdParams(submittedClaim.id, CLAIM_CONFIRMATION_URL));
    }
  } catch (error) {
    next(error);
    return;
  }
});

export default claimCheckAnswersController;

const validateFields = (genericForm: GenericForm<any>, formErrors: ValidationError[]): ValidationError[] => {
  return [...formErrors, ...validator.validateSync(genericForm.model)];
};
