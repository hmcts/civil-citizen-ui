import config from 'config';
import {CivilServiceClient} from 'client/civilServiceClient';
import {RequestHandler, Router} from 'express';

import {APPLY_HELP_WITH_FEES_START, CASE_DOCUMENT_VIEW_URL, DASHBOARD_NOTIFICATION_REDIRECT} from 'routes/urls';
import {AppRequest} from 'models/AppRequest';
import {DocumentType} from 'models/document/documentType';
import {getHearingDocumentsCaseDocumentIdByType} from 'models/caseProgression/caseProgressionHearing';
import {getRedirectUrl} from 'services/features/caseProgression/hearingFee/applyHelpFeeSelectionService';
import {GenericYesNo} from 'form/models/genericYesNo';
import {YesNo} from 'form/models/yesNo';
import {getClaimById} from 'modules/utilityService';

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
    case 'VIEW_ORDERS_AND_NOTICES':
      redirectUrl = '/#';
      break;
    case 'VIEW_HEARING_NOTICE':
      documentBinary = getHearingDocumentsCaseDocumentIdByType(claim?.caseProgressionHearing?.hearingDocuments, DocumentType.HEARING_FORM);
      redirectUrl = CASE_DOCUMENT_VIEW_URL.replace(':id', claimId).replace(':documentId', documentBinary);
      break;
    case 'APPLY_HELP_WITH_FEES_START':
      redirectUrl = APPLY_HELP_WITH_FEES_START.replace(':id', claimId);
      break;
    case 'PAY_HEARING_FEE_URL':
      redirectUrl = getRedirectUrl(claimId, new GenericYesNo(YesNo.NO), req);
      break;
  }
  return redirectUrl;
}
export default notificationRedirectController;
