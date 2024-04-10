import {NextFunction, Request, RequestHandler, Response, Router} from 'express';
import {DASHBOARD_CLAIMANT_URL, DEFENDANT_SUMMARY_URL, VIEW_MEDIATION_SETTLEMENT_AGREEMENT_DOCUMENT} from 'routes/urls';
import {ViewDocumentsSection} from 'models/commons/viewDocumentsSectionBuilder';
import {caseNumberPrettify} from 'common/utils/stringUtils';
import {constructResponseUrlWithIdParams} from 'common/utils/urlFormatter';
import {Claim} from 'models/claim';
import {AppRequest} from 'models/AppRequest';
import config from 'config';
import {CivilServiceClient} from 'client/civilServiceClient';

const civilServiceApiBaseUrl = config.get<string>('services.civilService.url');
const civilServiceClient: CivilServiceClient = new CivilServiceClient(civilServiceApiBaseUrl);

const viewMediationSettlementAgreementDocument = Router();
const viewDocuments = 'features/common/viewDocuments';

const renderView = (res: Response, claimId: string, claimAmount: number, isClaimant: boolean, claim: Claim, lang: string): void => {

  const documentsSection = new ViewDocumentsSection(
    'PAGES.VIEW_MEDIATION_SETTLEMENT_AGREEMENT_DOCUMENT.DOCUMENT_TABLE_TITLE',
    claim.mediationAgreement, claim.mediationSettlementAgreedAt,
    claimId,
    lang);

  res.render(viewDocuments, {
    documentsSection: documentsSection,
    pageCaption: 'COMMON.MEDIATION',
    pageTitle: 'PAGES.VIEW_MEDIATION_SETTLEMENT_AGREEMENT_DOCUMENT.PAGE_TITLE',
    claimId: caseNumberPrettify(claimId),
    claimAmount: claimAmount,
    dashboardUrl: constructResponseUrlWithIdParams(claimId, isClaimant ? DASHBOARD_CLAIMANT_URL : DEFENDANT_SUMMARY_URL),
  });
};

viewMediationSettlementAgreementDocument.get(VIEW_MEDIATION_SETTLEMENT_AGREEMENT_DOCUMENT, (async (req: Request, res: Response, next: NextFunction) => {
  try {
    const claimId = req.params.id;
    const lang = req.query.lang ? req.query.lang : req.cookies.lang;
    const claim = await civilServiceClient.retrieveClaimDetails(claimId, <AppRequest>req);
    renderView(res, claimId, claim.totalClaimAmount, claim.isClaimant(), claim, lang);
  } catch (error) {
    next(error);
  }
}) as RequestHandler);

export default viewMediationSettlementAgreementDocument;
