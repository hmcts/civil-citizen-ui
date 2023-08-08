import {NextFunction, Router} from 'express';
import config from 'config';
import {
  getLatestUpdateContent,
} from 'services/features/dashboard/claimSummary/latestUpdateService';
import {AppRequest} from 'models/AppRequest';
import {CASE_DOCUMENT_DOWNLOAD_URL, CLAIMANT_SUMMARY_URL} from '../../urls';
import {CivilServiceClient} from 'client/civilServiceClient';
import {isCaseProgressionV1Enable} from '../../../app/auth/launchdarkly/launchDarklyClient';
import {
  getCaseProgressionLatestUpdates,
} from 'services/features/dashboard/claimSummary/latestUpdate/caseProgression/caseProgressionLatestUpdateService';
import {saveDocumentsToExistingClaim} from 'services/caseDocuments/documentService';
import {getDocumentsContent, getEvidenceUploadContent} from 'services/features/dashboard/claimSummaryService';
import {DocumentType} from 'models/document/documentType';
import {getSystemGeneratedCaseDocumentIdByType} from 'models/document/systemGeneratedCaseDocuments';

const claimSummaryViewPath = 'features/dashboard/claim-summary';
const claimSummaryClaimantController = Router();
const civilServiceApiBaseUrl = config.get<string>('services.civilService.url');
const civilServiceClient: CivilServiceClient = new CivilServiceClient(civilServiceApiBaseUrl);

claimSummaryClaimantController.get([CLAIMANT_SUMMARY_URL], async (req, res, next: NextFunction) => {
  try {
    const claimId = req.params.id;
    const lang = req.query.lang ? req.query.lang : req.cookies.lang;
    const claim = await civilServiceClient.retrieveClaimDetails(claimId, <AppRequest>req);
    if (claim && !claim.isEmpty()) {
      await saveDocumentsToExistingClaim(claimId, claim);
      let latestUpdateContent = getLatestUpdateContent(claimId, claim, lang);
      let documentsContent = getDocumentsContent(claim, claimId);
      const caseProgressionEnabled = await isCaseProgressionV1Enable();
      if (caseProgressionEnabled && claim.hasCaseProgressionHearingDocuments()) {
        latestUpdateContent = [];
        documentsContent = [];
        const lang = req?.query?.lang ? req.query.lang : req?.cookies?.lang;
        getCaseProgressionLatestUpdates(claim, lang, false)
          .forEach(items => latestUpdateContent.push(items));
        documentsContent = getEvidenceUploadContent(claim);
      }

      const responseDetailsUrl = claim.getDocumentDetails(DocumentType.DEFENDANT_DEFENCE) ? CASE_DOCUMENT_DOWNLOAD_URL.replace(':id', claimId).replace(':documentId', getSystemGeneratedCaseDocumentIdByType(claim.systemGeneratedCaseDocuments, DocumentType.DEFENDANT_DEFENCE)) : undefined;
      res.render(claimSummaryViewPath, {claim, claimId, latestUpdateContent, documentsContent, caseProgressionEnabled, responseDetailsUrl});
    }
  } catch (error) {
    next(error);
  }
});

export default claimSummaryClaimantController;
