import {NextFunction, Router, Response, Request, RequestHandler} from 'express';
import {
  MEDIATION_ALTERNATIVE_EMAIL_URL,
  MEDIATION_EMAIL_CONFIRMATION_URL, MEDIATION_NEXT_3_MONTHS_URL,
} from '../../urls';
import {GenericForm} from 'form/models/genericForm';
import {GenericYesNo} from 'form/models/genericYesNo';
import {getMediation, saveMediation} from 'services/features/response/mediation/mediationService';
import {generateRedisKey, getCaseDataFromStore} from 'modules/draft-store/draftStoreService';
import {AppRequest} from 'common/models/AppRequest';
import {t} from 'i18next';
import {YesNo} from 'form/models/yesNo';
import {constructResponseUrlWithIdParams} from 'common/utils/urlFormatter';

const emailMediationConfirmationViewPath = 'features/common/yes-no-common-page';
const emailMediationConfirmationController = Router();
const MEDIATION_EMAIL_CONFIRMATION_PAGE = 'PAGES.MEDIATION_EMAIL_CONFIRMATION.';

const renderView = (form: GenericForm<GenericYesNo>, res: Response, req: Request, defendantEmail: string): void => {
  const lang = req.query.lang ? req.query.lang : req.cookies.lang;
  const pageTitle = `${MEDIATION_EMAIL_CONFIRMATION_PAGE}PAGE_TITLE`;
  const pageText = t(`${MEDIATION_EMAIL_CONFIRMATION_PAGE}PAGE_TEXT`, { lng: lang, defendantEmail: defendantEmail });
  res.render(emailMediationConfirmationViewPath, { form, pageTitle, pageText });
};

const getPartyEmail = async (redisKey: string, isClaimantResponse: boolean): Promise<string> => {
  const claim = await getCaseDataFromStore(redisKey);
  if (isClaimantResponse) {
    return claim.applicant1.emailAddress.emailAddress;
  }
  return claim.respondent1.emailAddress.emailAddress;
};

emailMediationConfirmationController.get(MEDIATION_EMAIL_CONFIRMATION_URL, (async (req, res, next: NextFunction) => {
  try {
    const redisKey = generateRedisKey(<AppRequest>req);
    const claim = await getCaseDataFromStore(redisKey);
    const isClaimantResponse = claim.isClaimantIntentionPending();
    const partyEmail = await getPartyEmail(redisKey, isClaimantResponse);
    const mediation = await getMediation(redisKey);
    const form = new GenericForm(new GenericYesNo(mediation.isMediationEmailCorrect?.option));
    renderView(form, res,req, partyEmail);
  } catch (error) {
    next(error);
  }
}) as RequestHandler);

emailMediationConfirmationController.post(MEDIATION_EMAIL_CONFIRMATION_URL, (async (req, res, next: NextFunction) => {
  try {
    const redisKey = generateRedisKey(<AppRequest>req);
    const claimId = req.params.id;
    const claim = await getCaseDataFromStore(redisKey);
    const isClaimantResponse = claim.isClaimantIntentionPending();
    const form = new GenericForm(new GenericYesNo(req.body.option));
    await form.validate();
    if (form.hasErrors()) {
      const partyEmail = await getPartyEmail(redisKey, isClaimantResponse);
      renderView(form, res, req, partyEmail);
    } else {
      await saveMediation(redisKey, form.model, 'isMediationEmailCorrect');
      (req.body.option === YesNo.NO) ? res.redirect(constructResponseUrlWithIdParams(claimId, MEDIATION_ALTERNATIVE_EMAIL_URL))
        : res.redirect(constructResponseUrlWithIdParams(claimId, MEDIATION_NEXT_3_MONTHS_URL));
    }
  } catch (error) {
    next(error);
  }

}) as RequestHandler);

export default emailMediationConfirmationController;
