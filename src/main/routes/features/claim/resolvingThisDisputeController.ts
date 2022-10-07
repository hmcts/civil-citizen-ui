import {Request, Response, Router} from 'express';
import {CLAIM_RESOLVING_DISPUTE_URL} from '../../urls';

const resolvingThisDisputeController = Router();
const resolvingThisDisputePath = 'features/claim/resolving-this-dispute';

resolvingThisDisputeController.get(CLAIM_RESOLVING_DISPUTE_URL, async (req: Request, res: Response) => {
  res.render(resolvingThisDisputePath);
});

export default resolvingThisDisputeController;
