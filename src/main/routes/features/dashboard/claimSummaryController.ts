import {NextFunction, Router} from 'express';
import config from 'config';
import {
  getLatestUpdateContent,
} from 'services/features/dashboard/claimSummary/latestUpdateService';
import {getDocumentsContent, getEvidenceUploadContent} from 'services/features/dashboard/claimSummaryService';
import {AppRequest} from 'models/AppRequest';
import {DEFENDANT_SUMMARY_URL} from '../../urls';
import {CivilServiceClient} from 'client/civilServiceClient';
import {isCaseProgressionV1Enable} from '../../../app/auth/launchdarkly/launchDarklyClient';
import {
  getCaseProgressionLatestUpdates,
} from 'services/features/dashboard/claimSummary/latestUpdate/caseProgression/caseProgressionLatestUpdateService';
const claimSummaryViewPath = 'features/dashboard/claim-summary';
const claimSummaryController = Router();
const civilServiceApiBaseUrl = config.get<string>('services.civilService.url');
const civilServiceClient: CivilServiceClient = new CivilServiceClient(civilServiceApiBaseUrl);

claimSummaryController.get([DEFENDANT_SUMMARY_URL], async (req, res, next: NextFunction) => {
  try {
    const claimId = req.params.id;
    const lang = req.query.lang ? req.query.lang : req.cookies.lang;
    const claim = await civilServiceClient.retrieveClaimDetails(claimId, <AppRequest>req);
    if (claim && !claim.isEmpty()) {
      let latestUpdateContent = getLatestUpdateContent(claimId, claim, lang);
      let documentsContent = getDocumentsContent(claim, claimId);
      const caseProgressionEnabled = await isCaseProgressionV1Enable();
      if (caseProgressionEnabled && claim.hasCaseProgressionHearingDocuments()) {
        latestUpdateContent = [];
        documentsContent = [];
        const lang = req?.query?.lang ? req.query.lang : req?.cookies?.lang;
        getCaseProgressionLatestUpdates(claim, lang)
          .forEach(items => latestUpdateContent.push(items));
        documentsContent = getEvidenceUploadContent(claim);
      }
      res.render(claimSummaryViewPath, {claim, claimId, latestUpdateContent, documentsContent, caseProgressionEnabled});
    }
  } catch (error) {
    next(error);
  }
});

export default claimSummaryController;
