import * as express from 'express';
import {getSubmitConfirmationContent} from '../../../services/features/response/submitConfirmation/submitConfirmationService';
import {CONFIRMATION_URL} from '../../urls';
import {getClaimById} from '../../../modules/utilityService';
import {getLng} from '../../../common/utils/languageToggleUtils';

const submitComfirmationViewPath = 'features/response/submit-confirmation';
const submitComfirmationController = express.Router();

submitComfirmationController.get(CONFIRMATION_URL, async (req, res, next: express.NextFunction) => {
  try {
    const claimId = req.params.id;
    const lang = req.query.lang ? req.query.lang : req.cookies.lang;
    const claim = await getClaimById(claimId, req);
    if (!claim.isEmpty()) {
      const confirmationContent = getSubmitConfirmationContent(claimId, claim, getLng(lang));
      const claimNumber = claim.legacyCaseReference;
      res.render(
        submitComfirmationViewPath, {
          claimNumber,
          confirmationContent,
        });
    }
  } catch (error) {
    next(error);
  }
});

export default submitComfirmationController;
