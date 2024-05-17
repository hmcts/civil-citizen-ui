import {NextFunction, RequestHandler, Response, Router} from 'express';

import {
  GA_HEARING_ARRANGEMENTS,
  GA_UPLOAD_DOCUMENTS,
  GA_WANT_TO_UPLOAD_DOCUMENTS
} from 'routes/urls';
import {AppRequest} from 'models/AppRequest';
import {selectedApplicationType} from 'models/generalApplication/applicationType';
import {getClaimById} from 'modules/utilityService';
import {YesNo} from 'form/models/yesNo';
import {constructResponseUrlWithIdParams} from 'common/utils/urlFormatter';
import {Claim} from 'models/claim';

const hearingArrangementsController = Router();
const viewPath = 'features/generalApplication/hearing_arrangements'

hearingArrangementsController.get(GA_HEARING_ARRANGEMENTS, (async (req: AppRequest, res: Response, next: NextFunction) => {
  const claimId = req.params.id;
  const claim = await getClaimById(claimId, req, true);
  const backLinkUrl = getBackLinkUrl(claim, claimId);
  const applicationType = selectedApplicationType[claim.generalApplication?.applicationType?.option];
  try {
    res.render(viewPath, {claimId: req.params.id, applicationType, backLinkUrl});
  } catch (error) {
    next(error);
  }
}) as RequestHandler);

function getBackLinkUrl(claim: Claim, claimId: string) : string {
  let redirectUrl;
  if (claim.generalApplication.wantToUploadDocuments === YesNo.YES) {
    redirectUrl = GA_UPLOAD_DOCUMENTS;
  } else {
    redirectUrl = GA_WANT_TO_UPLOAD_DOCUMENTS;
  }
  return constructResponseUrlWithIdParams(claimId, redirectUrl);
}

export default hearingArrangementsController;
