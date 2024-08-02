import {NextFunction, RequestHandler, Response, Router} from 'express';
import {GA_RESPONSE_VIEW_APPLICATION_URL} from 'routes/urls';
import {AppRequest} from 'common/models/AppRequest';
import {
  getApplicantDocuments,
  getApplicationSections, getRespondentDocuments,
} from 'services/features/generalApplication/viewApplication/viewApplicationService';
import {queryParamNumber} from 'common/utils/requestUtils';
import {ApplicationResponse} from 'models/generalApplication/applicationResponse';
import {getApplicationFromGAService} from 'services/features/generalApplication/generalApplicationService';

const viewApplicationToRespondentController = Router();
const viewPath = 'features/generalApplication/response/view-application';
const backLinkUrl = 'test'; // TODO: add url
const redirectUrl = 'test'; //TODO: add url

viewApplicationToRespondentController.get(GA_RESPONSE_VIEW_APPLICATION_URL, (async (req: AppRequest, res: Response, next: NextFunction) => {
  try {
    const applicationId = req.query.applicationId ? String(req.query.applicationId) : null;
    const applicationIndex = queryParamNumber(req, 'index');
    const lang = req.query.lang ? req.query.lang : req.cookies.lang;
    const summaryRows = await getApplicationSections(req, applicationId, lang);
    const pageTitle = 'PAGES.GENERAL_APPLICATION.VIEW_APPLICATION.PAGE_TITLE';
    const applicationResponse: ApplicationResponse = await getApplicationFromGAService(req, applicationId);
    const applicantDocuments = getApplicantDocuments(applicationResponse, lang);
    const respondentDocuments = getRespondentDocuments(applicationResponse, lang);
    res.render(viewPath, {backLinkUrl, summaryRows, pageTitle, redirectUrl, applicationIndex, applicantDocuments, respondentDocuments });
  } catch (error) {
    next(error);
  }
}) as RequestHandler);

export default viewApplicationToRespondentController;
