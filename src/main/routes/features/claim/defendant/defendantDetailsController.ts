import {NextFunction, Response, Router} from 'express';
import {AppRequest} from '../../../../common/models/AppRequest';
import {
  CLAIM_DEFENDANT_COMPANY_DETAILS,
  CLAIM_DEFENDANT_INDIVIDUAL_DETAILS,
  CLAIM_DEFENDANT_ORGANISATION_DETAILS,
  CLAIM_DEFENDANT_SOLE_TRADER_DETAILS,
} from '../../../urls';

const defendantDetailsController = Router();
const defendantDetailsViewPath = 'features/claim/defendant/defendant-details';
const detailsURLs = [
  CLAIM_DEFENDANT_COMPANY_DETAILS,
  CLAIM_DEFENDANT_INDIVIDUAL_DETAILS,
  CLAIM_DEFENDANT_ORGANISATION_DETAILS,
  CLAIM_DEFENDANT_SOLE_TRADER_DETAILS,
];

defendantDetailsController.get(detailsURLs, async (req: AppRequest, res: Response, next: NextFunction) => {
  try {
    console.log('req', req);
    // const caseId = req.session?.user?.id;
    // const defendantAddress =
    res.render(defendantDetailsViewPath);
  } catch (error) {
    next(error);
  }
});

export default defendantDetailsController;
