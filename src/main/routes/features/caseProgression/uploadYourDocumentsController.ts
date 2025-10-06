import {NextFunction, RequestHandler, Router} from 'express';
import {DASHBOARD_CLAIMANT_URL, DEFENDANT_SUMMARY_URL, UPLOAD_YOUR_DOCUMENTS_URL} from '../../urls';
import {getUploadYourDocumentsContents} from 'services/features/caseProgression/uploadYourDocumentsContents';
import {getClaimById} from 'modules/utilityService';
import {constructResponseUrlWithIdParams} from 'common/utils/urlFormatter';
import {isCuiGaNroEnabled} from '../../../app/auth/launchdarkly/launchDarklyClient';

const uploadYourDocumentsViewPath = 'features/caseProgression/upload-your-documents';
const uploadYourDocumentsController = Router();

uploadYourDocumentsController.get(UPLOAD_YOUR_DOCUMENTS_URL, (async (req, res, next: NextFunction) => {
  try {
    const claimId = req.params.id;
    const claim = await getClaimById(claimId, req,true);
    const isGaNroEnabled = await isCuiGaNroEnabled();
    let dashboardUrl;
    if (claim.isClaimant()) {
      dashboardUrl = constructResponseUrlWithIdParams(claimId, DASHBOARD_CLAIMANT_URL);
    } else {
      dashboardUrl = constructResponseUrlWithIdParams(claimId, DEFENDANT_SUMMARY_URL);
    }
    res.render(uploadYourDocumentsViewPath, {
      uploadYourDocumentsContents: getUploadYourDocumentsContents(claimId, claim, isGaNroEnabled),
      dashboardUrl,
    });
  } catch (error) {
    next(error);
  }
}) as RequestHandler);

export default uploadYourDocumentsController;
