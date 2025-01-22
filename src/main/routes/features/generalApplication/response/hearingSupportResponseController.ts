import {NextFunction, Request, RequestHandler, Response, Router} from 'express';
import {
  GA_RESPONSE_CHECK_ANSWERS_URL,
  GA_RESPONSE_HEARING_SUPPORT_URL,
  GA_RESPONSE_UNAVAILABLE_HEARING_DATES_URL, GA_UNAVAILABILITY_RESPONSE_CONFIRMATION_URL,
} from 'routes/urls';
import {GenericForm} from 'common/form/models/genericForm';
import {AppRequest} from 'common/models/AppRequest';
import {getCancelUrl} from 'services/features/generalApplication/generalApplicationService';
import {generateRedisKeyForGA} from 'modules/draft-store/draftStoreService';
import {getClaimById} from 'modules/utilityService';
import {HearingSupport} from 'models/generalApplication/hearingSupport';
import {Claim} from 'models/claim';
import {
  getHearingSupportCaption,
  getRespondToApplicationCaption,
  saveRespondentHearingSupport,
} from 'services/features/generalApplication/response/generalApplicationResponseService';
import {
  getDraftGARespondentResponse,
} from 'services/features/generalApplication/response/generalApplicationResponseStoreService';
import {constructResponseUrlWithIdAndAppIdParams} from 'common/utils/urlFormatter';
import {GaResponse} from 'models/generalApplication/response/gaResponse';
import {PageSectionBuilder} from 'common/utils/pageSectionBuilder';
import {interpreterUrl} from 'common/utils/externalURLs';
import {YesNo} from 'form/models/yesNo';

const hearingSupportResponseController = Router();
const viewPath = 'features/generalApplication/hearing-support';

async function renderView(gaResponse: GaResponse, claim: Claim, form: GenericForm<HearingSupport>, req: AppRequest | Request, res: Response): Promise<void> {
  const lang = req.query.lang ? req.query.lang : req.cookies.lang;
  const headerTitle = getRespondToApplicationCaption(gaResponse.generalApplicationType, lang);
  const cancelUrl = await getCancelUrl(req.params.id, claim);
  let backLinkUrl;
  if (gaResponse.hasUnavailableDatesHearing === YesNo.NO) {
    backLinkUrl = constructResponseUrlWithIdAndAppIdParams(req.params.id, req.params.appId, GA_UNAVAILABILITY_RESPONSE_CONFIRMATION_URL);
  } else {
    backLinkUrl = constructResponseUrlWithIdAndAppIdParams(req.params.id, req.params.appId, GA_RESPONSE_UNAVAILABLE_HEARING_DATES_URL);
  }
  const headingTitle = getHearingSupportCaption(lang);
  const pageContent = getPageContent();
  res.render(viewPath, { form, cancelUrl, backLinkUrl, pageContent, headerTitle, headingTitle });
}

hearingSupportResponseController.get(GA_RESPONSE_HEARING_SUPPORT_URL, (async (req: AppRequest, res: Response, next: NextFunction) => {
  try {
    const claimId = req.params.id;
    const claim = await getClaimById(claimId, req, true);
    const gaResponse = await getDraftGARespondentResponse(generateRedisKeyForGA(req));
    const hearingSupport = gaResponse?.hearingSupport || new HearingSupport([]);
    const form = new GenericForm(hearingSupport);
    await renderView(gaResponse, claim, form, req, res);
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
      const gaResponse = await getDraftGARespondentResponse(generateRedisKeyForGA(req));
      await renderView(gaResponse, claim, form, req, res);
    } else {
      await saveRespondentHearingSupport(generateRedisKeyForGA(req), hearingSupport);
      res.redirect(constructResponseUrlWithIdAndAppIdParams(claimId, req.params.appId, GA_RESPONSE_CHECK_ANSWERS_URL));
    }
  } catch (error) {
    next(error);
  }
}) as RequestHandler);

export const getPageContent = () => {
  return new PageSectionBuilder()
    .addParagraph('PAGES.GENERAL_APPLICATION.HEARING_SUPPORT.IF_YOU_NEED',null, 'govuk-!-font-weight-bold')
    .addParagraph('PAGES.GENERAL_APPLICATION.HEARING_SUPPORT.NEED_TO_ARRANGE')
    .addParagraph('PAGES.GENERAL_APPLICATION.HEARING_SUPPORT.NOT_ABLE')
    .addParagraph('PAGES.GENERAL_APPLICATION.HEARING_SUPPORT.ARRANGING_OWN')
    .addFullStopLink('PAGES.GENERAL_APPLICATION.HEARING_SUPPORT.GET_INTERPRETER', interpreterUrl, 'PAGES.GENERAL_APPLICATION.HEARING_SUPPORT.FIND_OUT', null, null, true)
    .addParagraph(null, null)
    .build();
};

export default hearingSupportResponseController;
