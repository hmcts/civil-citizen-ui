import {NextFunction, Request, RequestHandler, Response, Router} from 'express';
import {
  DASHBOARD_CLAIMANT_URL,
  DEFENDANT_SUMMARY_URL,
  VIEW_MEDIATION_DOCUMENTS,
} from 'routes/urls';
import {caseNumberPrettify} from 'common/utils/stringUtils';
import {constructResponseUrlWithIdParams} from 'common/utils/urlFormatter';
import {Claim} from 'models/claim';
import {AppRequest} from 'models/AppRequest';
import config from 'config';
import {CivilServiceClient} from 'client/civilServiceClient';
import {
  mapperMediationDocumentsToDocumentView,
} from 'common/mappers/documentViewMapper';
import {
  getClaimantMediationDocuments, getDefendantMediationDocuments,
} from 'services/features/document/mediation/mediationDocumentService';

const civilServiceApiBaseUrl = config.get<string>('services.civilService.url');
const civilServiceClient: CivilServiceClient = new CivilServiceClient(civilServiceApiBaseUrl);

const viewMediationDocuments = Router();
const viewDocuments = 'features/common/viewDocuments';

const renderView = (res: Response, claimId: string, claim: Claim, lang: string): void => {
  const claimantMediationDocuments = getClaimantMediationDocuments(claim);
  const defendantMediationDocuments = getDefendantMediationDocuments(claim);
  const mediationDocuments = Array.of(
    mapperMediationDocumentsToDocumentView(
      'PAGES.VIEW_MEDIATION_DOCUMENTS.CLAIMANT_TABLE_TITLE',
      claimantMediationDocuments,
      claimId,
      lang),
    mapperMediationDocumentsToDocumentView(
      'PAGES.VIEW_MEDIATION_DOCUMENTS.DEFENDANT_TABLE_TITLE',
      defendantMediationDocuments,
      claimId,
      lang),
  );

  res.render(viewDocuments, {
    documentsSection: mediationDocuments,
    pageCaption: 'COMMON.MEDIATION',
    pageTitle: 'PAGES.VIEW_MEDIATION_DOCUMENTS.PAGE_TITLE',
    claimId: caseNumberPrettify(claimId),
    claimAmount: claim.totalClaimAmount,
    isCarm: true,
    dashboardUrl: constructResponseUrlWithIdParams(claimId, claim.isClaimant() ? DASHBOARD_CLAIMANT_URL : DEFENDANT_SUMMARY_URL),
  });
};

viewMediationDocuments.get(VIEW_MEDIATION_DOCUMENTS, (async (req: Request, res: Response, next: NextFunction) => {
  try {
    const claimId = req.params.id;
    const lang = req.query.lang ? req.query.lang : req.cookies.lang;
    const claim = await civilServiceClient.retrieveClaimDetails(claimId, <AppRequest>req);
    renderView(res, claimId, claim, lang);
  } catch (error) {
    next(error);
  }
}) as RequestHandler);

export default viewMediationDocuments;
