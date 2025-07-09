import {NextFunction, Router, Response, Request, RequestHandler} from 'express';
import {
  MEDIATION_CLAIMANT_PHONE_URL,
  MEDIATION_PHONE_CONFIRMATION_URL,
} from '../../urls';
import {GenericForm} from 'form/models/genericForm';
import {generateRedisKey, getCaseDataFromStore, saveDraftClaim} from 'modules/draft-store/draftStoreService';
import {t} from 'i18next';
import {constructResponseUrlWithIdParams} from 'common/utils/urlFormatter';
import {Claim} from 'models/claim';
import {PartyPhone} from 'models/PartyPhone';
import {AppRequest} from 'models/AppRequest';
import {ClaimantTelephone} from 'form/models/mediation/ClaimantTelephone';

const claimantTelephoneMediationViewPath = 'features/mediation/alternative-telephone';
const claimantTelephoneMediationController = Router();

const renderView = (form: GenericForm<PartyPhone>, res: Response, req: Request): void => {
  const lang = req.query.lang ? req.query.lang : req.cookies.lang;
  const pageTitle = t('PAGES.CLAIMANT_PHONE.PAGE_TITLE', {lng: lang});
  const pageText = t('PAGES.CLAIMANT_PHONE.TITLE_MANDATORY', {lng: lang});
  res.render(claimantTelephoneMediationViewPath, {form, pageTitle, pageText, isCarm: true});
};

claimantTelephoneMediationController.get(MEDIATION_CLAIMANT_PHONE_URL, (async (req, res, next: NextFunction) => {
  try {
    const redisKey = generateRedisKey(<AppRequest>req);
    const claim: Claim = await getCaseDataFromStore(redisKey);
    const form = new GenericForm(claim.applicant1?.partyPhone);
    renderView(form, res, req);
  } catch (error) {
    next(error);
  }
}) as RequestHandler);

claimantTelephoneMediationController.post(MEDIATION_CLAIMANT_PHONE_URL, (async (req, res, next: NextFunction) => {
  try {

    const form = new GenericForm(new ClaimantTelephone(req.body.alternativeTelephone));
    await form.validate();
    if (form.hasErrors()) {
      renderView(form, res, req);
    } else {
      const claimId = req.params.id;
      const redisKey = generateRedisKey(<AppRequest>req);
      const claim: Claim = await getCaseDataFromStore(redisKey);
      claim.applicant1.partyPhone = new PartyPhone(form.model.alternativeTelephone);

      await saveDraftClaim(redisKey, claim);
      res.redirect(constructResponseUrlWithIdParams(claimId, MEDIATION_PHONE_CONFIRMATION_URL));
    }
  } catch (error) {
    next(error);
  }
}) as RequestHandler);

export default claimantTelephoneMediationController;
