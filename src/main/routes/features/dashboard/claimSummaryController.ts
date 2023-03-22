import {NextFunction, Router} from 'express';
import config from 'config';
import {getLatestUpdateContent} from 'services/features/dashboard/claimSummary/latestUpdateService';
import {getDocumentsContent} from 'services/features/dashboard/claimSummaryService';
import {AppRequest} from 'models/AppRequest';
import {DEFENDANT_SUMMARY_URL} from '../../urls';
import {CivilServiceClient} from 'client/civilServiceClient';

const claimSummaryViewPath = 'features/dashboard/claim-summary';
const claimSummaryController = Router();
const civilServiceApiBaseUrl = config.get<string>('services.civilService.url');
const civilServiceClient: CivilServiceClient = new CivilServiceClient(civilServiceApiBaseUrl);

claimSummaryController.get([DEFENDANT_SUMMARY_URL], async (req, res, next: NextFunction) => {
  try {
    const claimId = req.params.id;
    const claim = await civilServiceClient.retrieveClaimDetails(claimId, <AppRequest>req);
    console.log("---------- CLAIM FROM SUMMARY ----------")
    // console.log(claim)
    console.log(claim.statementOfMeans)
    if (claim && !claim.isEmpty()) {
      const latestUpdateContent = getLatestUpdateContent(claimId, claim);
      const documentsContent = getDocumentsContent(claim, claimId);
      res.render(claimSummaryViewPath, {claim, claimId, latestUpdateContent, documentsContent});
    }
  } catch (error) {
    next(error);
  }
});

export default claimSummaryController;
