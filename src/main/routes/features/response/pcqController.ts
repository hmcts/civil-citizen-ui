import {NextFunction, Request, Response, Router} from 'express';
import {PCQ_URL} from 'routes/urls';
import {getCaseDataFromStore, saveDraftClaim} from 'modules/draft-store/draftStoreService';
import {Claim} from 'models/claim';

const pcqViewPath = 'features/response/pcq';
const pcqController = Router();

pcqController.get(PCQ_URL, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const claim: Claim = await getCaseDataFromStore(req.params.id);

    claim.pcqPageSeen = true;
    await saveDraftClaim(claim.id, claim);
    res.render(pcqViewPath);
  } catch (error) {
    next(error);
  }
});

export default pcqController;
