import {NextFunction, Request, Response, Router} from 'express';
import {CCJ_CHECK_AND_SEND_URL, CCJ_CONFIRMATION_URL} from 'routes/urls';
import { deleteDraftClaimFromStore, generateRedisKey, getCaseDataFromStore } from 'modules/draft-store/draftStoreService';
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
import {submitClaimantResponse} from 'services/features/claimantResponse/submission/submitClaimantResponse';

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
      const claim = await getCaseDataFromStore(generateRedisKey(req as unknown as AppRequest));
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
    const redisKey = generateRedisKey(req as unknown as AppRequest);
    const form = new GenericForm((req.body.type === 'qualified')
      ? new QualifiedStatementOfTruth(isFullAmountRejected, req.body.signed, req.body.directionsQuestionnaireSigned, req.body.signerName, req.body.signerRole)
      : new StatementOfTruthForm(isFullAmountRejected, req.body.type, req.body.signed, req.body.directionsQuestionnaireSigned));
    await form.validate();
    if (form.hasErrors()) {
      const claim = await getCaseDataFromStore(redisKey);
      renderView(req, res, form, claim);
    } else {
      await saveStatementOfTruth(redisKey, form.model);
      await submitClaimantResponse(<AppRequest>req);
      await deleteDraftClaimFromStore(redisKey);
      res.redirect(constructResponseUrlWithIdParams(claimId, CCJ_CONFIRMATION_URL));
    }
  } catch (error) {
    next(error);
  }
});

export default ccjCheckAnswersController;

