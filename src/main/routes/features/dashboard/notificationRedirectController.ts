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
import {constructResponseUrlWithIdParams} from 'common/utils/urlFormatter';
import {getRouteParam, isUsablePathSegment} from 'common/utils/routeParamUtils';
import {Claim, PreTranslationDocumentType} from 'models/claim';
import {
  partyPrefersTranslatedOrBilingualOrder,
  resolveOrderDocumentId,
  resolveViewableOrderDocumentId,
} from 'services/features/dashboard/bilingualOrderDocumentService';
import {isWelshEnabledForMainCase} from 'app/auth/launchdarkly/launchDarklyClient';

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
      // OCCC-827: EN / CY / bilingual stitched hearing notice by party language preference.
      const hearingNoticeFallback = hearingNoticeFallbackDashboardUrl(claimId, claim);
      const welshEnabled = await isWelshEnabledForMainCase();
      const resolvedHearingId = resolveOrderDocumentId(claim, claim.isClaimant(), 'HEARING_NOTICE', welshEnabled);
      if (resolvedHearingId) {
        redirectUrl = buildSystemGeneratedCaseDocumentUrl(claimId, resolvedHearingId, CASE_DOCUMENT_VIEW_URL)
          ?? hearingNoticeFallback;
        break;
      }
      redirectUrl = partyPrefersTranslatedOrBilingualOrder(claim, claim.isClaimant(), welshEnabled)
        || claim?.preTranslationDocumentType === PreTranslationDocumentType.HEARING_NOTICE
        ? `${dashboardUrlForClaim(claimId, claim.isClaimant())}?errorAwaitingTranslation`
        : hearingNoticeFallback;
      break;
    }
    case 'PAY_HEARING_FEE_URL':
      await saveDraftClaim(generateRedisKey(req), claim, true, req.session.user?.id);
      redirectUrl = getRedirectUrl(claimId, new GenericYesNo(YesNo.NO), req);
      break;
    case 'VIEW_FINAL_ORDER': {
      // OCCC-827: OrderMade links bake awaiting-translation while the SDO/order sits in
      // preTranslationDocuments. After CW upload, resolve live (EN / CY / bilingual, SDO or FO)
      // before honouring the sentinel — otherwise English parties keep seeing the warning.
      const documentIdFromUrl = getRouteParam(req, 'documentId');
      const welshEnabled = await isWelshEnabledForMainCase();
      const resolvedId = resolveViewableOrderDocumentId(claim, claim.isClaimant(), welshEnabled);
      if (resolvedId) {
        redirectUrl = buildSystemGeneratedCaseDocumentUrl(claimId, resolvedId, CASE_DOCUMENT_VIEW_URL)
          ?? CASE_DOCUMENT_VIEW_URL.replace(':id', claim.id).replace(':documentId', resolvedId);
        break;
      }
      if (documentIdFromUrl === 'awaiting-translation' || !isUsablePathSegment(documentIdFromUrl)) {
        redirectUrl = partyPrefersTranslatedOrBilingualOrder(claim, claim.isClaimant(), welshEnabled)
          || documentIdFromUrl === 'awaiting-translation'
          ? `${dashboardUrlForClaim(claimId, claim.isClaimant())}?errorAwaitingTranslation`
          : missingDocumentDashboardUrl(claimId, claim.isClaimant());
        break;
      }
      redirectUrl = CASE_DOCUMENT_VIEW_URL.replace(':id', claim.id).replace(':documentId', documentIdFromUrl);
      break;
    }
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
