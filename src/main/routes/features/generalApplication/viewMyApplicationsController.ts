import {NextFunction, RequestHandler, Response, Router} from 'express';
import {GA_VIEW_APPLICATION_URL} from 'routes/urls';
import {AppRequest} from 'common/models/AppRequest';
import config from 'config';
import {GeneralApplicationClient} from 'client/generalApplicationClient';
import {
  getApplicationSections,
} from 'services/features/generalApplication/viewMyApplications/viewMyApplicationsService';

const viewMyApplicationsController = Router();
const viewPath = 'features/generalApplication/view-applications';
const backLinkUrl = 'test'; // TODO: add url
const baseUrl: string = config.get<string>('services.generalApplication.url');
const generalApplicationClient = new GeneralApplicationClient(baseUrl);

viewMyApplicationsController.get(GA_VIEW_APPLICATION_URL, (async (req: AppRequest, res: Response, next: NextFunction) => {
  try {
    const claimId = req.params.id;
    const applicationId = req.query.applicationId ? String(req.query.applicationId) : null;
    const lang = req.query.lang ? req.query.lang : req.cookies.lang;
    const ccc = await generalApplicationClient.getApplication(req, applicationId);
    console.log(ccc);
    const summaryRows =await getApplicationSections(claimId, ccc, lang);
    res.render(viewPath, {backLinkUrl, summaryRows });
  } catch (error) {
    next(error);
  }
}) as RequestHandler);

export default viewMyApplicationsController;
