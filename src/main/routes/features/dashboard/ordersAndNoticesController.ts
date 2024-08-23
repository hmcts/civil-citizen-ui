import {NextFunction, Request, RequestHandler, Response, Router} from 'express';
import {
  DASHBOARD_CLAIMANT_URL,
  DEFENDANT_SUMMARY_URL,
  VIEW_ORDERS_AND_NOTICES_URL,
} from 'routes/urls';
import {caseNumberPrettify} from 'common/utils/stringUtils';
import {constructResponseUrlWithIdParams} from 'common/utils/urlFormatter';
import {Claim} from 'models/claim';
import {AppRequest} from 'models/AppRequest';
import config from 'config';
import {CivilServiceClient} from 'client/civilServiceClient';
import {
  getClaimantDocuments,
  getCourtDocuments,
  getDefendantDocuments,
} from 'services/features/dashboard/ordersAndNoticesService';

const civilServiceApiBaseUrl = config.get<string>('services.civilService.url');
const civilServiceClient: CivilServiceClient = new CivilServiceClient(civilServiceApiBaseUrl);

const ordersAndNoticesController = Router();
const viewResponseToClaim = 'features/dashboard/orders-and-notices';

const renderView = async (res: Response, claimId: string, claim: Claim, lang: string): Promise<void> => {

  const claimantDocuments = await getClaimantDocuments(claim, claimId, lang);
  const defendantDocuments = await getDefendantDocuments(claim, claimId, lang);
  const courtDocuments = await getCourtDocuments(claim, claimId, lang);

  res.render(viewResponseToClaim, {
    claimantDocuments: claimantDocuments,
    defendantDocuments: defendantDocuments,
    courtDocuments: courtDocuments,
    pageCaption: 'PAGES.ORDERS_AND_NOTICES.PAGE_CAPTION',
    pageTitle: 'PAGES.ORDERS_AND_NOTICES.PAGE_TITLE',
    claimId: caseNumberPrettify(claimId),
    claimAmount: claim.totalClaimAmount,
    dashboardUrl: constructResponseUrlWithIdParams(claimId, claim.isClaimant() ? DASHBOARD_CLAIMANT_URL : DEFENDANT_SUMMARY_URL),
  });
};

ordersAndNoticesController.get(VIEW_ORDERS_AND_NOTICES_URL, (async (req: Request, res: Response, next: NextFunction) => {
  try {
    const claimId = req.params.id;
    const lang = req.query.lang ? req.query.lang : req.cookies.lang;
    const claim = await civilServiceClient.retrieveClaimDetails(claimId, <AppRequest>req);
    renderView(res, claimId, claim, lang);
  } catch (error) {
    next(error);
  }
}) as RequestHandler);

export default ordersAndNoticesController;
