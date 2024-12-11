import {NextFunction, RequestHandler, Response, Router} from 'express';
import {
  GA_PAY_ADDITIONAL_FEE_URL,
  GA_VIEW_APPLICATION_URL,
  GA_UPLOAD_ADDITIONAL_DOCUMENTS_URL,
  GA_APPLY_HELP_WITH_FEE_SELECTION,
  GA_APPLICATION_SUMMARY_URL,
  DASHBOARD_CLAIMANT_URL, UPLOAD_YOUR_DOCUMENTS_URL,
} from 'routes/urls';
import {AppRequest} from 'common/models/AppRequest';
import {
  getApplicantDocuments,
  getApplicationSections,
  getCourtDocuments,
  getRespondentDocuments,
  getResponseFromCourtSection, getStatusRow, getSummaryCardSections,
} from 'services/features/generalApplication/viewApplication/viewApplicationService';
import {queryParamNumber} from 'common/utils/requestUtils';
import {
  ApplicationResponse,
} from 'common/models/generalApplication/applicationResponse';
import {getApplicationFromGAService} from 'services/features/generalApplication/generalApplicationService';
import {constructResponseUrlWithIdAndAppIdParams, constructResponseUrlWithIdParams} from 'common/utils/urlFormatter';
import { ApplicationState } from 'common/models/generalApplication/applicationSummary';
import { DocumentsViewComponent } from 'common/form/models/documents/DocumentsViewComponent';
import {convertToPoundsFilter} from 'common/utils/currencyFormat';
import {Claim} from 'models/claim';
import {getClaimById} from 'modules/utilityService';
import {deleteDraftClaimFromStore} from 'modules/draft-store/draftStoreService';
import {canUploadAddlDoc} from 'services/features/generalApplication/additionalDocumentService';

const viewApplicationController = Router();
const viewPath = 'features/generalApplication/view-applications';

viewApplicationController.get(GA_VIEW_APPLICATION_URL, (async (req: AppRequest, res: Response, next: NextFunction) => {
  try {
    const claimId = req.params.id;
    const claim: Claim = await getClaimById(claimId, req, true);
    const applicationIndex = queryParamNumber(req, 'index');
    const lang = req.query.lang ? req.query.lang : req.cookies.lang;
    const applicationResponse: ApplicationResponse = await getApplicationFromGAService(req, req.params.appId);
    const statusRow = getStatusRow(applicationResponse, lang);
    const applicationTypeCards = getSummaryCardSections(applicationResponse, lang);
    const {summaryRows, responseSummaries} = await getApplicationSections(req, applicationResponse, lang);
    const pageTitle = 'PAGES.GENERAL_APPLICATION.VIEW_APPLICATION.PAGE_TITLE';
    const applicantDocuments : DocumentsViewComponent = getApplicantDocuments(applicationResponse, lang);
    const courtDocuments: DocumentsViewComponent = getCourtDocuments(applicationResponse, lang);
    const respondentDocuments: DocumentsViewComponent = getRespondentDocuments(applicationResponse, lang);
    let applicationFeeOptionUrl : string = null;

    const isApplicationFeeAmountNotPaid = isApplicationFeeNotPaid(applicationResponse);

    const payAdditionalFeeUrl = constructResponseUrlWithIdAndAppIdParams(claimId, req.params.appId, GA_PAY_ADDITIONAL_FEE_URL);

    if(isApplicationFeeAmountNotPaid) {
      applicationFeeOptionUrl = constructResponseUrlWithIdAndAppIdParams(claimId, req.params.appId, GA_APPLY_HELP_WITH_FEE_SELECTION + '?appFee=' + convertToPoundsFilter(applicationResponse?.case_data?.generalAppPBADetails?.fee.calculatedAmountInPence));
    }
    let additionalDocUrl : string = null;
    if(canUploadAddlDoc(applicationResponse)) {
      additionalDocUrl = constructResponseUrlWithIdAndAppIdParams(req.params.id, req.params.appId, GA_UPLOAD_ADDITIONAL_DOCUMENTS_URL);
    }
    const responseFromCourt =  await getResponseFromCourtSection(req, req.params.appId, lang);
    const dashboardUrl = constructResponseUrlWithIdParams(claimId,DASHBOARD_CLAIMANT_URL);
    const caseProgressionCaseState = claim.isCaseProgressionCaseState();
    const uploadDocsTrialUrl = constructResponseUrlWithIdParams(claimId, UPLOAD_YOUR_DOCUMENTS_URL);
    await deleteDraftClaimFromStore(claimId);

    res.render(viewPath, {
      backLinkUrl: constructResponseUrlWithIdParams(claimId, GA_APPLICATION_SUMMARY_URL),
      statusRow,
      applicationTypeCards,
      summaryRows,
      responseSummaries,
      pageTitle,
      dashboardUrl,
      applicationIndex,
      responseFromCourt,
      additionalDocUrl,
      payAdditionalFeeUrl,
      isApplicationFeeAmountNotPaid,
      applicationFeeOptionUrl,
      applicantDocuments,
      courtDocuments,
      respondentDocuments,
      caseProgressionCaseState,
      uploadDocsTrialUrl,
    });

  } catch (error) {
    next(error);
  }
}) as RequestHandler);

const isApplicationFeeNotPaid = (applicationResponse : ApplicationResponse) => {
  return applicationResponse?.case_data?.generalAppPBADetails?.paymentDetails?.status !== 'SUCCESS' && applicationResponse?.state === ApplicationState.AWAITING_APPLICATION_PAYMENT;
};

export default viewApplicationController;
