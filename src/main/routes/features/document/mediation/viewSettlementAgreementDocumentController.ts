import {NextFunction, Request, RequestHandler, Response, Router} from 'express';
import config from 'config';
import {CivilServiceClient} from 'client/civilServiceClient';
import {VIEW_MEDIATION_SETTLEMENT_AGREEMENT_DOCUMENT} from 'routes/urls';
import {AppRequest} from 'models/AppRequest';
import {ViewDocumentsSection} from 'models/commons/viewDocumentsSectionBuilder';
import {caseNumberPrettify} from 'common/utils/stringUtils';
import {Claim} from 'models/claim';
import {DocumentType} from 'models/document/documentType';

const viewMediationSettlementAgreementDocument = Router();
const civilServiceApiBaseUrl = config.get<string>('services.civilService.url');
const civilServiceClient: CivilServiceClient = new CivilServiceClient(civilServiceApiBaseUrl, true);
const viewDocuments = 'features/common/viewDocuments';

const renderView = (res: Response, claimId: string, claim: Claim, lang: string): void => {
  const documents = [
    {
      id: '1',
      value: {
        createdBy: 'cui',
        documentType: DocumentType.MEDIATION_AGREEMENT,
        documentLink:  {
          document_url: 'url1',
          document_filename: 'filename1.pdf',
          document_binary_url: 'documents/123/binary',
        },
        documentName: 'documentName',
        createdDatetime: new Date(Date.now()),
        documentSize: 1,
      },
    },
  ];

  const documentsSection = new ViewDocumentsSection('Mediation Settlement Agreement', documents).mapperDocumentsToView(lang);

  res.render(viewDocuments, {
    documentsSection: documentsSection,
    pageCaption: 'COMMON.MEDIATION',
    pageTitle: 'PAGES.VIEW_MEDIATION_SETTLEMENT_AGREEMENT_DOCUMENT.PAGE_TITLE',
    claimId: caseNumberPrettify(claimId),
    claimAmount: 1500, //TODO see why totalClaimAmount is empty
  });
};

viewMediationSettlementAgreementDocument.get(VIEW_MEDIATION_SETTLEMENT_AGREEMENT_DOCUMENT, (async (req: Request, res: Response, next: NextFunction) => {
  try {
    const claimId = req.params.id;
    const lang = req.query.lang ? req.query.lang : req.cookies.lang;
    const claim = await civilServiceClient.retrieveClaimDetails(claimId, <AppRequest>req);
    console.log(claim);
    renderView(res, claimId, claim, lang);
  } catch (error) {
    next(error);
  }
}) as RequestHandler);
export default viewMediationSettlementAgreementDocument;
