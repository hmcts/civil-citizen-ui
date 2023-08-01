import {
  CLAIMANT_TASK_LIST_URL,
  CLAIM_COMPLETING_CLAIM_URL,
} from '../../urls';
import {NextFunction, RequestHandler, Response, Router} from 'express';
import {AppRequest} from 'common/models/AppRequest';
import {saveCompletingClaim} from 'services/features/claim/completingClaimService';

const completingClaimViewPath = 'features/claim/completing-claim';
const completingClaimController = Router();

completingClaimController.get(CLAIM_COMPLETING_CLAIM_URL, (_req, res) => {
  res.render(completingClaimViewPath);
});

completingClaimController.post(CLAIM_COMPLETING_CLAIM_URL, (async (req: AppRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const userId = req.session?.user?.id;
    saveCompletingClaim(userId);
    res.redirect(CLAIMANT_TASK_LIST_URL);
  } catch (error) {
    next(error);
  }
}) as RequestHandler);

export default completingClaimController;
