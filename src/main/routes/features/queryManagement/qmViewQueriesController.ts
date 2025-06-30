import {NextFunction, Request, RequestHandler, Response, Router} from 'express';
import {
  DASHBOARD_CLAIMANT_URL, DEFENDANT_SUMMARY_URL,
  QM_VIEW_QUERY_URL,
} from 'routes/urls';
import { Claim } from 'models/claim';
import { AppRequest } from 'models/AppRequest';
import config from 'config';
import { CivilServiceClient } from 'client/civilServiceClient';
import {constructResponseUrlWithIdParams} from 'common/utils/urlFormatter';
import {ViewQueriesService} from 'services/features/queryManagement/viewQueriesService';
import {ViewObjects} from 'form/models/queryManagement/viewQuery';
import {getNotifications} from 'services/dashboard/dashboardService';
import {ClaimantOrDefendant} from 'models/partyType';

const civilServiceApiBaseUrl = config.get<string>('services.civilService.url');
const civilServiceClient: CivilServiceClient = new CivilServiceClient(civilServiceApiBaseUrl);

const qmViewQueriesController = Router();
const viewQueriesPath = 'features/queryManagement/qm-view-queries-template';

const renderView = async (res: Response, claimId: string, claim: Claim, lang: string): Promise<void> => {

  const parentQueryItems:ViewObjects[] = ViewQueriesService.buildQueryListItems(claim, lang);

  res.render(viewQueriesPath, {
    claimId,
    parentQueryItems,
    pageTitle: 'PAGES.QM.VIEW_QUERY.PAGE_TITLE',
    dashboardUrl: constructResponseUrlWithIdParams(claimId, claim.isClaimant() ? DASHBOARD_CLAIMANT_URL : DEFENDANT_SUMMARY_URL),
  });
};

async function recordNotificationClickForQueryResponse(claim: Claim, claimId: string, req: Request, lang: any) {
  const caseRole = claim.isClaimant() ? ClaimantOrDefendant.CLAIMANT : ClaimantOrDefendant.DEFENDANT;
  const dashboardNotifications = await getNotifications(claimId, claim, caseRole, req as AppRequest, lang);
  if (dashboardNotifications) {
    const qmNotif = dashboardNotifications.items.filter(item => item.descriptionEn.includes('The court has responded to the message you sent.')
      || item.descriptionEn.includes('There has been a message sent on your case.'));
    if (qmNotif.length == 1) {
      const qmNotifId = qmNotif[0].id;
      await civilServiceClient.recordClick(qmNotifId, <AppRequest>req);
    }
  }
}

qmViewQueriesController.get(QM_VIEW_QUERY_URL, (async (req: Request, res: Response, next: NextFunction) => {
  try {
    const claimId = req.params.id;
    const lang = req.query.lang ? req.query.lang : req.cookies.lang;
    const claim = await civilServiceClient.retrieveClaimDetails(claimId, <AppRequest>req);
    await recordNotificationClickForQueryResponse(claim, claimId, req, lang);
    await renderView(res, claimId, claim, lang);
  } catch (error) {
    next(error);
  }
}) as RequestHandler);

export default qmViewQueriesController;

