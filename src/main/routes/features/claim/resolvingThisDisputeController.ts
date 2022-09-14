import * as express from 'express';
import {CLAIM_RESOLVING_DISPUTE_URL} from '../../urls';

const resolvingThisDisputeController = express.Router();
const resolvingThisDisputePath = 'features/claim/resolving-this-dispute';

resolvingThisDisputeController.get(CLAIM_RESOLVING_DISPUTE_URL, async (req:express.Request, res:express.Response) => {
  res.render(resolvingThisDisputePath);
});

export default resolvingThisDisputeController;
