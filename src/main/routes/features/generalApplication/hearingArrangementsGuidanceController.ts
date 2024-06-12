import {NextFunction, RequestHandler, Response, Router} from 'express';

import {
  GA_HEARING_ARRANGEMENTS_GUIDANCE,
  GA_UPLOAD_DOCUMENTS,
  GA_WANT_TO_UPLOAD_DOCUMENTS,
} from 'routes/urls';
import {AppRequest} from 'models/AppRequest';
import {getClaimById} from 'modules/utilityService';
import {YesNo} from 'form/models/yesNo';
import {constructResponseUrlWithIdParams} from 'common/utils/urlFormatter';
import {Claim} from 'models/claim';
import {getLast} from 'services/features/generalApplication/generalApplicationService';

const hearingArrangementsGuidanceController = Router();
const viewPath = 'features/generalApplication/hearing_arrangements_guidance';

hearingArrangementsGuidanceController.get(GA_HEARING_ARRANGEMENTS_GUIDANCE, (async (req: AppRequest, res: Response, next: NextFunction) => {
  const claimId = req.params.id;
  const claim = await getClaimById(claimId, req, true);
  const backLinkUrl = getBackLinkUrl(claim, claimId);
  const applicationType = selectedApplicationType[getLast(claim.generalApplication?.applicationTypes)?.option];
  try {
    res.render(viewPath, {claimId: req.params.id, applicationType, backLinkUrl});
  } catch (error) {
    next(error);
  }
}) as RequestHandler);

function getBackLinkUrl(claim: Claim, claimId: string) : string {
  return (claim?.generalApplication?.wantToUploadDocuments === YesNo.YES)
    ? constructResponseUrlWithIdParams(claimId, GA_UPLOAD_DOCUMENTS)
    : constructResponseUrlWithIdParams(claimId, GA_WANT_TO_UPLOAD_DOCUMENTS);
}

export default hearingArrangementsGuidanceController;
