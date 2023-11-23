import config from 'config';
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
import {generateRedisKey, getCaseDataFromStore} from 'modules/draft-store/draftStoreService';
import {StatementOfTruthForm} from 'form/models/statementOfTruth/statementOfTruthForm';
import {Claim} from 'models/claim';
import {constructResponseUrlWithIdParams} from 'common/utils/urlFormatter';
import {AppRequest} from 'models/AppRequest';
import {submitClaimantResponse} from 'services/features/claimantResponse/submitClaimantResponse';
import {YesNo} from 'common/form/models/yesNo';
import {CivilServiceClient} from 'client/civilServiceClient';

const checkAnswersViewPath = 'features/claimantResponse/check-answers';
const claimantResponseCheckAnswersController = Router();
const civilServiceApiBaseUrl = config.get<string>('services.civilService.url');
const civilServiceClient: CivilServiceClient = new CivilServiceClient(civilServiceApiBaseUrl);

async function renderView(req: AppRequest, res: Response, form: GenericForm<StatementOfTruthForm>, claim: Claim) {
  const lang = req.query.lang ? req.query.lang : req.cookies.lang;
  const claimFee = await civilServiceClient.getClaimAmountFee(claim?.totalClaimAmount, req);
  const summarySections = getSummarySections(req.params.id, claim, lang, claimFee);

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
      await renderView(<AppRequest>req, res, form, claim);
    } catch (error) {
      next(error);
    }
  }) as RequestHandler);

claimantResponseCheckAnswersController.post(CLAIMANT_RESPONSE_CHECK_ANSWERS_URL, (async (req: Request, res: Response, next: NextFunction) => {
  try {
    const isClaimantRejectedDefendantOffer = req.body.isClaimantRejectedDefendantOffer === 'true';
    const form = new GenericForm(new StatementOfTruthForm(isClaimantRejectedDefendantOffer, req.body.type, true, req.body.directionsQuestionnaireSigned));
    await form.validate();
    if (form.hasErrors()) {
      const claim = await getCaseDataFromStore(req.params.id);
      await renderView(<AppRequest>req, res, form, claim);
    } else {
      const redisKey = generateRedisKey(req as unknown as AppRequest);
      await saveStatementOfTruth(redisKey, form.model);
      await submitClaimantResponse(<AppRequest>req);
      res.redirect(constructResponseUrlWithIdParams(req.params.id, CLAIMANT_RESPONSE_CONFIRMATION_URL));
    }
  } catch (error) {
    next(error);
  }
}) as RequestHandler);

export default claimantResponseCheckAnswersController;
