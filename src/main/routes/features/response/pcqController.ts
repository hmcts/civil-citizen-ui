import {NextFunction, Request, Response, Router} from 'express';
import {PCQ_URL} from 'routes/urls';
import {getCaseDataFromStore} from 'modules/draft-store/draftStoreService';
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

    claim.pcqPageSeen = req.body.test;
    console.log(req.body.text);

    if(req.body.test === YesNoUpperCamelCase.YES) {
      console.log('TUEEEEE');
    } else {
      console.log('false');
    }

  } catch (error) {
    next(error);
  }
});

export default pcqController;
