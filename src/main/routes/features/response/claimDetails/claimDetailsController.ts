import {NextFunction, RequestHandler, Response, Router} from 'express';
import {
  CASE_DOCUMENT_VIEW_URL,
  CASE_TIMELINE_DOCUMENTS_URL,
  CLAIM_DETAILS_URL,
  DASHBOARD_CLAIMANT_URL,
  DEFENDANT_SUMMARY_URL,
  VIEW_ORDERS_AND_NOTICES_URL,
} from 'routes/urls';
import {Claim} from 'models/claim';
import {getInterestDetails} from 'common/utils/interestUtils';
import {getFixedCost, getTotalAmountWithInterestAndFeesAndFixedCost} from 'modules/claimDetailsService';
import {DocumentType} from 'models/document/documentType';
import {getSystemGeneratedCaseDocumentIdByType} from 'models/document/systemGeneratedCaseDocuments';
import {getLng} from 'common/utils/languageToggleUtils';
import {getClaimTimeline} from 'services/features/common/claimTimelineService';
import {isWelshEnabledForMainCase} from '../../../../app/auth/launchdarkly/launchDarklyClient';
import {constructResponseUrlWithIdParams} from 'common/utils/urlFormatter';
import {caseNumberPrettify} from 'common/utils/stringUtils';
import {CaseState} from 'form/models/claimDetails';
import config from 'config';
import {CivilServiceClient} from 'client/civilServiceClient';
import {AppRequest} from 'models/AppRequest';

const claimDetailsController = Router();
const claimDetailsViewPathNew = 'features/response/claimDetails/claim-details-new';
const civilServiceApiBaseUrl = config.get<string>('services.civilService.url');
const civilServiceClient: CivilServiceClient = new CivilServiceClient(civilServiceApiBaseUrl);

claimDetailsController.get(CLAIM_DETAILS_URL, (async (req: AppRequest, res: Response, next: NextFunction) => {
  try {
    const welshEnabled = await isWelshEnabledForMainCase();
    const claimId = req.params.id;
    const claim = await civilServiceClient.retrieveClaimDetails(claimId, req);
    const lang = req.query.lang ? req.query.lang : req.cookies.lang;
    const interestData = await getInterestDetails(claim);
    const totalAmount = await getTotalAmountWithInterestAndFeesAndFixedCost(claim);
    const timelineRows = getClaimTimeline(claim, getLng(lang));
    const timelinePdfUrl = claim.extractDocumentId() && CASE_TIMELINE_DOCUMENTS_URL.replace(':id', req.params.id).replace(':documentId', claim.extractDocumentId());
    const claimFormUrl =  CASE_DOCUMENT_VIEW_URL;
    const showErrorAwaitingTranslation = welshEnabled && claim.ccdState === CaseState.PENDING_CASE_ISSUED && claim.preTranslationDocuments?.length > 0;
    const sealedClaimPdfUrl = showErrorAwaitingTranslation
      ? constructResponseUrlWithIdParams(claimId, CLAIM_DETAILS_URL) : getTheClaimFormUrl(req.params.id, claim, claimFormUrl);
    const pageTitle = 'PAGES.CLAIM_DETAILS.PAGE_TITLE_NEW';
    const claimDetailsViewPath = claimDetailsViewPathNew;
    if (claim.hasInterest()) {
      claim.totalInterest = interestData.interest;
    }
    const fixedCost = await getFixedCost(claim);

    res.render(claimDetailsViewPath, {
      claim, totalAmount, interestData, timelineRows, timelinePdfUrl, sealedClaimPdfUrl,
      pageCaption: 'PAGES.CLAIM_DETAILS.THE_CLAIM',
      pageTitle,
      claimId: caseNumberPrettify(claimId),
      dashboardUrl: constructResponseUrlWithIdParams(claimId, claim.isClaimant() ? DASHBOARD_CLAIMANT_URL : DEFENDANT_SUMMARY_URL),
      ordersAndNoticesUrl: VIEW_ORDERS_AND_NOTICES_URL.replace(':id', claimId),
      fixedCost,
      showErrorAwaitingTranslation,
    });
  } catch (error) {
    next(error);
  }
}) as RequestHandler);

function getTheClaimFormUrl(claimId: string, claim: Claim, claimFormUrl: string) {
  return  claimFormUrl.replace(':id', claimId).replace(':documentId', getSystemGeneratedCaseDocumentIdByType(claim.systemGeneratedCaseDocuments,
    (claim.ccdState === CaseState.PENDING_CASE_ISSUED) ? DocumentType.DRAFT_CLAIM_FORM : DocumentType.SEALED_CLAIM));
}

export default claimDetailsController;
