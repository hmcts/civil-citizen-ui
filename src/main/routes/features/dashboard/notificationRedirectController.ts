import config from 'config';
import {CivilServiceClient} from 'client/civilServiceClient';
import {RequestHandler, Router} from 'express';
import {
  BUNDLES_URL,
  CASE_DOCUMENT_VIEW_URL,
  DASHBOARD_NOTIFICATION_REDIRECT,
  DASHBOARD_NOTIFICATION_REDIRECT_DOCUMENT, VIEW_ORDERS_AND_NOTICES_URL,
} from 'routes/urls';
import {AppRequest} from 'models/AppRequest';
import {DocumentType} from 'models/document/documentType';
import {getHearingDocumentsCaseDocumentIdByType} from 'models/caseProgression/caseProgressionHearing';
import {getRedirectUrl} from 'services/features/caseProgression/hearingFee/applyHelpFeeSelectionService';
import {GenericYesNo} from 'form/models/genericYesNo';
import {YesNo} from 'form/models/yesNo';

import {getClaimById} from 'modules/utilityService';
import {generateRedisKey, saveDraftClaim} from 'modules/draft-store/draftStoreService';
import {getSystemGeneratedCaseDocumentIdByType} from 'models/document/systemGeneratedCaseDocuments';

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

notificationRedirectController.get(DASHBOARD_NOTIFICATION_REDIRECT_DOCUMENT, (async function(req, res, next){
  const appRequest = <AppRequest> req;
  const claimId = req.params.id;

  await civilServiceClient.recordClick(req.params.notificationId, appRequest);
  const redirectUrl = await getDashboardNotificationRedirectUrl(req.params.locationName, claimId, <AppRequest>req);

  res.redirect(redirectUrl);

}) as RequestHandler);

async function getDashboardNotificationRedirectUrl(locationName: string, claimId: string, req: AppRequest) : Promise<string> {

  let redirectUrl;
  const claim = await getClaimById(claimId, req,true);

  switch(locationName) {
    case 'VIEW_BUNDLE':
      redirectUrl = BUNDLES_URL.replace(':id', claimId);
      break;
    case 'VIEW_ORDERS_AND_NOTICES':
      redirectUrl = VIEW_ORDERS_AND_NOTICES_URL.replace(':id', claimId);
      break;
    case 'VIEW_HEARING_NOTICE':
      redirectUrl = CASE_DOCUMENT_VIEW_URL.replace(':id', claimId).replace(
        ':documentId', getHearingDocumentsCaseDocumentIdByType(
          claim?.caseProgressionHearing?.hearingDocuments, DocumentType.HEARING_FORM));
      break;
    case 'PAY_HEARING_FEE_URL':
      await saveDraftClaim(generateRedisKey(req), claim, true);
      redirectUrl = getRedirectUrl(claimId, new GenericYesNo(YesNo.NO), req);
      break;
    case 'VIEW_FINAL_ORDER':
      redirectUrl = CASE_DOCUMENT_VIEW_URL.replace(':id', claim.id).replace(':documentId', req.params.documentId);
      break;
    case 'VIEW_DECISION_RECONSIDERATION':
      redirectUrl =  CASE_DOCUMENT_VIEW_URL.replace(':id', claimId).replace(':documentId', getSystemGeneratedCaseDocumentIdByType(claim.systemGeneratedCaseDocuments, DocumentType.DECISION_MADE_ON_APPLICATIONS));
      break;
  }
  return redirectUrl;
}
export default notificationRedirectController;
