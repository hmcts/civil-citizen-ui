import {NextFunction, Request, RequestHandler, Response, Router} from 'express';
import {GA_HEARING_SUPPORT_URL, GA_UNAVAILABLE_HEARING_DATES_URL, PAYING_FOR_APPLICATION_URL} from 'routes/urls';
import {GenericForm} from 'common/form/models/genericForm';
import {AppRequest} from 'common/models/AppRequest';
import {getCancelUrl, getDynamicHeaderForMultipleApplications, saveHearingSupport} from 'services/features/generalApplication/generalApplicationService';
import {generateRedisKey} from 'modules/draft-store/draftStoreService';
import {getClaimById} from 'modules/utilityService';
import {t} from 'i18next';
import {HearingSupport} from 'models/generalApplication/hearingSupport';
import {Claim} from 'models/claim';
import {constructResponseUrlWithIdParams, constructUrlWithIndex} from 'common/utils/urlFormatter';
import {queryParamNumber} from 'common/utils/requestUtils';

const hearingSupportController = Router();
const viewPath = 'features/generalApplication/hearing-support';

async function renderView(claimId: string, claim: Claim, form: GenericForm<HearingSupport>, res: Response, lng: string, index: number): Promise<void> {
  const cancelUrl = await getCancelUrl(claimId, claim);
  const backLinkUrl = constructUrlWithIndex(constructResponseUrlWithIdParams(claimId, GA_UNAVAILABLE_HEARING_DATES_URL), index);
  res.render(viewPath, {
    form,
    cancelUrl,
    backLinkUrl,
    headerTitle: getDynamicHeaderForMultipleApplications(claim),
    headingTitle: t('PAGES.GENERAL_APPLICATION.HEARING_SUPPORT.TITLE', {lng}) });
}

hearingSupportController.get(GA_HEARING_SUPPORT_URL, (async (req: AppRequest, res: Response, next: NextFunction) => {
  try {
    const lng = req.query.lang ? req.query.lang : req.cookies.lang;
    const claimId = req.params.id;
    const claim = await getClaimById(claimId, req, true);
    const index  = queryParamNumber(req, 'index') || (claim.generalApplication?.applicationTypes?.length - 1 || 0);
    const hearingSupport = claim.generalApplication?.hearingSupport || new HearingSupport([]);
    const form = new GenericForm(hearingSupport);
    await renderView(claimId, claim, form, res, lng, index);
  } catch (error) {
    next(error);
  }
}) as RequestHandler);

hearingSupportController.post(GA_HEARING_SUPPORT_URL, (async (req: AppRequest | Request, res: Response, next: NextFunction) => {
  try {
    const lng = req.query.lang ? req.query.lang : req.cookies.lang;
    const claimId = req.params.id;
    const claim = await getClaimById(claimId, req, true);
    const redisKey = generateRedisKey(<AppRequest>req);
    const index  = queryParamNumber(req, 'index') || (claim.generalApplication?.applicationTypes?.length - 1 || 0);
    const hearingSupport: HearingSupport = new HearingSupport(HearingSupport.convertToArray(req.body.requiredSupport),
      req.body.signLanguageContent, req.body.languageContent, req.body.otherContent);

    const form = new GenericForm(hearingSupport);
    await form.validate();
    if (form.hasErrors()) {
      await renderView(claimId, claim, form, res, lng, index);
    } else {
      await saveHearingSupport(redisKey, hearingSupport);
      res.redirect(constructUrlWithIndex(constructResponseUrlWithIdParams(claimId, PAYING_FOR_APPLICATION_URL), index));
    }
  } catch (error) {
    next(error);
  }
}) as RequestHandler);

export default hearingSupportController;
