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
import {deleteDraftClaimFromStore, generateRedisKey, getCaseDataFromStore } from 'modules/draft-store/draftStoreService';
import {StatementOfTruthForm} from 'form/models/statementOfTruth/statementOfTruthForm';
import {Claim} from 'models/claim';
import {constructResponseUrlWithIdParams} from 'common/utils/urlFormatter';
import {AppRequest} from 'models/AppRequest';
import {submitClaimantResponse} from 'services/features/claimantResponse/submitClaimantResponse';
import {YesNo} from 'common/form/models/yesNo';

const checkAnswersViewPath = 'features/claimantResponse/check-answers';
const claimantResponseCheckAnswersController = Router();

function renderView(req: Request, res: Response, form: GenericForm<StatementOfTruthForm>, claim: Claim) {
  const lang = req.query.lang ? req.query.lang : req.cookies.lang;
  const summarySections = getSummarySections(req.params.id, claim, lang);

  res.render(checkAnswersViewPath, {
    form,
    summarySections,
  });
}

claimantResponseCheckAnswersController.get(CLAIMANT_RESPONSE_CHECK_ANSWERS_URL,
  (async (req: Request, res: Response, next: NextFunction) => {
    try {
      const claim = await getCaseDataFromStore(generateRedisKey(req as unknown as AppRequest));
      const isClaimantRejectedDefendantOffer = claim?.claimantResponse?.hasPartAdmittedBeenAccepted?.option === YesNo.NO;
      const form = new GenericForm(new StatementOfTruthForm(isClaimantRejectedDefendantOffer));
      renderView(req, res, form, claim);
    } catch (error) {
      next(error);
    }
  }) as RequestHandler);

claimantResponseCheckAnswersController.post(CLAIMANT_RESPONSE_CHECK_ANSWERS_URL, (async (req: Request, res: Response, next: NextFunction) => {
  try {
    const isClaimantRejectedDefendantOffer = req.body.isClaimantRejectedDefendantOffer === 'true';
    const form = new GenericForm(new StatementOfTruthForm(isClaimantRejectedDefendantOffer, req.body.type, true, req.body.directionsQuestionnaireSigned));
    const userId = req.params.id;
    await form.validate();
    if (form.hasErrors()) {
      const claim = await getCaseDataFromStore(generateRedisKey(req as unknown as AppRequest));
      renderView(req, res, form, claim);
    } else {
      await saveStatementOfTruth(generateRedisKey(req as unknown as AppRequest), form.model);
      await submitClaimantResponse(<AppRequest>req);
      await deleteDraftClaimFromStore(generateRedisKey(req as unknown as AppRequest));
      res.redirect(constructResponseUrlWithIdParams(userId, CLAIMANT_RESPONSE_CONFIRMATION_URL));
    }
  } catch (error) {
    next(error);
  }
}) as RequestHandler);

export default claimantResponseCheckAnswersController;
