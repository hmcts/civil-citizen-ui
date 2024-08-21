import {NextFunction, RequestHandler, Response, Router} from 'express';
import {GA_RESPONDENT_HEARING_PREFERENCE_URL, GA_RESPONDENT_WANT_TO_UPLOAD_DOCUMENT_URL } from 'routes/urls';
import {AppRequest} from 'models/AppRequest';
import {getClaimById} from 'modules/utilityService';
import { constructResponseUrlWithIdAndAppIdParams } from 'common/utils/urlFormatter';
import {
  getRespondToApplicationCaption,
} from 'services/features/generalApplication/response/generalApplicationResponseService';

const respondentHearingPreferenceController = Router();
const viewPath = 'features/generalApplication/response/respondent-hearing-preference';
const backLinkUrl = 'test'; // TODO: add url

respondentHearingPreferenceController.get(GA_RESPONDENT_HEARING_PREFERENCE_URL, (async (req: AppRequest, res: Response, next: NextFunction) => {
  try {
    const claimId = req.params.id;
    const claim = await getClaimById(claimId, req, true);
    const lang = req.query.lang ? req.query.lang : req.cookies.lang;
    const applicationType: string = getRespondToApplicationCaption(claim, req.params.appId, lang);
    const continueLinkUrl = constructResponseUrlWithIdAndAppIdParams(claimId, req.params.appId, GA_RESPONDENT_WANT_TO_UPLOAD_DOCUMENT_URL); // TODO: add url

    res.render(viewPath, {applicationType, backLinkUrl, continueLinkUrl});
  } catch (error) {
    next(error);
  }
}) as RequestHandler);
export default respondentHearingPreferenceController;
