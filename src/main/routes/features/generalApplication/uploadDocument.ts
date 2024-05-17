import {NextFunction, Request, RequestHandler, Response, Router} from 'express';
import {
  GA_HEARING_ARRANGEMENTS,
  GA_UPLOAD_DOCUMENTS,
} from 'routes/urls';
import {AppRequest} from 'models/AppRequest';
import {GenericForm} from 'form/models/genericForm';
import {GenericYesNo} from 'form/models/genericYesNo';
import {Claim} from 'models/claim';
import {selectedApplicationType} from 'models/generalApplication/applicationType';
import {
  getCancelUrl,
} from 'services/features/generalApplication/generalApplicationService';
import {getClaimById} from 'modules/utilityService';
import {constructResponseUrlWithIdParams} from 'common/utils/urlFormatter';

const uploadDocumentsToSupportApplicationController = Router();
const viewPath = 'features/generalApplication/upload_documents';
const backLinkUrl = 'test'; // TODO: add url

async function renderView(form: GenericForm<GenericYesNo>, claim: Claim, claimId: string, res: Response): Promise<void> {
  const applicationType = selectedApplicationType[claim.generalApplication?.applicationType?.option];
  const cancelUrl = await getCancelUrl(claimId, claim);
  res.render(viewPath, {
    form,
    cancelUrl,
    backLinkUrl,
    applicationType,
  });
}

uploadDocumentsToSupportApplicationController.get(GA_UPLOAD_DOCUMENTS, (async (req: AppRequest, res: Response, next: NextFunction) => {
  try {
    const claimId = req.params.id;
    const claim = await getClaimById(claimId, req, true);
    await renderView(undefined, claim, claimId, res);
  } catch (error) {
    next(error);
  }
}) as RequestHandler);

uploadDocumentsToSupportApplicationController.post(GA_UPLOAD_DOCUMENTS, (async (req: AppRequest | Request, res: Response) => {
  const claimId = req.params.id;
  res.redirect(constructResponseUrlWithIdParams(claimId, GA_HEARING_ARRANGEMENTS));
}) as RequestHandler);

export default uploadDocumentsToSupportApplicationController;
