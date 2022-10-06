import * as express from 'express';
import config from 'config';
import {getSubmitConfirmationContent} from '../../../services/features/response/submitConfirmation/submitConfirmationService';
import {CONFIRMATION_URL} from '../../urls';
import {getClaimById} from '../../../modules/utilityService';
import {getLng} from '../../../common/utils/languageToggleUtils';
import {CivilServiceClient} from '../../../app/client/civilServiceClient';
import {AppRequest} from '../../../common/models/AppRequest';
import {formatDateToFullDate} from '../../../common/utils/dateUtils';

const submitComfirmationController = express.Router();
const civilServiceApiBaseUrl = config.get<string>('services.civilService.url');
const civilServiceClient: CivilServiceClient = new CivilServiceClient(civilServiceApiBaseUrl);

submitComfirmationController.get(CONFIRMATION_URL, async (req, res, next: express.NextFunction) => {
  try {
    const claimId = req.params.id;
    const lang = req.query.lang ? req.query.lang : req.cookies.lang;
    const claim = await getClaimById(claimId, req);
    const submittedClaim = await civilServiceClient.retrieveClaimDetails(claimId, <AppRequest>req);
    if (!claim.isEmpty()) {
      claim.respondent1ResponseDate = !submittedClaim.isEmpty() ? submittedClaim.respondent1ResponseDate : undefined;
      const confirmationContent = getSubmitConfirmationContent(claimId, claim, getLng(lang));
      const claimNumber = claim.legacyCaseReference;
      const responseSubmitDate = formatDateToFullDate(claim?.respondent1ResponseDate, getLng(lang));
      res.render('features/response/submit-confirmation', {claimNumber, confirmationContent, responseSubmitDate});
    }
  } catch (error) {
    next(error);
  }
});

export default submitComfirmationController;
