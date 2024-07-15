import { AppRequest } from 'common/models/AppRequest';
import { NextFunction, RequestHandler, Response, Router } from 'express';
import { deleteDraftClaimFromStore, generateRedisKey } from 'modules/draft-store/draftStoreService';
import { getClaimById } from 'modules/utilityService';
import { GA_UPLOAD_ADDITIONAL_DOCUMENTS_SUBMITTED_URL } from 'routes/urls';
import { getContentForBody, getContentForCloseButton, getContentForPanel } from 'services/features/generalApplication/additionalDocumentService';
import { getCancelUrl } from 'services/features/generalApplication/generalApplicationService';

const additionalDocSubmittedController = Router();
const viewPath = 'features/generalApplication/additionalDocuments/submitted';

additionalDocSubmittedController.get(GA_UPLOAD_ADDITIONAL_DOCUMENTS_SUBMITTED_URL, (async (req: AppRequest, res: Response, next: NextFunction) => {
  try {
    const lng = req.query.lang ? req.query.lang : req.cookies.lang;
    const { id: claimId } = req.params;
    const claim = await getClaimById(claimId, req, true);
    const redisKey = generateRedisKey(req);
    await deleteDraftClaimFromStore(redisKey);
    res.render(viewPath, {
      gaPaymentSuccessfulPanel: getContentForPanel(lng),
      gaPaymentSuccessfulBody: getContentForBody(lng),
      gaPaymentSuccessfulButton: getContentForCloseButton(await getCancelUrl(claimId, claim)),
    });
  } catch (err) {
    next(err);
  }
}) as RequestHandler);

export default additionalDocSubmittedController;