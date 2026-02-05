import {NextFunction, Router, Response, Request, RequestHandler} from 'express';
import {
  MEDIATION_ALTERNATIVE_EMAIL_URL,
  MEDIATION_EMAIL_CONFIRMATION_URL, MEDIATION_NEXT_3_MONTHS_URL,
} from '../../urls';
import {GenericForm} from 'form/models/genericForm';
import {
  getMediationCarm,
  saveMediationCarm,
} from 'services/features/response/mediation/mediationService';
import {generateRedisKey, getCaseDataFromStore, getDraftClaimFromStore} from 'modules/draft-store/draftStoreService';
import {AppRequest} from 'common/models/AppRequest';
import {t} from 'i18next';
import {YesNo} from 'form/models/yesNo';
import {constructResponseUrlWithIdParams} from 'common/utils/urlFormatter';
import {GenericYesNoCarmEmailConfirmation} from 'form/models/genericYesNoCarmEmailConfirmation';
import {GenericYesNo} from 'form/models/genericYesNo';

const emailMediationConfirmationViewPath = 'features/common/yes-no-common-page';
const emailMediationConfirmationController = Router();
const MEDIATION_EMAIL_CONFIRMATION_PAGE = 'PAGES.MEDIATION_EMAIL_CONFIRMATION.';

const renderView = (form: GenericForm<GenericYesNoCarmEmailConfirmation>, res: Response, req: Request, partyEmail: string): void => {
  const lang = req.query.lang ? req.query.lang : req.cookies.lang;
  const pageTitle = `${MEDIATION_EMAIL_CONFIRMATION_PAGE}PAGE_TITLE`;
  const pageText = t(`${MEDIATION_EMAIL_CONFIRMATION_PAGE}PAGE_TEXT`, { lng: lang, partyEmail: partyEmail });
  const variation = {
    yes : 'COMMON.VARIATION_7.YES',
    no: 'COMMON.VARIATION_7.NO',
  };
  res.render(emailMediationConfirmationViewPath, { form, pageTitle, pageText, variation, isCarm:true });
};

const getPartyEmail = async (redisKey: string, isClaimantResponse: boolean): Promise<string> => {
  const claim = await getDraftClaimFromStore(redisKey);
  if (isClaimantResponse) {
    return claim.case_data.applicant1.emailAddress.emailAddress;
  }
  return claim.case_data.respondent1.emailAddress.emailAddress;
};

emailMediationConfirmationController.get(MEDIATION_EMAIL_CONFIRMATION_URL, (async (req, res, next: NextFunction) => {
  try {
    const redisKey = generateRedisKey(<AppRequest>req);
    const claim = await getCaseDataFromStore(redisKey);
    const isClaimantResponse = claim.isClaimantIntentionPending();
    const partyEmail = await getPartyEmail(redisKey, isClaimantResponse);
    const mediation = await getMediationCarm(redisKey);
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
    const messageKey = isClaimantResponse
      ? 'ERRORS.MEDIATION_EMAIL_CONFIRMATION_REQUIRED_CLAIMANT'
      : 'ERRORS.MEDIATION_EMAIL_CONFIRMATION_REQUIRED_RESPONDENT';
    const form = new GenericForm(new GenericYesNoCarmEmailConfirmation(req.body.option, messageKey));
    await form.validate();
    if (form.hasErrors()) {
      const partyEmail = await getPartyEmail(redisKey, isClaimantResponse);
      renderView(form, res, req, partyEmail);
    } else {
      await saveMediationCarm(redisKey, form.model, 'isMediationEmailCorrect');
      (req.body.option === YesNo.NO) ? res.redirect(constructResponseUrlWithIdParams(claimId, MEDIATION_ALTERNATIVE_EMAIL_URL))
        : res.redirect(constructResponseUrlWithIdParams(claimId, MEDIATION_NEXT_3_MONTHS_URL));
    }
  } catch (error) {
    next(error);
  }

}) as RequestHandler);

export default emailMediationConfirmationController;
