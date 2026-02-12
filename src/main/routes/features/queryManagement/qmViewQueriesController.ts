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
import {getNotifications} from 'services/dashboard/dashboardService';
import {ClaimantOrDefendant} from 'models/partyType';
import {getTotalAmountWithInterestAndFees} from 'modules/claimDetailsService';

const civilServiceApiBaseUrl = config.get<string>('services.civilService.url');
const civilServiceClient: CivilServiceClient = new CivilServiceClient(civilServiceApiBaseUrl);

const qmViewQueriesController = Router();
const viewQueriesPath = 'features/queryManagement/qm-view-queries-template';

const renderView = async (res: Response, userId: string, claimId: string, claim: Claim, lang: string): Promise<void> => {
  const parentQueryItems = ViewQueriesService.buildQueryListItems(userId, claim, lang);
  res.render(viewQueriesPath, {
    claimId,
    parentQueryItems,
    pageTitle: 'PAGES.QM.VIEW_QUERY.PAGE_TITLE',
    dashboardUrl: constructResponseUrlWithIdParams(claimId, claim.isClaimant() ? DASHBOARD_CLAIMANT_URL : DEFENDANT_SUMMARY_URL),
  });
};

async function recordNotificationClickForQueryResponse(claim: Claim, claimId: string, req: Request, lang: any) {
  const caseRole = claim.isClaimant() ? ClaimantOrDefendant.CLAIMANT : ClaimantOrDefendant.DEFENDANT;
  const totalAmountWithInterestAndFees = (await getTotalAmountWithInterestAndFees(claim)).toString();
  const dashboardNotifications = await getNotifications(claimId, claim, totalAmountWithInterestAndFees, caseRole, req as AppRequest, lang);
  if (dashboardNotifications) {
    const qmNotif = dashboardNotifications.items.filter(item => item.descriptionEn.includes('The court has responded to a message on your case.')
      || item.descriptionEn.includes('There has been a message sent on your case.'));
    if (qmNotif.length == 1) {
      const qmNotifId = qmNotif[0].id;
      await civilServiceClient.recordClick(qmNotifId, <AppRequest>req);
    }
  }
}

qmViewQueriesController.get(QM_VIEW_QUERY_URL, (async (req: AppRequest, res: Response, next: NextFunction) => {
  try {
    const claimId = req.params.id;
    const lang = req.query.lang ? req.query.lang : req.cookies.lang;
    const userId = req.session?.user?.id;
    const claim = await civilServiceClient.retrieveClaimDetails(claimId, <AppRequest>req);
    await recordNotificationClickForQueryResponse(claim, claimId, req, lang);
    await renderView(res, userId, claimId, claim, lang);
  } catch (error) {
    next(error);
  }
}) as RequestHandler);

export default qmViewQueriesController;

