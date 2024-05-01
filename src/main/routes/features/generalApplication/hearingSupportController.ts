import {NextFunction, Request, RequestHandler, Response, Router} from 'express';
import {HEARING_SUPPORT_URL} from 'routes/urls';
import {GenericForm} from 'common/form/models/genericForm';
import {AppRequest} from 'common/models/AppRequest';
import {selectedApplicationType} from 'common/models/generalApplication/applicationType';
import {getCancelUrl, saveHearingSupport} from 'services/features/generalApplication/generalApplicationService';
import {generateRedisKey} from 'modules/draft-store/draftStoreService';
import {getClaimById} from 'modules/utilityService';
import {t} from 'i18next';
import {HearingSupport} from 'models/generalApplication/hearingSupport';

const hearingSupportController = Router();
const viewPath = 'features/generalApplication/hearing-support';
const backLinkUrl = 'test'; // TODO: add url

hearingSupportController.get(HEARING_SUPPORT_URL, (async (req: AppRequest, res: Response, next: NextFunction) => {
  try {
    const claimId = req.params.id;
    const claim = await getClaimById(claimId, req, true);
    const cancelUrl = await getCancelUrl(claimId, claim);
    const applicationType = selectedApplicationType[claim.generalApplication?.applicationType?.option];

    const hearingSupport = claim.generalApplication?.hearingSupport || new HearingSupport([]);
    const form = new GenericForm(hearingSupport);
    res.render(viewPath, {
      form,
      cancelUrl,
      backLinkUrl,
      applicationType,
      headingTitle: t('PAGES.GENERAL_APPLICATION.HEARING_SUPPORT.TITLE'),
    });
  } catch (error) {
    next(error);
  }
}) as RequestHandler);

hearingSupportController.post(HEARING_SUPPORT_URL, (async (req: AppRequest | Request, res: Response, next: NextFunction) => {
  try {
    const claimId = req.params.id;
    const claim = await getClaimById(claimId, req, true);
    const cancelUrl = await getCancelUrl(claimId, claim);
    const applicationType = selectedApplicationType[claim.generalApplication?.applicationType?.option];
    const redisKey = generateRedisKey(<AppRequest>req);
    const hearingSupport: HearingSupport = new HearingSupport(HearingSupport.convertToArray(req.body.requiredSupport),
      req.body.signLanguageContent, req.body.languageContent, req.body.otherContent);

    const form = new GenericForm(hearingSupport);
    await form.validate();
    if (form.hasErrors()) {
      res.render(viewPath, { form, cancelUrl, backLinkUrl, applicationType, headingTitle: t('PAGES.GENERAL_APPLICATION.HEARING_SUPPORT.TITLE') });
    } else {
      await saveHearingSupport(redisKey, hearingSupport);
      res.redirect('test'); // TODO: add url
    }
  } catch (error) {
    next(error);
  }
}) as RequestHandler);

export default hearingSupportController;
