import {NextFunction, RequestHandler, Response, Router} from 'express';
import {GA_VIEW_APPLICATION_URL} from 'routes/urls';
import {AppRequest} from 'common/models/AppRequest';
import {getApplicationSections} from 'services/features/generalApplication/viewApplication/viewApplicationService';
import { ApplicationResponse } from 'common/models/generalApplication/applicationResponse';
import { getApplicationFromGAService } from 'services/features/generalApplication/generalApplicationService';
import { CaseState } from 'common/form/models/claimDetails';

const viewApplicationController = Router();
const viewPath = 'features/generalApplication/view-applications';
const backLinkUrl = 'test'; // TODO: add url

viewApplicationController.get(GA_VIEW_APPLICATION_URL, (async (req: AppRequest, res: Response, next: NextFunction) => {
  try {
    const applicationId = req.query.applicationId ? String(req.query.applicationId) : null;
    const lang = req.query.lang ? req.query.lang : req.cookies.lang;
    const summaryRows = await getApplicationSections(req, applicationId, lang);
    const pageTitle = 'PAGES.GENERAL_APPLICATION.VIEW_APPLICATION.PAGE_TITLE';
    const applicationResponse: ApplicationResponse = await getApplicationFromGAService(req, applicationId);
    const isResponseFromCourt = applicationResponse.state === CaseState.JUDICIAL_REFERRAL ? true : false;

    res.render(viewPath, {backLinkUrl, summaryRows, pageTitle, isResponseFromCourt });
  } catch (error) {
    next(error);
  }
}) as RequestHandler);

export default viewApplicationController;
