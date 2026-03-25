import {NextFunction, Router, Response, Request, RequestHandler} from 'express';
import {
  MEDIATION_ALTERNATIVE_PHONE_URL,
  MEDIATION_EMAIL_CONFIRMATION_URL, MEDIATION_PHONE_CONFIRMATION_URL,
} from '../../urls';
import {GenericForm} from 'form/models/genericForm';
import {GenericYesNo} from 'form/models/genericYesNo';
import {
  getMediationCarm,
  saveMediationCarm,
} from 'services/features/response/mediation/mediationService';
import {generateRedisKey, getCaseDataFromStore, getDraftClaimFromStore} from 'modules/draft-store/draftStoreService';
import {AppRequest} from 'common/models/AppRequest';
import {t} from 'i18next';
import {YesNo} from 'form/models/yesNo';
import {constructResponseUrlWithIdParams} from 'common/utils/urlFormatter';

const emailMediationConfirmationViewPath = 'features/common/yes-no-common-page';
const emailMediationConfirmationController = Router();
const MEDIATION_EMAIL_CONFIRMATION_PAGE = 'PAGES.MEDIATION_PHONE_CONFIRMATION.';

const renderView = (form: GenericForm<GenericYesNo>, res: Response, req: Request, partyPhone: string, formatValues?: { keyError: string, keyToReplace: string, valueToReplace: string }[]): void => {
  const lang = req.query.lang ? req.query.lang : req.cookies.lang;
  const pageTitle = `${MEDIATION_EMAIL_CONFIRMATION_PAGE}PAGE_TITLE`;
  const pageText = t(`${MEDIATION_EMAIL_CONFIRMATION_PAGE}PAGE_TEXT`, {lng: lang, partyPhone: partyPhone});
  const variation = {
    yes : 'COMMON.VARIATION_7.YES',
    no: 'COMMON.VARIATION_7.NO',
  };

  res.render(emailMediationConfirmationViewPath, {form, pageTitle, pageText, variation, isCarm: true, formatValues});
};

const getPartyPhone = async (redisKey: string, isClaimantResponse: boolean): Promise<string> => {
  const claim = await getDraftClaimFromStore(redisKey);
  const caseData = claim?.case_data;
  const party = isClaimantResponse ? caseData?.applicant1 : caseData?.respondent1;
  const partyPhone = party?.partyPhone;
  const directPartyPhone = typeof partyPhone === 'string' ? partyPhone : partyPhone?.phone;
  if (directPartyPhone) {
    return directPartyPhone;
  }
  if (!isClaimantResponse) {
    return '';
  }

  const companyTelephoneNumber = caseData?.claimantResponse?.mediation?.companyTelephoneNumber;
  const companyPhone = companyTelephoneNumber?.option === YesNo.YES
    ? companyTelephoneNumber?.mediationPhoneNumberConfirmation
    : companyTelephoneNumber?.mediationPhoneNumber;
  if (companyPhone) {
    return companyPhone;
  }

  return caseData?.claimantResponse?.mediation?.canWeUse?.mediationPhoneNumber || '';
};

emailMediationConfirmationController.get(MEDIATION_PHONE_CONFIRMATION_URL, (async (req, res, next: NextFunction) => {
  try {
    const redisKey = generateRedisKey(<AppRequest>req);
    const claim = await getCaseDataFromStore(redisKey);
    const isClaimantResponse = claim.isClaimantIntentionPending();
    const partyPhone = await getPartyPhone(redisKey, isClaimantResponse);
    const mediation = await getMediationCarm(redisKey);
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
    const messageKey = isClaimantResponse
      ? 'ERRORS.MEDIATION_PHONE_CONFIRMATION_REQUIRED_CLAIMANT'
      : 'ERRORS.MEDIATION_PHONE_CONFIRMATION_REQUIRED_RESPONDENT';
    const form = new GenericForm(new GenericYesNo(req.body.option, messageKey));
    await form.validate();
    if (form.hasErrors()) {
      const partyPhone = await getPartyPhone(redisKey, isClaimantResponse);
      const formatValues = [{
        keyError: messageKey,
        keyToReplace: isClaimantResponse ? '[number]' : '[phone number]',
        valueToReplace: partyPhone,
      }];
      renderView(form, res, req, partyPhone, formatValues);
    } else {
      await saveMediationCarm(redisKey, form.model, 'isMediationPhoneCorrect');
      (req.body.option === YesNo.NO) ? res.redirect(constructResponseUrlWithIdParams(claimId, MEDIATION_ALTERNATIVE_PHONE_URL))
        : res.redirect(constructResponseUrlWithIdParams(claimId, MEDIATION_EMAIL_CONFIRMATION_URL));
    }
  } catch (error) {
    next(error);
  }
}) as RequestHandler);

export default emailMediationConfirmationController;
