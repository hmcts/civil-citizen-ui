import {NextFunction, Router} from 'express';
import config from 'config';
import {getSubmitConfirmationContent, getClaimWithExtendedPaymentDeadline} from '../../../services/features/response/submitConfirmation/submitConfirmationService';
import {CONFIRMATION_URL} from '../../urls';
import {getLng} from '../../../common/utils/languageToggleUtils';
import {CivilServiceClient} from '../../../app/client/civilServiceClient';
import {AppRequest} from '../../../common/models/AppRequest';
import {formatDateToFullDate} from '../../../common/utils/dateUtils';
import {responseSubmitDateGuard} from '../../../routes/guards/responseSubmitDateGuard';

const submitConfirmationController = Router();
const civilServiceApiBaseUrl = config.get<string>('services.civilService.url');
const civilServiceClient: CivilServiceClient = new CivilServiceClient(civilServiceApiBaseUrl);

submitConfirmationController.get(CONFIRMATION_URL, responseSubmitDateGuard, async (req, res, next: NextFunction) => {
  try {
    const claimId = req.params.id;
    const lang = req.query.lang ? req.query.lang : req.cookies.lang;
    const submittedClaim = await civilServiceClient.retrieveClaimDetails(claimId, <AppRequest>req);
    if (!submittedClaim.isEmpty()) {
      submittedClaim.respondent1ResponseDate = !submittedClaim.isEmpty() ? submittedClaim.respondent1ResponseDate : undefined;
      const respondentPaymentDeadline =  await getClaimWithExtendedPaymentDeadline(submittedClaim, <AppRequest>req);
      const confirmationContent = getSubmitConfirmationContent(claimId, submittedClaim, getLng(lang), respondentPaymentDeadline);
      const claimNumber = submittedClaim.legacyCaseReference;
      const responseSubmitDate = formatDateToFullDate(submittedClaim?.respondent1ResponseDate, getLng(lang));
      res.render('features/response/submit-confirmation', {claimNumber, confirmationContent, responseSubmitDate});
    }
  } catch (error) {
    next(error);
  }
});

export default submitConfirmationController;
