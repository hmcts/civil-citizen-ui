import {NextFunction, Router} from 'express';
//import config from 'config';
import {getLatestUpdateContent} from '../../../services/features/dashboard/claimSummary/latestUpdateService';
import {getDocumentsContent} from '../../../services/features/dashboard/claimSummaryService';
//import {AppRequest} from '../../../common/models/AppRequest';
import {DEFENDANT_SUMMARY_URL} from '../../urls';
import {getCaseDataFromStore} from 'modules/draft-store/draftStoreService';
import {
  getSummaryTestContent,
  getTableTestContent,
} from 'services/features/response/submitConfirmation/submitConfirmationBuilder/admissionSubmitConfirmationContent';
//import {CivilServiceClient} from '../../../app/client/civilServiceClient';

const claimSummaryViewPath = 'features/dashboard/claim-summary';
const claimSummaryController = Router();
//const civilServiceApiBaseUrl = config.get<string>('services.civilService.url');
//const civilServiceClient: CivilServiceClient = new CivilServiceClient(civilServiceApiBaseUrl);

claimSummaryController.get([DEFENDANT_SUMMARY_URL], async (req, res, next: NextFunction) => {
  try {
    const claimId = req.params.id;
    const claim = await getCaseDataFromStore(claimId);
    if (claim && !claim.isEmpty()) {
      const latestUpdateContent = getLatestUpdateContent(claimId, claim);
      const documentsContent = getDocumentsContent(claim, claimId);
      const testSummary = getSummaryTestContent(claim, 'en');
      const testTable = getTableTestContent(claim, 'en');
      res.render(claimSummaryViewPath, {claim, claimId, latestUpdateContent, documentsContent, testSummary, testTable});
    }
  } catch (error) {
    next(error);
  }
});

export default claimSummaryController;
