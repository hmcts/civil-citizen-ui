import {NextFunction, Request, Response, Router} from 'express';
import {CLAIM_CHECK_ANSWERS_URL, CLAIM_CONFIRMATION_URL} from '../../urls';
import {
  getStatementOfTruth,
  getSummarySections,
  saveStatementOfTruth,
} from 'services/features/claim/checkAnswers/checkAnswersService';
import {deleteDraftClaimFromStore, getCaseDataFromStore} from 'modules/draft-store/draftStoreService';
import {Claim} from 'common/models/claim';
import {constructResponseUrlWithIdParams} from 'common/utils/urlFormatter';
import {AppRequest} from 'common/models/AppRequest';
import {submitClaim} from 'services/features/claim/submission/submitClaim';
import {GenericForm} from 'common/form/models/genericForm';
import {StatementOfTruthForm} from 'common/form/models/statementOfTruth/statementOfTruthForm';
import {QualifiedStatementOfTruth} from 'common/form/models/statementOfTruth/qualifiedStatementOfTruth';
import {YesNo} from 'common/form/models/yesNo';
import {StatementOfTruthFormClaimIssue} from 'form/models/statementOfTruth/statementOfTruthFormClaimIssue';
import {QualifiedStatementOfTruthClaimIssue} from 'form/models/statementOfTruth/qualifiedStatementOfTruthClaimIssue';

const checkAnswersViewPath = 'features/claim/check-answers';
const claimCheckAnswersController = Router();

function renderView(res: Response, form: GenericForm<StatementOfTruthForm> | GenericForm<QualifiedStatementOfTruth>, claim: Claim, userId: string, lang: string) {
  const summarySections = getSummarySections(userId, claim, lang);
  const signatureType = form.model?.type;
  let payment;
  if (claim.claimDetails?.helpWithFees?.option === YesNo.NO) {
    payment = 100;
  }
  res.render(checkAnswersViewPath, {
    form, summarySections, signatureType,
    payment,
  });
}

claimCheckAnswersController.get(CLAIM_CHECK_ANSWERS_URL,
  // AllResponseTasksCompletedGuard.apply(CLAIM_INCOMPLETE_SUBMISSION_URL), TODO implement guard
  async (req: AppRequest, res: Response, next: NextFunction) => {
    try {
      const userId = req.session?.user?.id;
      const lang = req.query.lang ? req.query.lang : req.cookies.lang;
      const claim = await getCaseDataFromStore(userId);
      const form = new GenericForm(getStatementOfTruth(claim));
      renderView(res, form, claim, userId, lang);
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
    if (claim.claimDetails.helpWithFees.option === YesNo.YES){
      req.body.immutable = false;
    }
    const form = new GenericForm((req.body.type === 'qualified')
      ? new QualifiedStatementOfTruthClaimIssue(isFullAmountRejected, req.body.signed, req.body.directionsQuestionnaireSigned, req.body.signerName, req.body.signerRole, req.body.immutable)
      : new StatementOfTruthFormClaimIssue(isFullAmountRejected, req.body.type, req.body.signed, req.body.directionsQuestionnaireSigned, req.body.immutable));

    await form.validate();
    if (form.hasErrors()) {
      renderView(res, form, claim, userId, lang);
    } else {
      await saveStatementOfTruth(userId, form.model);
      const submittedClaim = await submitClaim(<AppRequest>req);
      await deleteDraftClaimFromStore(userId);
      res.redirect(constructResponseUrlWithIdParams(submittedClaim.id, CLAIM_CONFIRMATION_URL));
    }
  } catch (error) {
    next(error);
  }
});

export default claimCheckAnswersController;
