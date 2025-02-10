import {NextFunction, RequestHandler, Response, Router} from 'express';
import {
  BACK_URL,
  GA_RESPONDENT_HEARING_PREFERENCE_URL,
  GA_RESPONSE_HEARING_ARRANGEMENT_URL,
} from 'routes/urls';
import {AppRequest} from 'models/AppRequest';
import {constructResponseUrlWithIdAndAppIdParams} from 'common/utils/urlFormatter';
import {
  getRespondToApplicationCaption,
} from 'services/features/generalApplication/response/generalApplicationResponseService';
import {
  getDraftGARespondentResponse,
} from 'services/features/generalApplication/response/generalApplicationResponseStoreService';
import {generateRedisKeyForGA} from 'modules/draft-store/draftStoreService';
import { getCancelUrl } from 'services/features/generalApplication/generalApplicationService';
import { getClaimById } from 'modules/utilityService';

const respondentHearingPreferenceController = Router();
const viewPath = 'features/generalApplication/response/respondent-hearing-preference';
respondentHearingPreferenceController.get(GA_RESPONDENT_HEARING_PREFERENCE_URL, (async (req: AppRequest, res: Response, next: NextFunction) => {
  try {
    const claimId = req.params.id;
    const gaResponse = await getDraftGARespondentResponse(generateRedisKeyForGA(<AppRequest>req));
    const lang = req.query.lang ? req.query.lang : req.cookies.lang;
    const applicationType: string = getRespondToApplicationCaption(gaResponse.generalApplicationType, lang);
    const continueLinkUrl = constructResponseUrlWithIdAndAppIdParams(claimId, req.params.appId, GA_RESPONSE_HEARING_ARRANGEMENT_URL);
    const backLinkUrl = BACK_URL;
    const claim = await getClaimById(claimId, req, true);
    const cancelUrl = await getCancelUrl(req.params.id, claim);

    res.render(viewPath, {applicationType, backLinkUrl, continueLinkUrl, cancelUrl});
  } catch (error) {
    next(error);
  }
}) as RequestHandler);
export default respondentHearingPreferenceController;
