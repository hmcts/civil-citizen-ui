import {NextFunction, Request, Response, Router} from 'express';
import {CLAIMANT_RESPONSE_REVIEW_DEFENDANTS_RESPONSE_URL, CLAIMANT_RESPONSE_TASK_LIST_URL} from '../../../routes/urls';
import {getCaseDataFromStore} from '../../../modules/draft-store/draftStoreService';
import {Claim} from '../../../common/models/claim';
import {constructResponseUrlWithIdParams} from '../../../common/utils/urlFormatter';
import {formatDateToFullDate} from '../../../common/utils/dateUtils';

const reviewDefendantsResponseController = Router();

reviewDefendantsResponseController.get(CLAIMANT_RESPONSE_REVIEW_DEFENDANTS_RESPONSE_URL, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const claimId = req.params.id;
    const claim: Claim = await getCaseDataFromStore(claimId);
    const continueLink = constructResponseUrlWithIdParams(claimId, CLAIMANT_RESPONSE_TASK_LIST_URL);
    const paymentDate = formatDateToFullDate(claim.paymentDate, req.query.lang ? req.query.lang : req.cookies.lang);
    // TODO: set proper link
    const downloadResponseLink = '#';
    console.log('claim ', claim);
    res.render('features/claimantResponse/review-defendants-response', {claim, continueLink, downloadResponseLink, paymentDate});
  } catch (error) {
    next(error);
  }
});

export default reviewDefendantsResponseController;
