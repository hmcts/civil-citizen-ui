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
import {getRedirectUrl} from 'services/features/caseProgression/hearingFee/applyHelpFeeSelectionService';
import {GenericYesNo} from 'form/models/genericYesNo';
import {YesNo} from 'form/models/yesNo';

import {generateRedisKey, saveDraftClaim} from 'modules/draft-store/draftStoreService';
import {getSystemGeneratedCaseDocumentIdByType} from 'models/document/systemGeneratedCaseDocuments';
import {documentIdExtractor} from 'common/utils/stringUtils';
import {ClaimBilingualLanguagePreference} from 'models/claimBilingualLanguagePreference';

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
  const claim = await civilServiceClient.retrieveClaimDetails(claimId, req);

  switch(locationName) {
    case 'VIEW_BUNDLE':
      redirectUrl = BUNDLES_URL.replace(':id', claimId);
      break;
    case 'VIEW_ORDERS_AND_NOTICES':
      redirectUrl = VIEW_ORDERS_AND_NOTICES_URL.replace(':id', claimId);
      break;
    case 'VIEW_HEARING_NOTICE':
      if (claim?.caseProgressionHearing?.hearingDocumentsWelsh && claim.caseProgressionHearing.hearingDocumentsWelsh[0]) {
        if ((claim.isClaimant() && claim.claimantBilingualLanguagePreference === ClaimBilingualLanguagePreference.WELSH_AND_ENGLISH)
          || (claim.isDefendant() && claim.respondent1LiPResponse?.respondent1ResponseLanguage === 'BOTH')) {
          redirectUrl = CASE_DOCUMENT_VIEW_URL.replace(':id', claimId).replace(
            ':documentId', documentIdExtractor(claim.caseProgressionHearing.hearingDocumentsWelsh[0].value.documentLink.document_binary_url));
        }
      }
      redirectUrl = CASE_DOCUMENT_VIEW_URL.replace(':id', claimId).replace(
        ':documentId', documentIdExtractor(claim?.caseProgressionHearing?.hearingDocuments[0]?.value?.documentLink?.document_binary_url));
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
