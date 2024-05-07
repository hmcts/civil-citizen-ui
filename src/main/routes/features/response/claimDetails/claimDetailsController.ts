import {NextFunction, Request, RequestHandler, Response, Router} from 'express';
import {CASE_DOCUMENT_DOWNLOAD_URL, CASE_DOCUMENT_VIEW_URL, CASE_TIMELINE_DOCUMENTS_URL, CLAIM_DETAILS_URL, DASHBOARD_CLAIMANT_URL, DEFENDANT_SUMMARY_URL} from 'routes/urls';
import {Claim} from 'models/claim';
import {getInterestDetails} from 'common/utils/interestUtils';
import {getTotalAmountWithInterestAndFees} from 'modules/claimDetailsService';
import {DocumentType} from 'models/document/documentType';
import {getClaimById} from 'modules/utilityService';
import {getSystemGeneratedCaseDocumentIdByType} from 'models/document/systemGeneratedCaseDocuments';
import {getLng} from 'common/utils/languageToggleUtils';
import {getClaimTimeline} from 'services/features/common/claimTimelineService';
import {isCUIReleaseTwoEnabled,isDashboardServiceEnabled} from '../../../../app/auth/launchdarkly/launchDarklyClient';
import {constructResponseUrlWithIdParams} from 'common/utils/urlFormatter';
import {caseNumberPrettify} from 'common/utils/stringUtils';

const claimDetailsController = Router();
const claimDetailsViewPathOld = 'features/response/claimDetails/claim-details';
const claimDetailsViewPathNew = 'features/response/claimDetails/claim-details-new';

claimDetailsController.get(CLAIM_DETAILS_URL, (async (req: Request, res: Response, next: NextFunction) => {
  try {
    const isCUIReleaseTwo = await isCUIReleaseTwoEnabled();
    const isDashboardEnabled = await isDashboardServiceEnabled();
    const claimId = req.params.id;
    const claim: Claim = await getClaimById(req.params.id, req, true);
    const lang = req.query.lang ? req.query.lang : req.cookies.lang;
    const interestData = getInterestDetails(claim);
    const totalAmount = getTotalAmountWithInterestAndFees(claim);
    const timelineRows = getClaimTimeline(claim, getLng(lang));
    const timelinePdfUrl = claim.extractDocumentId() && CASE_TIMELINE_DOCUMENTS_URL.replace(':id', req.params.id).replace(':documentId', claim.extractDocumentId());
    const claimFormUrl =  (isCUIReleaseTwo && isDashboardEnabled) ? CASE_DOCUMENT_VIEW_URL : CASE_DOCUMENT_DOWNLOAD_URL;
    const sealedClaimPdfUrl = claimFormUrl.replace(':id', req.params.id).replace(':documentId', getSystemGeneratedCaseDocumentIdByType(claim.systemGeneratedCaseDocuments, DocumentType.SEALED_CLAIM));
    const pageTitle = 'PAGES.CLAIM_DETAILS.PAGE_TITLE_NEW';
    const claimDetailsViewPath = (isCUIReleaseTwo && isDashboardEnabled) ? claimDetailsViewPathNew : claimDetailsViewPathOld;
    claim.totalInterest = interestData.interest;
    res.render(claimDetailsViewPath, {
      claim, totalAmount, interestData, timelineRows, timelinePdfUrl, sealedClaimPdfUrl,
      pageCaption: 'PAGES.CLAIM_DETAILS.THE_CLAIM',
      pageTitle,
      claimId: caseNumberPrettify(claimId),
      dashboardUrl: constructResponseUrlWithIdParams(claimId, claim.isClaimant() ? DASHBOARD_CLAIMANT_URL : DEFENDANT_SUMMARY_URL),
    });
  } catch (error) {
    next(error);
  }
}) as RequestHandler);

export default claimDetailsController;
