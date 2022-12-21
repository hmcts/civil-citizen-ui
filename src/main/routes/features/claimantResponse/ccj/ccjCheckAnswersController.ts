import {NextFunction, Request, Response, Router} from 'express';
import {CCJ_CHECK_AND_SEND_URL, CCJ_CLAIM_CONFIRMATION_URL} from '../../../urls';
import {getCaseDataFromStore} from '../../../../modules/draft-store/draftStoreService';
import {Claim} from '../../../../common/models/claim';
import {AppRequest} from '../../../../common/models/AppRequest';
import {submitResponse} from '../../../../services/features/response/submission/submitResponse';
import {GenericForm} from 'form/models/genericForm';
import {StatementOfTruthForm} from 'form/models/statementOfTruth/statementOfTruthForm';
import {QualifiedStatementOfTruth} from 'form/models/statementOfTruth/qualifiedStatementOfTruth';
import {
  getStatementOfTruth,
  getSummarySections,
  saveStatementOfTruth,
} from 'services/features/claimantResponse/ccj/ccjCheckAnswersService';

const checkAnswersViewPath = 'features/claimantResponse/ccj/check-answers';
const ccjCheckAnswersController = Router();

function renderView(req: Request, res: Response, form: GenericForm<StatementOfTruthForm> | GenericForm<QualifiedStatementOfTruth>, claim: Claim, userId: string) {
  const lang = req.query.lang ? req.query.lang : req.cookies.lang;
  const summarySections = getSummarySections(userId, claim, lang);
  const signatureType = form.model?.type;
  res.render(checkAnswersViewPath, {
    form,
    summarySections,
    signatureType,
  });
}

ccjCheckAnswersController.get(CCJ_CHECK_AND_SEND_URL,
  async (req: AppRequest, res: Response, next: NextFunction) => {
    try {
      const userId = req.session?.user?.id;
      const claim = await getCaseDataFromStore(req.params.id);
      const form = new GenericForm(getStatementOfTruth(claim));
      renderView(req, res, form, claim, userId);
    } catch (error) {
      next(error);
    }
  });

ccjCheckAnswersController.post(CCJ_CHECK_AND_SEND_URL, async (req: AppRequest | Request, res: Response, next: NextFunction) => {
  try {
    await submitResponse(<AppRequest>req);
    const userId = (<AppRequest>req).session?.user?.id;

    const form = new GenericForm((req.body.type === 'qualified')
      ? new QualifiedStatementOfTruth(req.body.signed, req.body.directionsQuestionnaireSigned, req.body.signerName, req.body.signerRole)
      : new StatementOfTruthForm(req.body.type, req.body.signed, req.body.directionsQuestionnaireSigned));
    const claim = await getCaseDataFromStore(userId);
    await form.validate();
    if (form.hasErrors()) {
      renderView(req, res, form, claim, userId);
    } else {
      await saveStatementOfTruth(userId, form.model);
      res.redirect(CCJ_CLAIM_CONFIRMATION_URL);
    }
  } catch (error) {
    next(error);
  }
});

export default ccjCheckAnswersController;

