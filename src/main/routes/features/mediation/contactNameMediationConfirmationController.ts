import {NextFunction, Router, Response, Request, RequestHandler} from 'express';
import {
  MEDIATION_ALTERNATIVE_CONTACT_PERSON_URL,
  MEDIATION_CONTACT_PERSON_CONFIRMATION_URL, MEDIATION_PHONE_CONFIRMATION_URL,
} from '../../urls';
import {GenericForm} from 'form/models/genericForm';
import {GenericYesNo} from 'form/models/genericYesNo';
import {
  getMediationCarm,
  saveMediationCarm,
} from 'services/features/response/mediation/mediationService';
import {generateRedisKey, getCaseDataFromStore} from 'modules/draft-store/draftStoreService';
import {AppRequest} from 'common/models/AppRequest';
import {t} from 'i18next';
import {YesNo} from 'form/models/yesNo';
import {constructResponseUrlWithIdParams} from 'common/utils/urlFormatter';

const contactNameMediationConfirmationViewPath = 'features/common/yes-no-common-page';
const contactNameMediationConfirmationController = Router();
const MEDIATION_CONTACT_PERSON_CONFIRMATION_PAGE = 'PAGES.MEDIATION_CONTACT_PERSON_CONFIRMATION.';

const renderView = (form: GenericForm<GenericYesNo>, res: Response, req: Request, defendantContactPerson: string): void => {
  const lang = req.query.lang ? req.query.lang : req.cookies.lang;
  const pageTitle = `${MEDIATION_CONTACT_PERSON_CONFIRMATION_PAGE}PAGE_TITLE`;
  const pageText = t(`${MEDIATION_CONTACT_PERSON_CONFIRMATION_PAGE}PAGE_TEXT_DEFENDANT`, { lng: lang, defendantContactPerson: defendantContactPerson });
  res.render(contactNameMediationConfirmationViewPath, { form, pageTitle, pageText });
};

const getDefendantContactPerson = async (redisKey: string): Promise<string> => {
  const claim = await getCaseDataFromStore(redisKey);
  return claim.respondent1.partyDetails.contactPerson;
};

contactNameMediationConfirmationController.get(MEDIATION_CONTACT_PERSON_CONFIRMATION_URL, (async (req, res, next: NextFunction) => {
  try {
    const redisKey = generateRedisKey(<AppRequest>req);
    const defendantContactPerson = await getDefendantContactPerson(redisKey);
    const mediationCarm = await getMediationCarm(redisKey);
    const form = new GenericForm(new GenericYesNo(mediationCarm.isMediationContactNameCorrect?.option));
    renderView(form, res,req, defendantContactPerson);
  } catch (error) {
    next(error);
  }
}) as RequestHandler);

contactNameMediationConfirmationController.post(MEDIATION_CONTACT_PERSON_CONFIRMATION_URL, (async (req, res, next: NextFunction) => {
  try {
    const redisKey = generateRedisKey(<AppRequest>req);
    const claimId = req.params.id;
    const form = new GenericForm(new GenericYesNo(req.body.option));
    await form.validate();
    if (form.hasErrors()) {
      const defendantContactPerson = await getDefendantContactPerson(redisKey);
      renderView(form, res, req, defendantContactPerson);
    } else {
      await saveMediationCarm(redisKey, form.model, 'isMediationContactNameCorrect');
      (req.body.option === YesNo.NO) ? res.redirect(constructResponseUrlWithIdParams(claimId, MEDIATION_ALTERNATIVE_CONTACT_PERSON_URL))
        : res.redirect(constructResponseUrlWithIdParams(claimId, MEDIATION_PHONE_CONFIRMATION_URL));
    }
  } catch (error) {
    next(error);
  }

}) as RequestHandler);

export default contactNameMediationConfirmationController;
