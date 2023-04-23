import {NextFunction, Router} from 'express';
import config from 'config';
import {getDocumentsContent} from 'services/features/dashboard/claimSummaryService';
import {AppRequest} from 'models/AppRequest';
import {DEFENDANT_SUMMARY_URL} from '../../urls';
import {CivilServiceClient} from 'client/civilServiceClient';
import { getLatestUpdateContentCaseProgression} from 'services/features/dashboard/claimSummary/latestUpdate/caseProgression/caseProgressionlatestUpdateService';
import {isCaseProgressionV1Enable} from '../../../app/auth/launchdarkly/launchDarklyClient';
import {getLatestUpdateContent} from 'services/features/dashboard/claimSummary/latestUpdateService';

const claimSummaryViewPath = 'features/dashboard/claim-summary';
const claimSummaryController = Router();
const civilServiceApiBaseUrl = config.get<string>('services.civilService.url');
const civilServiceClient: CivilServiceClient = new CivilServiceClient(civilServiceApiBaseUrl);

claimSummaryController.get([DEFENDANT_SUMMARY_URL], async (req, res, next: NextFunction) => {
  try {
    const claimId = req.params.id;
    const claim = await civilServiceClient.retrieveClaimDetails(claimId, <AppRequest>req);
    if (claim && !claim.isEmpty()) {
      const latestUpdateContent = getLatestUpdateContent(claimId, claim);
      const documentsContent = getDocumentsContent(claim, claimId);
      if(await isCaseProgressionV1Enable()) {
        getLatestUpdateContentCaseProgression(claimId, claim).forEach(items => latestUpdateContent.push(items));
      }
      res.render(claimSummaryViewPath, {claim, claimId, latestUpdateContent, documentsContent});
    }
  } catch (error) {
    next(error);
  }
});

export default claimSummaryController;
