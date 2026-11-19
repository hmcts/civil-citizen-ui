import config from 'config';
import {CivilServiceClient} from 'client/civilServiceClient';
import {RequestHandler, Router} from 'express';
import {
  BUNDLES_URL,
  CASE_DOCUMENT_VIEW_URL, DASHBOARD_CLAIMANT_URL,
  DASHBOARD_NOTIFICATION_REDIRECT,
  DASHBOARD_NOTIFICATION_REDIRECT_DOCUMENT, DEFENDANT_SUMMARY_URL, QM_VIEW_QUERY_URL, VIEW_ORDERS_AND_NOTICES_URL,
} from 'routes/urls';
import {AppRequest} from 'models/AppRequest';
import {DocumentType} from 'models/document/documentType';
import {getRedirectUrl} from 'services/features/caseProgression/hearingFee/applyHelpFeeSelectionService';
import {GenericYesNo} from 'form/models/genericYesNo';
import {YesNo} from 'form/models/yesNo';

import {generateRedisKey, saveDraftClaim} from 'modules/draft-store/draftStoreService';
import {
  buildSystemGeneratedCaseDocumentUrl,
  getSystemGeneratedCaseDocumentIdByType,
} from 'models/document/systemGeneratedCaseDocuments';
import {documentIdExtractor} from 'common/utils/stringUtils';
import {checkWelshHearingNotice} from 'services/features/caseProgression/hearing/hearingService';
import {constructResponseUrlWithIdParams} from 'common/utils/urlFormatter';
import {getRouteParam} from 'common/utils/routeParamUtils';
import {Claim, PreTranslationDocumentType} from 'models/claim';

const civilServiceApiBaseUrl = config.get<string>('services.civilService.url');
const civilServiceClient: CivilServiceClient = new CivilServiceClient(civilServiceApiBaseUrl);

const notificationRedirectController = Router();

notificationRedirectController.get(DASHBOARD_NOTIFICATION_REDIRECT, (async function(req, res, next){
  const appRequest = <AppRequest> req;
  const claimId = getRouteParam(req, 'id');

  await civilServiceClient.recordClick(getRouteParam(req, 'notificationId'), appRequest);
  const redirectUrl = await getDashboardNotificationRedirectUrl(getRouteParam(req, 'locationName'), claimId, <AppRequest>req);

  res.redirect(redirectUrl);

}) as RequestHandler);

notificationRedirectController.get(DASHBOARD_NOTIFICATION_REDIRECT_DOCUMENT, (async function(req, res, next){
  const appRequest = <AppRequest> req;
  const claimId = getRouteParam(req, 'id');

  await civilServiceClient.recordClick(getRouteParam(req, 'notificationId'), appRequest);
  const redirectUrl = await getDashboardNotificationRedirectUrl(getRouteParam(req, 'locationName'), claimId, <AppRequest>req);

  res.redirect(redirectUrl);

}) as RequestHandler);

const dashboardUrlForClaim = (claimId: string, isClaimant: boolean): string =>
  constructResponseUrlWithIdParams(claimId, isClaimant ? DASHBOARD_CLAIMANT_URL : DEFENDANT_SUMMARY_URL);

/** Missing document — not a Welsh-translation delay. Shown regardless of the Welsh flag. */
const missingDocumentDashboardUrl = (claimId: string, isClaimant: boolean): string =>
  `${dashboardUrlForClaim(claimId, isClaimant)}?errorDocumentNotAvailable`;

/** Genuine Welsh hearing-notice translation delay vs ordinary missing document. */
const hearingNoticeFallbackDashboardUrl = (claimId: string, claim: Claim): string => {
  const dashboardUrl = dashboardUrlForClaim(claimId, claim.isClaimant());
  if (claim?.preTranslationDocumentType === PreTranslationDocumentType.HEARING_NOTICE) {
    return `${dashboardUrl}?errorAwaitingTranslation`;
  }
  return `${dashboardUrl}?errorDocumentNotAvailable`;
};

async function getDashboardNotificationRedirectUrl(locationName: string, claimId: string, req: AppRequest) : Promise<string> {

  let redirectUrl;
  const claim = await civilServiceClient.retrieveClaimDetails(claimId, req);
  const lang = req.query.lang ? req.query.lang : req.cookies.lang;

  switch(locationName) {
    case 'VIEW_BUNDLE':
      redirectUrl = BUNDLES_URL.replace(':id', claimId);
      break;
    case 'VIEW_ORDERS_AND_NOTICES':
      redirectUrl = VIEW_ORDERS_AND_NOTICES_URL.replace(':id', claimId);
      break;
    case 'QM_VIEW_MESSAGES_URL_CLICK':
      redirectUrl = QM_VIEW_QUERY_URL.replace(':id', claimId);
      break;
    case 'VIEW_HEARING_NOTICE': {
      const hearingNoticeFallback = hearingNoticeFallbackDashboardUrl(claimId, claim);
      if (claim?.caseProgressionHearing?.hearingDocumentsWelsh && claim.caseProgressionHearing.hearingDocumentsWelsh[0] && lang === 'cy') {
        if (checkWelshHearingNotice(claim)) {
          redirectUrl = buildSystemGeneratedCaseDocumentUrl(
            claimId,
            documentIdExtractor(claim.caseProgressionHearing.hearingDocumentsWelsh[0].value.documentLink.document_binary_url),
            CASE_DOCUMENT_VIEW_URL,
          ) ?? hearingNoticeFallback;
          break;
        }
      }
      if (!claim?.caseProgressionHearing?.hearingDocuments) {
        redirectUrl = hearingNoticeFallback;
        break;
      }
      redirectUrl = buildSystemGeneratedCaseDocumentUrl(
        claimId,
        documentIdExtractor(claim.caseProgressionHearing.hearingDocuments[0]?.value?.documentLink?.document_binary_url),
        CASE_DOCUMENT_VIEW_URL,
      ) ?? hearingNoticeFallback;
      break;
    }
    case 'PAY_HEARING_FEE_URL':
      await saveDraftClaim(generateRedisKey(req), claim, true, req.session.user?.id);
      redirectUrl = getRedirectUrl(claimId, new GenericYesNo(YesNo.NO), req);
      break;
    case 'VIEW_FINAL_ORDER':
      if (req.params.documentId === 'awaiting-translation') {
        redirectUrl = `${dashboardUrlForClaim(claimId, claim.isClaimant())}?errorAwaitingTranslation`;
        break;
      }
      redirectUrl = CASE_DOCUMENT_VIEW_URL.replace(':id', claim.id).replace(':documentId', getRouteParam(req, 'documentId'));
      break;
    case 'VIEW_DECISION_RECONSIDERATION':
      redirectUrl = buildSystemGeneratedCaseDocumentUrl(
        claimId,
        getSystemGeneratedCaseDocumentIdByType(claim.systemGeneratedCaseDocuments, DocumentType.DECISION_MADE_ON_APPLICATIONS),
        CASE_DOCUMENT_VIEW_URL,
      ) ?? missingDocumentDashboardUrl(claimId, claim.isClaimant());
      break;
  }
  return redirectUrl;
}
export default notificationRedirectController;
