import {
  DASHBOARD_CLAIMANT_URL,
  DEFENDANT_SUMMARY_URL,
  EVIDENCE_UPLOAD_DOCUMENTS_URL,
} from 'routes/urls';
import {NextFunction, Request, RequestHandler, Response, Router} from 'express';
import {AppRequest} from 'models/AppRequest';
import config from 'config';
import {CivilServiceClient} from 'client/civilServiceClient';
import {caseNumberPrettify} from 'common/utils/stringUtils';
import {getEvidenceUploadContent} from 'services/features/dashboard/evidenceUploadDocumentsService';

const evidenceUploadDocumentsController = Router();
const civilServiceApiBaseUrl = config.get<string>('services.civilService.url');
const civilServiceClient: CivilServiceClient = new CivilServiceClient(civilServiceApiBaseUrl);
const evidenceUploadDocumentsViewPath = 'features/caseProgression/evidence-upload-documents';

evidenceUploadDocumentsController.get(EVIDENCE_UPLOAD_DOCUMENTS_URL, (async (req:Request, res:Response, next: NextFunction) => {
  try {
    const claimId = req.params.id;
    const lang = req.query.lang ? req.query.lang : req.cookies.lang;
    const claim = await civilServiceClient.retrieveClaimDetails(claimId, <AppRequest>req);

    const dashboardUrl = claim.isClaimant()
      ? DASHBOARD_CLAIMANT_URL.replace(':id', claimId)
      : DEFENDANT_SUMMARY_URL.replace(':id', claimId);

    const documentSections = getEvidenceUploadContent(claim, lang);

    res.render(evidenceUploadDocumentsViewPath,
      {documentSections,
        pageCaption: 'PAGES.DASHBOARD.HEARINGS.HEARING',
        pageTitle: 'COMMON.VIEW_DOCUMENTS',
        claimId: caseNumberPrettify(claimId),
        claimAmount: claim.totalClaimAmount,
        dashboardUrl: dashboardUrl,
      },
    );
  } catch (error) {
    next(error);
  }
})as RequestHandler);

export default evidenceUploadDocumentsController;
