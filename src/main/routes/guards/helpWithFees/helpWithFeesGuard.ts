import {NextFunction, Request, RequestHandler, Response} from 'express';
import {Claim} from 'models/claim';
import {getClaimById} from 'modules/utilityService';
import {constructResponseUrlWithIdParams} from 'common/utils/urlFormatter';
import {DASHBOARD_CLAIMANT_URL} from 'routes/urls';

//TODO: Removed the guard from the controller, but left it in here. As the help with fees pages are generic, they may be called in places where our dashboard driven controls potentially don't work. So keeping it in the code, but please remove once certain it is no longer needed.
export const helpWithFeesGuard = (async (req: Request, res: Response, next: NextFunction) => {
  try {
    const claimId = req.params.id;
    const claim: Claim = await getClaimById(claimId, req);
    claim?.feeTypeHelpRequested ? next() : res.redirect(constructResponseUrlWithIdParams(req.params.id, DASHBOARD_CLAIMANT_URL));
  } catch (error) {
    next(error);
  }
}) as RequestHandler;
