import {NextFunction, Request, Response, Router} from 'express';
import {CCJ_CHECK_AND_SEND_URL, CCJ_CONFIRMATION_URL} from 'routes/urls';
import {getCaseDataFromStore} from 'modules/draft-store/draftStoreService';
import {Claim} from 'models/claim';
import {AppRequest} from 'models/AppRequest';
import {GenericForm} from 'form/models/genericForm';
import {StatementOfTruthForm} from 'form/models/statementOfTruth/statementOfTruthForm';
import {QualifiedStatementOfTruth} from 'form/models/statementOfTruth/qualifiedStatementOfTruth';
import {
  getStatementOfTruth,
  getSummarySections,
  saveStatementOfTruth,
} from 'services/features/claimantResponse/ccj/ccjCheckAnswersService';
import {constructResponseUrlWithIdParams} from 'common/utils/urlFormatter';

const checkAnswersViewPath = 'features/claimantResponse/ccj/check-answers';
const ccjCheckAnswersController = Router();

function renderView(req: Request, res: Response, form: GenericForm<StatementOfTruthForm> | GenericForm<QualifiedStatementOfTruth>, claim: Claim) {
  const lang = req.query.lang ? req.query.lang : req.cookies.lang;
  const summarySections = getSummarySections(req.params.id, claim, lang);
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
      const claim = await getCaseDataFromStore(req.params?.id);
      const form = new GenericForm(getStatementOfTruth(claim));
      renderView(req, res, form, claim);
    } catch (error) {
      next(error);
    }
  });

ccjCheckAnswersController.post(CCJ_CHECK_AND_SEND_URL, async (req: AppRequest | Request, res: Response, next: NextFunction) => {
  try {
    const isFullAmountRejected = (req.body?.isFullAmountRejected === 'true');
    const claimId = req.params.id;
    const form = new GenericForm((req.body.type === 'qualified')
      ? new QualifiedStatementOfTruth(isFullAmountRejected, req.body.signed, req.body.directionsQuestionnaireSigned, req.body.signerName, req.body.signerRole)
      : new StatementOfTruthForm(isFullAmountRejected, req.body.type, req.body.signed, req.body.directionsQuestionnaireSigned));
    await form.validate();
    if (form.hasErrors()) {
      const claim = await getCaseDataFromStore(claimId);
      renderView(req, res, form, claim);
    } else {
      await saveStatementOfTruth(claimId, form.model);
      // TODO implement submit ccj claimant response and delete from draftstore;
      res.redirect(constructResponseUrlWithIdParams(claimId, CCJ_CONFIRMATION_URL));
    }
  } catch (error) {
    next(error);
  }
});

export default ccjCheckAnswersController;

