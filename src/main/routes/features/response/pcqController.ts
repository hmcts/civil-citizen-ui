import {NextFunction, Request, Response, Router} from 'express';
import {PCQ_URL} from 'routes/urls';
import {getCaseDataFromStore, saveDraftClaim} from 'modules/draft-store/draftStoreService';
import {Claim} from 'models/claim';
import {YesNoUpperCamelCase} from 'form/models/yesNo';

const pcqViewPath = 'features/response/pcq';
const pcqController = Router();

pcqController.get(PCQ_URL, async (req: Request, res: Response, next: NextFunction) => {
  res.render(pcqViewPath, {caseId: req.params.id});
});

pcqController.post(PCQ_URL, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const claim: Claim = await getCaseDataFromStore(req.params.id);

    if(req.body.test === YesNoUpperCamelCase.YES) {
      res.redirect('https://pcq.aat.platform.hmcts.net/offline');
    } else {
      res.redirect('/dashboard');
    }

    claim.pcqPageSeen = req.body.test;
    await saveDraftClaim(claim.id, claim);

  } catch (error) {
    next(error);
  }
});

export default pcqController;
