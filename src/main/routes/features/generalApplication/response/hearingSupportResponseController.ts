import {NextFunction, Request, RequestHandler, Response, Router} from 'express';
import {GA_RESPONSE_HEARING_SUPPORT_URL} from 'routes/urls';
import {GenericForm} from 'common/form/models/genericForm';
import {AppRequest} from 'common/models/AppRequest';
import {getCancelUrl} from 'services/features/generalApplication/generalApplicationService';
import { generateRedisKeyForGA } from 'modules/draft-store/draftStoreService';
import {getClaimById} from 'modules/utilityService';
import {t} from 'i18next';
import {HearingSupport} from 'models/generalApplication/hearingSupport';
import {Claim} from 'models/claim';
import {
  getRespondToApplicationCaption,
  saveRespondentHearingSupport,
} from 'services/features/generalApplication/response/generalApplicationResponseService';
import { getDraftGARespondentResponse } from 'services/features/generalApplication/response/generalApplicationResponseStoreService';

const hearingSupportResponseController = Router();
const viewPath = 'features/generalApplication/hearing-support';
const backLinkUrl = 'test'; // TODO: add url

async function renderView(claimId: string, claim: Claim, form: GenericForm<HearingSupport>,  req: AppRequest | Request, res: Response): Promise<void> {
  const lang = req.query.lang ? req.query.lang : req.cookies.lang;
  const headerTitle = getRespondToApplicationCaption(claim, req.params.appId, lang);
  const cancelUrl = await getCancelUrl(claimId, claim);
  res.render(viewPath, { form, cancelUrl, backLinkUrl, headerTitle, headingTitle: t('PAGES.GENERAL_APPLICATION.HEARING_SUPPORT.TITLE') });
}

hearingSupportResponseController.get(GA_RESPONSE_HEARING_SUPPORT_URL, (async (req: AppRequest, res: Response, next: NextFunction) => {
  try {
    const claimId = req.params.id;
    const claim = await getClaimById(claimId, req, true);
    const gaResponse = await getDraftGARespondentResponse(generateRedisKeyForGA(req));
    const hearingSupport = gaResponse?.hearingSupport || new HearingSupport([]);
    const form = new GenericForm(hearingSupport);
    await renderView(claimId, claim, form, req, res);
  } catch (error) {
    next(error);
  }
}) as RequestHandler);

hearingSupportResponseController.post(GA_RESPONSE_HEARING_SUPPORT_URL, (async (req: AppRequest, res: Response, next: NextFunction) => {
  try {
    const claimId = req.params.id;
    const claim = await getClaimById(claimId, req, true);
    const hearingSupport: HearingSupport = new HearingSupport(HearingSupport.convertToArray(req.body.requiredSupport),
      req.body.signLanguageContent, req.body.languageContent, req.body.otherContent);

    const form = new GenericForm(hearingSupport);
    await form.validate();
    if (form.hasErrors()) {
      await renderView(claimId, claim, form, req, res);
    } else {
      await saveRespondentHearingSupport(generateRedisKeyForGA(req), hearingSupport);
      res.redirect('test'); // TODO: add url
    }
  } catch (error) {
    next(error);
  }
}) as RequestHandler);

export default hearingSupportResponseController;
