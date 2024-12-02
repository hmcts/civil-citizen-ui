import {NextFunction, RequestHandler, Response, Router} from 'express';

import {
  GA_HEARING_ARRANGEMENT_URL,
  GA_HEARING_ARRANGEMENTS_GUIDANCE_URL,
  GA_UPLOAD_DOCUMENTS_URL,
  GA_WANT_TO_UPLOAD_DOCUMENTS_URL,
} from 'routes/urls';
import {AppRequest} from 'models/AppRequest';
import {getClaimById} from 'modules/utilityService';
import {YesNo} from 'form/models/yesNo';
import {constructResponseUrlWithIdParams, constructUrlWithIndex} from 'common/utils/urlFormatter';
import {Claim} from 'models/claim';
import { getDynamicHeaderForMultipleApplications } from 'services/features/generalApplication/generalApplicationService';
import {getCancelUrl} from 'services/features/generalApplication/generalApplicationService';
import {queryParamNumber} from 'common/utils/requestUtils';

const hearingArrangementsGuidanceController = Router();
const viewPath = 'features/generalApplication/hearing_arrangements_guidance';

hearingArrangementsGuidanceController.get(GA_HEARING_ARRANGEMENTS_GUIDANCE_URL, (async (req: AppRequest, res: Response, next: NextFunction) => {
  const claimId = req.params.id;
  const claim = await getClaimById(claimId, req, true);
  const index  = queryParamNumber(req, 'index');
  const backLinkUrl = getBackLinkUrl(claim, claimId, index);
  const headerTitle = getDynamicHeaderForMultipleApplications(claim);

  const nextPageUrl = constructUrlWithIndex(constructResponseUrlWithIdParams(claimId, GA_HEARING_ARRANGEMENT_URL), index);
  const cancelUrl = await getCancelUrl(claimId, claim);
  try {
    res.render(viewPath, {claimId: req.params.id, headerTitle, backLinkUrl, nextPageUrl, cancelUrl});
  } catch (error) {
    next(error);
  }
}) as RequestHandler);

function getBackLinkUrl(claim: Claim, claimId: string, index: number) : string {
  return (claim?.generalApplication?.wantToUploadDocuments === YesNo.YES)
    ? constructUrlWithIndex(constructResponseUrlWithIdParams(claimId, GA_UPLOAD_DOCUMENTS_URL), index)
    : constructUrlWithIndex(constructResponseUrlWithIdParams(claimId, GA_WANT_TO_UPLOAD_DOCUMENTS_URL), index);
}

export default hearingArrangementsGuidanceController;
