import {NextFunction, RequestHandler, Response, Router} from 'express';
import {EXIT_BREATHING_SPACE_CONFIRMATION_URL} from '../../urls';
import {getClaimById} from 'modules/utilityService';
import {AppRequest} from 'models/AppRequest';

const confirmationController = Router();
const viewPath = 'features/breathingSpace/confirmation';

confirmationController.get(EXIT_BREATHING_SPACE_CONFIRMATION_URL, (async (req: AppRequest, res: Response, next: NextFunction) => {
  try {
    const claimId = req.params.id;
    const claim = await getClaimById(claimId, req);

    res.render(viewPath, {
      claimId,
      claimantName: claim.getClaimantName(),
      defendantName: claim.getDefendantName(),
    });
  } catch (error) {
    next(error);
  }
}) as RequestHandler);

export default confirmationController;
