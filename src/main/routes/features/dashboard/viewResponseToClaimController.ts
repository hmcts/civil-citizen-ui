import {NextFunction, Request, RequestHandler, Response, Router} from 'express';
import {
  DASHBOARD_CLAIMANT_URL,
  DEFENDANT_SUMMARY_URL,
  VIEW_ORDERS_AND_NOTICES_URL,
  VIEW_RESPONSE_TO_CLAIM,
} from 'routes/urls';
import {caseNumberPrettify} from 'common/utils/stringUtils';
import {constructResponseUrlWithIdParams} from 'common/utils/urlFormatter';
import {Claim} from 'models/claim';
import {AppRequest} from 'models/AppRequest';
import config from 'config';
import {CivilServiceClient} from 'client/civilServiceClient';
import {
  mapperDefendantResponseToDocumentView,
} from 'common/mappers/documentViewMapper';
import {ResponseType} from 'form/models/responseType';

const civilServiceApiBaseUrl = config.get<string>('services.civilService.url');
const civilServiceClient: CivilServiceClient = new CivilServiceClient(civilServiceApiBaseUrl);

const viewResponseToClaimController = Router();
const viewResponseToClaim = 'features/dashboard/view-response-to-claim';

const renderView = (res: Response, claimId: string, claim: Claim, lang: string): void => {
  let responseType;

  const documentsSection = mapperDefendantResponseToDocumentView(
    'PAGES.VIEW_RESPONSE_TO_THE_CLAIM.TABLE_TITLE',
    'PAGES.VIEW_RESPONSE_TO_THE_CLAIM.DOCUMENT_LABEL',
    claim,
    claimId,
    lang);
  switch (claim.respondent1.responseType) {
    case ResponseType.PART_ADMISSION:
      responseType = 'PAGES.CITIZEN_RESPONSE_TYPE.ADMIT_PART';
      break;
    case ResponseType.FULL_ADMISSION:
      responseType = 'PAGES.CITIZEN_RESPONSE_TYPE.ADMIT_ALL';
      break;
    case ResponseType.FULL_DEFENCE:
      responseType = 'PAGES.CITIZEN_RESPONSE_TYPE.REJECT_ALL';
      break;
    case ResponseType.COUNTER_CLAIM:
      responseType = 'PAGES.CITIZEN_RESPONSE_TYPE.COUNTER_CLAIM';
      break;
    default:
      responseType = null;
  }

  res.render(viewResponseToClaim, {
    documentsSection: documentsSection,
    pageCaption: 'PAGES.VIEW_RESPONSE_TO_THE_CLAIM.PAGE_CAPTION',
    pageTitle: 'PAGES.VIEW_RESPONSE_TO_THE_CLAIM.PAGE_TITLE',
    claimId: caseNumberPrettify(claimId),
    claimAmount: claim.totalClaimAmount,
    dashboardUrl: constructResponseUrlWithIdParams(claimId, claim.isClaimant() ? DASHBOARD_CLAIMANT_URL : DEFENDANT_SUMMARY_URL),
    responseType: responseType,
    ordersAndNoticesUrl:  constructResponseUrlWithIdParams(claimId, VIEW_ORDERS_AND_NOTICES_URL),
  });
};

viewResponseToClaimController.get(VIEW_RESPONSE_TO_CLAIM, (async (req: Request, res: Response, next: NextFunction) => {
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
