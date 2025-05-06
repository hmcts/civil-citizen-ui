import {NextFunction, Request, RequestHandler, Response, Router} from 'express';
import {
  QM_QUERY_DETAILS_URL,
  BACK_URL, QM_FOLLOW_UP_MESSAGE,
} from 'routes/urls';
import { Claim } from 'models/claim';
import { AppRequest } from 'models/AppRequest';
import config from 'config';
import { CivilServiceClient } from 'client/civilServiceClient';
import {QueryDetail, ViewQueriesService} from 'services/features/queryManagement/viewQueriesService';
import {CaseState} from 'form/models/claimDetails';

const civilServiceApiBaseUrl = config.get<string>('services.civilService.url');
const civilServiceClient: CivilServiceClient = new CivilServiceClient(civilServiceApiBaseUrl);

const qmViewQueryDetailsController = Router();
const viewQueriesPath = 'features/queryManagement/qm-view-query-details-template';
const finishedClaim = Array.of(CaseState.CASE_DISMISSED, CaseState.CLOSED, CaseState.PROCEEDS_IN_HERITAGE_SYSTEM);

const renderView = async (res: Response, claimId: string, claim: Claim, lang: string, selectedQueryItem: QueryDetail): Promise<void> => {
  const backLinkUrl = BACK_URL;
  const followUpScreen = QM_FOLLOW_UP_MESSAGE.replace(':id', claimId);
  const isClaimOffLine = finishedClaim.includes(claim.ccdState);
  res.render(viewQueriesPath, {
    pageTitle: 'PAGES.QM.VIEW_QUERY_DETAILS.PAGE_TITLE',
    selectedQueryItem,
    isClaimOffLine,
    followUpScreen,
    claimId,
    backLinkUrl,
  });
};

qmViewQueryDetailsController.get(QM_QUERY_DETAILS_URL, (async (req: Request, res: Response, next: NextFunction) => {
  try {
    const claimId = req.params.id;
    const queryId = req.params.queryId;
    const lang = req.query.lang ? req.query.lang : req.cookies.lang;
    const claim = await civilServiceClient.retrieveClaimDetails(claimId, <AppRequest>req);
    const selectedQueryItem = ViewQueriesService.buildQueryListItemsByQueryId(claim, queryId, lang);
    await renderView(res, claimId, claim, lang, selectedQueryItem);
  } catch (error) {
    next(error);
  }
}) as RequestHandler);

export default qmViewQueryDetailsController;
