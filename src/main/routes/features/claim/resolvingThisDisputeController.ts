import {NextFunction, Request, Response, Router} from 'express';
import {CLAIMANT_TASK_LIST_URL, CLAIM_RESOLVING_DISPUTE_URL} from '../../urls';
import {AppRequest} from 'common/models/AppRequest';
import {saveResolvingDispute} from 'services/features/claim/resolvingDisputeService';

const resolvingThisDisputeController = Router();
const resolvingThisDisputePath = 'features/claim/resolving-this-dispute';

resolvingThisDisputeController.get(CLAIM_RESOLVING_DISPUTE_URL, async (req: Request, res: Response) => {
  res.render(resolvingThisDisputePath);
});

resolvingThisDisputeController.post(CLAIM_RESOLVING_DISPUTE_URL, async (req: AppRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const userId = req.session?.user?.id;
    await saveResolvingDispute(userId);
    res.redirect(CLAIMANT_TASK_LIST_URL);
  } catch (error) {
    next(error);
  }
});

export default resolvingThisDisputeController;
