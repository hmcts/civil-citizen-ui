import config from 'config';
import {CivilServiceClient} from 'client/civilServiceClient';
import {RequestHandler, Router} from 'express';
import {CASE_DOCUMENT_VIEW_URL, DASHBOARD_NOTIFICATION_REDIRECT} from 'routes/urls';
import {AppRequest} from 'models/AppRequest';
import {getClaimById} from 'modules/utilityService';
import {getSystemGeneratedCaseDocumentIdByType} from 'models/document/systemGeneratedCaseDocuments';
import {DocumentType} from 'models/document/documentType';

const civilServiceApiBaseUrl = config.get<string>('services.civilService.url');
const civilServiceClient: CivilServiceClient = new CivilServiceClient(civilServiceApiBaseUrl);

const notificationRedirectController = Router();

notificationRedirectController.get(DASHBOARD_NOTIFICATION_REDIRECT, (async function(req, res, next){
  const appRequest = <AppRequest> req;
  const claimId = req.params.id;

  await civilServiceClient.recordClick(req.params.notificationId, appRequest);
  const redirectUrl = await getDashboardNotificationRedirectUrl(req.params.locationName, claimId, <AppRequest>req);

  res.redirect(redirectUrl);

}) as RequestHandler);

async function getDashboardNotificationRedirectUrl(locationName: string, claimId: string, req: AppRequest) : Promise<string> {

  let redirectUrl;
  let documentBinary;
  const claim = await getClaimById(claimId, req);

  switch(locationName) {
    //TODO: Example case for draft claim - remove once a real view document is added.
    case 'VIEW_DOCUMENT_DRAFT':
      documentBinary = getSystemGeneratedCaseDocumentIdByType(claim.systemGeneratedCaseDocuments, DocumentType.SEALED_CLAIM);
      redirectUrl = CASE_DOCUMENT_VIEW_URL.replace(':id', claimId).replace(':documentId', documentBinary);
      break;
  }

  return redirectUrl;
}
export default notificationRedirectController;
