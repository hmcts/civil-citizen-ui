import {NextFunction, RequestHandler, Router} from 'express';
import {CONFIRM_YOU_HAVE_BEEN_PAID_URL} from '../../urls';
import {getConfirmYouHaveBeenPaidContents} from 'services/features/judgmentOnline/confirmYouHaveBeenPaidContents';
import {getClaimById} from 'modules/utilityService';

const confirmYouHaveBeenPaidViewPath = 'features/judgmentOnline/confirm-you-have-been-paid';
const confirmYouHaveBeenPaidController = Router();

confirmYouHaveBeenPaidController.get(CONFIRM_YOU_HAVE_BEEN_PAID_URL, (async (req, res, next: NextFunction) => {
  try {
    const claimId = req.params.id;
    const claim = await getClaimById(claimId, req);
    res.render(confirmYouHaveBeenPaidViewPath, {confirmYouHaveBeenPaid:getConfirmYouHaveBeenPaidContents(claimId, claim)});
  } catch (error) {
    next(error);
  }
}) as RequestHandler);

export default confirmYouHaveBeenPaidController;
