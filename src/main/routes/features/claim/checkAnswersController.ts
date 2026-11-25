import {NextFunction, Response, Router} from 'express';
import {CLAIM_CHECK_ANSWERS_URL, CLAIM_CONFIRMATION_URL} from '../../urls';
import {
  getStatementOfTruth,
  getSummarySections,
  saveStatementOfTruth,
} from 'services/features/claim/checkAnswers/checkAnswersService';
import {deleteDraftClaim, getDraftClaim, updateDraftClaim} from 'modules/draft-store/draftStoreManagerService';
import {getStashedClaimOrFromStore} from 'common/utils/claimRequestLocals';
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
import {isCarmEnabledForCase, isDraftClaimDatabaseEnabled} from '../../../app/auth/launchdarkly/launchDarklyClient';
import {ValidationError, Validator} from 'class-validator';
import {EmailValidationWithMessage} from 'form/models/EmailValidationWithMessage';
import {PhoneValidationWithMessage} from 'form/models/PhoneValidationWithMessage';
import config from 'config';
import {CivilServiceClient} from 'client/civilServiceClient';
import {saveClaimFee} from 'services/features/claim/amount/claimFeesService';
import {calculateInterestToDate} from 'common/utils/interestUtils';
import {clearRedisWorkingDraftForPayment} from 'routes/features/claim/payment/claimIssuePaymentDraftService';

const {Logger} = require('@hmcts/nodejs-logging');
const logger = Logger.getLogger('claimCheckAnswersController');
const validator = new Validator();

const civilServiceApiBaseUrl = config.get<string>('services.civilService.url');
const civilServiceClient: CivilServiceClient = new CivilServiceClient(civilServiceApiBaseUrl);
const checkAnswersViewPath = 'features/claim/check-answers';
//const paymentUrl = 'https://www.payments.service.gov.uk/card_details/:id';
const claimCheckAnswersController = Router();

function renderView(res: Response, form: GenericForm<object>, claim: Claim, userId: string, lang: string, isCarmEnabled = true) {

  const summarySections = getSummarySections(userId, claim, lang, isCarmEnabled);
  const formModel = form.model as {type?: string};
  const signatureType = formModel?.type;
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
      const claim = await getStashedClaimOrFromStore(req, userId);
      const form = new GenericForm(getStatementOfTruth(claim));
      const isCarmEnabled = await isCarmEnabledForCase(claim.draftClaimCreatedAt);
      renderView(res, form, claim, userId, lang, isCarmEnabled);
    } catch (error) {
      next(error);
    }
  });

claimCheckAnswersController.post(CLAIM_CHECK_ANSWERS_URL, checkYourAnswersClaimGuard, async (req: AppRequest, res: Response, next: NextFunction) => {
  try {

    const userId = (<AppRequest>req).session?.user?.id;
    const isFullAmountRejected = (req.body?.isFullAmountRejected === 'true');
    const lang = req.query.lang ? req.query.lang : req.cookies.lang;
    const draftResult = await getDraftClaim(req);
    if (!draftResult) {
      throw new Error('[checkAnswersController] no draft claim found');
    }
    const claim = Object.assign(new Claim(), draftResult.claimResponse?.case_data as unknown as Claim);
    if (draftResult.createdAt && !claim.draftClaimCreatedAt) {
      claim.draftClaimCreatedAt = new Date(draftResult.createdAt);
    }
    const isCarmEnabled = await isCarmEnabledForCase(claim.draftClaimCreatedAt);
    const form = buildClaimIssueStatementForm(claim, req.body, isFullAmountRejected);

    await form.validate();
    appendContactFieldErrors(claim, form);
    const interestToDate = await calculateInterestToDate(claim, req);
    const claimFeeData = await civilServiceClient.getClaimFeeData(claim.totalClaimAmount + interestToDate, req as AppRequest);
    await saveClaimFee(req as AppRequest, claimFeeData);
    if (form.hasErrors() ) {
      renderView(res, form, claim, userId, lang, isCarmEnabled);
      return;
    }
    await saveStatementOfTruth(req, form.model);
    const appReq = req as AppRequest;
    const submittedClaim = await submitClaim(appReq);
    await persistDraftAfterSubmit(appReq, claim, submittedClaim, appReq.session?.draftId || draftResult.rawResponse?.draftId);

    res.clearCookie('eligibilityCompleted');
    res.clearCookie('eligibility');
    if (claim.claimDetails?.helpWithFees?.option === YesNo.NO) {
      //TODO Will be implemented after integration ready
      //const paymentUrlWithId = constructResponseUrlWithIdParams(userId, paymentUrl);
      //res.redirect(paymentUrlWithId);
      res.clearCookie('eligibilityCompleted');
    }
    res.redirect(constructResponseUrlWithIdParams(submittedClaim.id, CLAIM_CONFIRMATION_URL));
  } catch (error) {
    next(error);
    return;
  }
});

export default claimCheckAnswersController;

const buildClaimIssueStatementForm = (
  claim: Claim,
  body: AppRequest['body'],
  isFullAmountRejected: boolean,
): GenericForm<QualifiedStatementOfTruthClaimIssue | StatementOfTruthFormClaimIssue> => {
  const acceptNotChangesAllowedValue = claim.claimDetails?.helpWithFees?.option === YesNo.YES ? false : body.acceptNoChangesAllowed;
  if (body.type === 'qualified') {
    return new GenericForm(new QualifiedStatementOfTruthClaimIssue(
      isFullAmountRejected, body.signed, body.directionsQuestionnaireSigned, body.signerName, body.signerRole, acceptNotChangesAllowedValue,
    ));
  }
  return new GenericForm(new StatementOfTruthFormClaimIssue(
    isFullAmountRejected, body.type, body.signed, body.directionsQuestionnaireSigned, acceptNotChangesAllowedValue,
  ));
};

const appendContactFieldErrors = (claim: Claim, form: GenericForm<object>): void => {
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
};

const storeSubmittedDraftInDatabase = async (
  req: AppRequest,
  submittedClaim: Claim,
  draftId: string,
): Promise<void> => {
  const latestDraft = await getDraftClaim(req);
  if (!latestDraft?.claimResponse?.case_data) {
    return;
  }
  const claimToStore = Object.assign(new Claim(), latestDraft.claimResponse?.case_data as unknown as Claim);
  claimToStore.id = submittedClaim.id;
  if (submittedClaim.legacyCaseReference) {
    claimToStore.legacyCaseReference = submittedClaim.legacyCaseReference;
  }
  const clearedRedisWorkingDraft = await clearRedisWorkingDraftForPayment(req, claimToStore);
  if (!clearedRedisWorkingDraft) {
    await updateDraftClaim(req, claimToStore, draftId);
  }
};

const persistDraftAfterSubmit = async (
  req: AppRequest,
  claim: Claim,
  submittedClaim: Claim,
  draftId?: string,
): Promise<void> => {
  if (!draftId) {
    return;
  }
  try {
    const helpWithFees = claim.claimDetails?.helpWithFees?.option === YesNo.YES;
    if (await isDraftClaimDatabaseEnabled() && !helpWithFees) {
      await storeSubmittedDraftInDatabase(req, submittedClaim, draftId);
    } else {
      await deleteDraftClaim(req, draftId);
    }
  } catch (postSubmitDraftError) {
    logger.error(
      `[checkAnswersController] post-submit draft work failed after CCD accept for case ${submittedClaim.id}`,
      postSubmitDraftError,
    );
  }
  // The submitted draft is no longer the working draft; payment loads it by case id
  delete req.session.draftId;
};

const validateFields = (genericForm: GenericForm<object>, formErrors: ValidationError[]): ValidationError[] => {
  return [...formErrors, ...validator.validateSync(genericForm.model as object)];
};
