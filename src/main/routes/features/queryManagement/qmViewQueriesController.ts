import {NextFunction, Request, RequestHandler, Response, Router} from 'express';
import {
  BACK_URL,
  QM_VIEW_QUERY_URL
} from 'routes/urls';
import {Claim} from 'models/claim';
import {AppRequest} from 'models/AppRequest';
import config from 'config';
import {CivilServiceClient} from 'client/civilServiceClient';
import {
  getClaimantDocuments,
} from 'services/features/dashboard/ordersAndNoticesService';

const civilServiceApiBaseUrl = config.get<string>('services.civilService.url');
const civilServiceClient: CivilServiceClient = new CivilServiceClient(civilServiceApiBaseUrl);

const qmViewQueriesController = Router();
const viewQueriesPath = 'features/queryManagement/qm-view-queries-template';

const renderView = async (res: Response, claimId: string, claim: Claim, lang: string): Promise<void> => {

  const claimantDocuments = await getClaimantDocuments(claim, claimId, lang);
  const pageHeaders = {
    heading: 'PAGES.QM.VIEW_QUERY.PAGE_TITLE',
    caption: 'PAGES.QM.VIEW_QUERY.PAGE_TITLE',
    pageTitle: 'PAGES.QM.VIEW_QUERY.PAGE_TITLE',
  };
  const backLinkUrl = BACK_URL;

  res.render(viewQueriesPath, {
    claimantDocuments: claimantDocuments,
    backLinkUrl,
    pageHeaders
  });
};

qmViewQueriesController.get(QM_VIEW_QUERY_URL, (async (req: Request, res: Response, next: NextFunction) => {
  try {
    const claimId = req.params.id;
    const lang = req.query.lang ? req.query.lang : req.cookies.lang;
    const claim = await civilServiceClient.retrieveClaimDetails(claimId, <AppRequest>req);
    renderView(res, claimId, claim, lang);
  } catch (error) {
    next(error);
  }
}) as RequestHandler);

export default qmViewQueriesController;
