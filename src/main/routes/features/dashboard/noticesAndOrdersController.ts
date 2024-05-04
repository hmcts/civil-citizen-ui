import {NextFunction, Request, RequestHandler, Response, Router} from 'express';
import {
  DASHBOARD_CLAIMANT_URL,
  DEFENDANT_SUMMARY_URL,
  NOTICES_AND_ORDERS_URL,
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
} from 'services/features/dashboard/noticesAndOrdersService';

const civilServiceApiBaseUrl = config.get<string>('services.civilService.url');
const civilServiceClient: CivilServiceClient = new CivilServiceClient(civilServiceApiBaseUrl);

const viewResponseToClaimController = Router();
const viewResponseToClaim = 'features/dashboard/notices-and-orders';

const renderView = (res: Response, claimId: string, claim: Claim, lang: string): void => {

  const claimantDocuments = getClaimantDocuments(claim, claimId, lang);
  const defendantDocuments = getDefendantDocuments(claim, claimId, lang);
  const courtDocuments = getCourtDocuments(claim, claimId, lang);

  res.render(viewResponseToClaim, {
    claimantDocuments: claimantDocuments,
    defendantDocuments: defendantDocuments,
    courtDocuments: courtDocuments,
    pageCaption: 'PAGES.NOTICES_AND_ORDERS.PAGE_CAPTION',
    pageTitle: 'PAGES.NOTICES_AND_ORDERS.PAGE_TITLE',
    claimId: caseNumberPrettify(claimId),
    claimAmount: claim.totalClaimAmount,
    dashboardUrl: constructResponseUrlWithIdParams(claimId, claim.isClaimant() ? DASHBOARD_CLAIMANT_URL : DEFENDANT_SUMMARY_URL),
  });
};

viewResponseToClaimController.get(NOTICES_AND_ORDERS_URL, (async (req: Request, res: Response, next: NextFunction) => {
  try {
    const claimId = req.params.id;
    const lang = req.query.lang ? req.query.lang : req.cookies.lang;
    const claim = await civilServiceClient.retrieveClaimDetails(claimId, <AppRequest>req);
    renderView(res, claimId, claim, lang);
  } catch (error) {
    next(error);
  }
}) as RequestHandler);

export default viewResponseToClaimController;
