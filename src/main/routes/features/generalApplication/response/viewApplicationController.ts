import {NextFunction, RequestHandler, Response, Router} from 'express';
import {DEFENDANT_SUMMARY_URL, GA_RESPONSE_VIEW_APPLICATION_URL, GA_UPLOAD_ADDITIONAL_DOCUMENTS_URL} from 'routes/urls';
import {AppRequest} from 'common/models/AppRequest';
import {
  getApplicantDocuments,
  getApplicationSections, getCourtDocuments, getRespondentDocuments, getResponseFromCourtSection,
} from 'services/features/generalApplication/viewApplication/viewApplicationService';
import {queryParamNumber} from 'common/utils/requestUtils';
import {ApplicationResponse} from 'models/generalApplication/applicationResponse';
import {getApplicationFromGAService} from 'services/features/generalApplication/generalApplicationService';
import {DocumentsViewComponent} from 'form/models/documents/DocumentsViewComponent';
import {constructResponseUrlWithIdAndAppIdParams, constructResponseUrlWithIdParams} from 'common/utils/urlFormatter';

const viewApplicationToRespondentController = Router();
const viewPath = 'features/generalApplication/response/view-application';
const backLinkUrl = 'test'; // TODO: add url
const redirectUrl = 'test'; //TODO: add url

viewApplicationToRespondentController.get(GA_RESPONSE_VIEW_APPLICATION_URL, (async (req: AppRequest, res: Response, next: NextFunction) => {
  try {
    const claimId = req.params.id;
    const applicationId = req.params.appId ? String(req.params.appId) : null;
    const applicationIndex = queryParamNumber(req, 'index');
    const lang = req.query.lang ? req.query.lang : req.cookies.lang;
    const summaryRows = await getApplicationSections(req, applicationId, lang);
    const pageTitle = 'PAGES.GENERAL_APPLICATION.VIEW_APPLICATION.PAGE_TITLE';
    const applicationResponse: ApplicationResponse = await getApplicationFromGAService(req, applicationId);
    const applicantDocuments: DocumentsViewComponent = getApplicantDocuments(applicationResponse, lang);
    const courtDocuments: DocumentsViewComponent = getCourtDocuments(applicationResponse, lang);
    const respondentDocuments: DocumentsViewComponent = getRespondentDocuments(applicationResponse, lang);
    const additionalDocUrl = constructResponseUrlWithIdAndAppIdParams(req.params.id, applicationId, GA_UPLOAD_ADDITIONAL_DOCUMENTS_URL);
    const responseFromCourt = await getResponseFromCourtSection(req, req.params.appId, lang);
    const dashboardUrl = constructResponseUrlWithIdParams(claimId, DEFENDANT_SUMMARY_URL);
    
    res.render(viewPath, {backLinkUrl, summaryRows, pageTitle, redirectUrl, applicationIndex, applicantDocuments, courtDocuments, respondentDocuments, additionalDocUrl, responseFromCourt, dashboardUrl });
  } catch (error) {
    next(error);
  }
}) as RequestHandler);

export default viewApplicationToRespondentController;
