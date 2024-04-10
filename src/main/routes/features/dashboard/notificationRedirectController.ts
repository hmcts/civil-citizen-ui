import config from 'config';
import {CivilServiceClient} from 'client/civilServiceClient';
import {RequestHandler, Router} from 'express';
import {DASHBOARD_NOTIFICATION_REDIRECT} from 'routes/urls';
import {AppRequest} from 'models/AppRequest';
import {getClaimById} from 'modules/utilityService';
import {getSystemGeneratedCaseDocumentIdByType} from 'models/document/systemGeneratedCaseDocuments';
import {DocumentType} from 'models/document/documentType';
import {getHearingDocumentsCaseDocumentIdByType} from "models/caseProgression/caseProgressionHearing";

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

  switch(locationName) {
    case 'VIEW_ORDERS_AND_NOTICES':
      redirectUrl = '/#';
      break;
    case 'VIEW_FINAL_ORDER':
      redirectUrl = CASE_DOCUMENT_VIEW_URL.replace(':id', claim.id).replace(':documentId',
        getHearingDocumentsCaseDocumentIdByType(claim.caseProgression.finalOrderDocumentCollection, DocumentType.JUDGE_FINAL_ORDER));
      break;
  }

  return redirectUrl;
}
export default notificationRedirectController;
