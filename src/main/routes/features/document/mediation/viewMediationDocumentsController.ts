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
import {mapperMediationAgreementToDocumentView} from 'common/mappers/documentViewMapper';

const civilServiceApiBaseUrl = config.get<string>('services.civilService.url');
const civilServiceClient: CivilServiceClient = new CivilServiceClient(civilServiceApiBaseUrl);

const viewMediationDocuments = Router();
const viewDocuments = 'features/common/viewDocuments';

const renderView = (res: Response, claimId: string, claim: Claim, lang: string): void => {

  const mediationDocuments = Array.of(
    mapperMediationAgreementToDocumentView(
      'PAGES.VIEW_MEDIATION_SETTLEMENT_AGREEMENT_DOCUMENT.DOCUMENT_TABLE_TITLE',
      claim.mediationAgreement, claim.mediationSettlementAgreedAt,
      claimId,
      lang),
    mapperMediationAgreementToDocumentView(
      'PAGES.VIEW_MEDIATION_SETTLEMENT_AGREEMENT_DOCUMENT.DOCUMENT_TABLE_TITLE',
      claim.mediationAgreement, claim.mediationSettlementAgreedAt,
      claimId,
      lang),
  );

  res.render(viewDocuments, {
    documentsSection: mediationDocuments,
    pageCaption: 'COMMON.MEDIATION',
    pageTitle: 'PAGES.VIEW_MEDIATION_SETTLEMENT_AGREEMENT_DOCUMENT.PAGE_TITLE',
    claimId: caseNumberPrettify(claimId),
    claimAmount: claim.totalClaimAmount,
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
