import {NextFunction, Router, Response, Request, RequestHandler} from 'express';
import {
  MEDIATION_ALTERNATIVE_PHONE_URL,
  MEDIATION_EMAIL_CONFIRMATION_URL, MEDIATION_PHONE_CONFIRMATION_URL,
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
const MEDIATION_EMAIL_CONFIRMATION_PAGE = 'PAGES.MEDIATION_PHONE_CONFIRMATION.';

const renderView = (form: GenericForm<GenericYesNo>, res: Response, req: Request, defendantPhone: string): void => {
  const lang = req.query.lang ? req.query.lang : req.cookies.lang;
  const pageTitle = `${MEDIATION_EMAIL_CONFIRMATION_PAGE}PAGE_TITLE`;
  const pageText = t(`${MEDIATION_EMAIL_CONFIRMATION_PAGE}PAGE_TEXT`, {lng: lang, defendantPhone: defendantPhone});
  res.render(emailMediationConfirmationViewPath, {form, pageTitle, pageText});
};

const getPartyPhone = async (redisKey: string, isClaimantResponse: boolean): Promise<string> => {
  const claim = await getCaseDataFromStore(redisKey);
  if (isClaimantResponse) {
    return claim.applicant1.partyPhone.phone;
  }
  return claim.respondent1.partyPhone.phone;
};

emailMediationConfirmationController.get(MEDIATION_PHONE_CONFIRMATION_URL, (async (req, res, next: NextFunction) => {
  try {
    const redisKey = generateRedisKey(<AppRequest>req);
    const claim = await getCaseDataFromStore(redisKey);
    const isClaimantResponse = claim.isClaimantIntentionPending();
    const partyPhone = await getPartyPhone(redisKey, isClaimantResponse);
    const mediation = await getMediation(redisKey);
    const form = new GenericForm(new GenericYesNo(mediation.isMediationPhoneCorrect?.option));
    renderView(form, res, req, partyPhone);
  } catch (error) {
    next(error);
  }
}) as RequestHandler);

emailMediationConfirmationController.post(MEDIATION_PHONE_CONFIRMATION_URL, (async (req, res, next: NextFunction) => {
  try {
    const redisKey = generateRedisKey(<AppRequest>req);
    const claimId = req.params.id;
    const claim = await getCaseDataFromStore(redisKey);
    const isClaimantResponse = claim.isClaimantIntentionPending();
    const form = new GenericForm(new GenericYesNo(req.body.option));
    await form.validate();
    if (form.hasErrors()) {
      const partyPhone = await getPartyPhone(redisKey, isClaimantResponse);
      renderView(form, res, req, partyPhone);
    } else {
      await saveMediation(redisKey, form.model, 'isMediationPhoneCorrect');
      (req.body.option === YesNo.NO) ? res.redirect(constructResponseUrlWithIdParams(claimId, MEDIATION_ALTERNATIVE_PHONE_URL))
        : res.redirect(constructResponseUrlWithIdParams(claimId, MEDIATION_EMAIL_CONFIRMATION_URL));
    }
  } catch (error) {
    next(error);
  }
}) as RequestHandler);

export default emailMediationConfirmationController;
