import {NextFunction, RequestHandler, Router} from 'express';
import config from 'config';
import {
  getLatestUpdateContent,
} from 'services/features/dashboard/claimSummary/latestUpdateService';
import {AppRequest} from 'models/AppRequest';
import {CLAIMANT_SUMMARY_URL} from '../../urls';
import {CivilServiceClient} from 'client/civilServiceClient';
import {isCaseProgressionV1Enable} from '../../../app/auth/launchdarkly/launchDarklyClient';
import {
  getCaseProgressionLatestUpdates,
} from 'services/features/dashboard/claimSummary/latestUpdate/caseProgression/caseProgressionLatestUpdateService';
import {saveDocumentsToExistingClaim} from 'services/caseDocuments/documentService';

const claimSummaryViewPath = 'features/dashboard/claim-summary';
const claimSummaryClaimantController = Router();
const civilServiceApiBaseUrl = config.get<string>('services.civilService.url');
const civilServiceClient: CivilServiceClient = new CivilServiceClient(civilServiceApiBaseUrl);

claimSummaryClaimantController.get([CLAIMANT_SUMMARY_URL], (async (req, res, next: NextFunction) => {
  try {
    const claimId = req.params.id;
    const lang = req.query.lang ? req.query.lang : req.cookies.lang;
    const claim = await civilServiceClient.retrieveClaimDetails(claimId, <AppRequest>req);
    if (claim && !claim.isEmpty()) {
      await saveDocumentsToExistingClaim(claimId, claim);
      let latestUpdateContent = getLatestUpdateContent(claimId, claim, lang);
      const caseProgressionEnabled = await isCaseProgressionV1Enable();
      if (caseProgressionEnabled && claim.hasCaseProgressionHearingDocuments()) {
        latestUpdateContent = [];
        const lang = req?.query?.lang ? req.query.lang : req?.cookies?.lang;
        getCaseProgressionLatestUpdates(claim, lang, true)
          .forEach(items => latestUpdateContent.push(items));
      }
      res.render(claimSummaryViewPath, {claim, claimId, latestUpdateContent, caseProgressionEnabled});
    }
  } catch (error) {
    next(error);
  }
}) as RequestHandler);

export default claimSummaryClaimantController;
