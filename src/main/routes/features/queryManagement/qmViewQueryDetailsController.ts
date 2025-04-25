import {NextFunction, Request, RequestHandler, Response, Router} from 'express';
import {
  QM_QUERY_DETAILS_URL,
  BACK_URL
} from 'routes/urls';
import { Claim } from 'models/claim';
import { AppRequest } from 'models/AppRequest';
import config from 'config';
import { CivilServiceClient } from 'client/civilServiceClient';
import {QueryListItem, ViewQueriesService} from 'services/features/queryManagement/viewQueriesService';

const civilServiceApiBaseUrl = config.get<string>('services.civilService.url');
const civilServiceClient: CivilServiceClient = new CivilServiceClient(civilServiceApiBaseUrl);

const qmViewQueryDetailsController = Router();
const viewQueriesPath = 'features/queryManagement/qm-view-query-details-template';

const renderView = async (res: Response, claimId: string, claim: Claim, lang: string, selectedQueryItem: QueryListItem): Promise<void> => {
  const backLinkUrl = BACK_URL;

  res.render(viewQueriesPath, {
    claimId,
    selectedQueryItem,
    pageTitle: 'PAGES.QM.VIEW_QUERY.PAGE_TITLE',
    backLinkUrl
  });
};

qmViewQueryDetailsController.get(QM_QUERY_DETAILS_URL, (async (req: Request, res: Response, next: NextFunction) => {
  try {
    const claimId = req.params.id;
    const queryId = req.params.queryId;
    const lang = req.query.lang ? req.query.lang : req.cookies.lang;
    const claim = await civilServiceClient.retrieveClaimDetails(claimId, <AppRequest>req);
    const parentQueryItems = ViewQueriesService.buildQueryListItems(claim, lang);
    const selectedQueryItem = parentQueryItems.find(item => item.id === queryId);
    renderView(res, claimId, claim, lang, selectedQueryItem);
  } catch (error) {
    next(error);
  }
}) as RequestHandler);

export default qmViewQueryDetailsController;

