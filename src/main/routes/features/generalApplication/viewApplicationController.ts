import {NextFunction, RequestHandler, Response, Router} from 'express';
import { DASHBOARD_URL, GA_UPLOAD_ADDITIONAL_DOCUMENTS_URL, GA_VIEW_APPLICATION_URL } from 'routes/urls';
import {AppRequest} from 'common/models/AppRequest';
import {getApplicationSections} from 'services/features/generalApplication/viewApplication/viewApplicationService';
import {queryParamNumber} from 'common/utils/requestUtils';
import { constructResponseUrlWithIdParams } from 'common/utils/urlFormatter';

const viewApplicationController = Router();
const viewPath = 'features/generalApplication/view-applications';
const backLinkUrl = 'test'; // TODO: add url

viewApplicationController.get(GA_VIEW_APPLICATION_URL, (async (req: AppRequest, res: Response, next: NextFunction) => {
  try {
    const applicationId = req.query.applicationId ? String(req.query.applicationId) : null;
    const applicationIndex = queryParamNumber(req, 'index');
    const lang = req.query.lang ? req.query.lang : req.cookies.lang;
    const summaryRows = await getApplicationSections(req, applicationId, lang);
    const pageTitle = 'PAGES.GENERAL_APPLICATION.VIEW_APPLICATION.PAGE_TITLE';
    const additionalDocUrl = constructResponseUrlWithIdParams(req.params.id, GA_UPLOAD_ADDITIONAL_DOCUMENTS_URL).replace(':gaId', applicationId);
    res.render(viewPath, { backLinkUrl, summaryRows, additionalDocUrl, pageTitle, dashboardUrl: DASHBOARD_URL, applicationIndex });
  } catch (error) {
    next(error);
  }
}) as RequestHandler);

export default viewApplicationController;
