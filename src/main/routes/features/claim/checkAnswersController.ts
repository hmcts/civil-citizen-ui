import {NextFunction, Request, Response, Router} from 'express';
import {CLAIM_CHECK_ANSWERS_URL, CLAIM_CONFIRMATION_URL} from '../../urls';
import {
  getStatementOfTruth,
  getSummarySections,
  saveStatementOfTruth,
} from '../../../services/features/claim/checkAnswers/checkAnswersService';
import {getCaseDataFromStore} from '../../../modules/draft-store/draftStoreService';
import {Claim} from '../../../common/models/claim';
import {constructResponseUrlWithIdParams} from '../../../common/utils/urlFormatter';
import {AppRequest} from '../../../common/models/AppRequest';
import {isFullAmountReject} from '../../../modules/claimDetailsService';
import {GenericForm} from '../../../common/form/models/genericForm';
import {StatementOfTruthForm} from '../../../common/form/models/statementOfTruth/statementOfTruthForm';
import {QualifiedStatementOfTruth} from '../../../common/form/models/statementOfTruth/qualifiedStatementOfTruth';
import {YesNo} from '../../../common/form/models/yesNo';

const checkAnswersViewPath = 'features/claim/check-answers';
const claimCheckAnswersController = Router();
const paymentUrl = 'https://www.payments.service.gov.uk/card_details/:id';

function renderView(res: Response, form: GenericForm<StatementOfTruthForm> | GenericForm<QualifiedStatementOfTruth>, claim: Claim, userId: string, lang: string) {
  const summarySections = getSummarySections(userId, claim, lang);
  const signatureType = form.model?.type;
  const isFullAmountRejected = isFullAmountReject(claim);
  let payment;
  if (claim.claimDetails.helpWithFees.option === YesNo.NO) {
    payment = 100;
  }
  res.render(checkAnswersViewPath, {
    form, summarySections, signatureType,
    isFullAmountRejected, payment,
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

claimCheckAnswersController.post(CLAIM_CHECK_ANSWERS_URL, async (req: AppRequest | Request, res: Response, next: NextFunction) => {
  try {
    const userId = (<AppRequest>req).session?.user?.id;
    const isFullAmountRejected = (req.body?.isFullAmountRejected === 'true');
    const lang = req.query.lang ? req.query.lang : req.cookies.lang;
    const form = new GenericForm((req.body.type === 'qualified')
      ? new QualifiedStatementOfTruth(isFullAmountRejected, req.body.signed, req.body.directionsQuestionnaireSigned, req.body.signerName, req.body.signerRole)
      : new StatementOfTruthForm(isFullAmountRejected, req.body.type, req.body.signed, req.body.directionsQuestionnaireSigned));
    const claim = await getCaseDataFromStore(userId);
    await form.validate();
    if (form.hasErrors()) {
      renderView(res, form, claim, userId, lang);
    } else {
      await saveStatementOfTruth(userId, form.model);
      if (claim.claimDetails.helpWithFees.option === YesNo.NO) {
        res.redirect(constructResponseUrlWithIdParams(userId, paymentUrl));
      } else {
        res.redirect(CLAIM_CONFIRMATION_URL);
      }
    }
  } catch (error) {
    next(error);
  }
});

export default claimCheckAnswersController;

