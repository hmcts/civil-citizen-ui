import {NextFunction, Request, RequestHandler, Response, Router} from 'express';
import {DASHBOARD_CLAIMANT_URL, DEFENDANT_SUMMARY_URL, VIEW_MEDIATION_SETTLEMENT_AGREEMENT_DOCUMENT} from 'routes/urls';
import {ViewDocumentsSection} from 'models/commons/viewDocumentsSectionBuilder';
import {caseNumberPrettify} from 'common/utils/stringUtils';
import {constructResponseUrlWithIdParams} from 'common/utils/urlFormatter';
import {getClaimById} from 'modules/utilityService';
import {Claim} from 'models/claim';

const viewMediationSettlementAgreementDocument = Router();
const viewDocuments = 'features/common/viewDocuments';

const renderView = (res: Response, claimId: string, claimAmount: string, isClaimant: boolean, claim: Claim, lang: string): void => {

  const documentsSection = new ViewDocumentsSection(
    'PAGES.VIEW_MEDIATION_SETTLEMENT_AGREEMENT_DOCUMENT.DOCUMENT_TABLE_TITLE',
    claim.mediationAgreement, new Date('2022-09-09'),
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
    //const claim = await civilServiceClient.retrieveClaimDetails(claimId, <AppRequest>req);
    const claim = await getClaimById(claimId, req);
    renderView(res, claimId, claim.formattedTotalClaimAmount(), claim.isClaimant(), claim, lang);
  } catch (error) {
    next(error);
  }
}) as RequestHandler);

export default viewMediationSettlementAgreementDocument;
