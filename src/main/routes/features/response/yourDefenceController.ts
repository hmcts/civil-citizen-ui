import * as express from 'express';
import {CITIZEN_TIMELINE_URL, RESPONSE_YOUR_DEFENCE_URL} from '../../urls';
import {saveYourDefence} from '../../../services/features/response/yourDefenceService';
import {constructResponseUrlWithIdParams} from '../../../common/utils/urlFormatter';
import {GenericForm} from '../../../common/form/models/genericForm';
import {Defence} from '../../../common/form/models/defence';
import {getCaseDataFromStore} from '../../../modules/draft-store/draftStoreService';

const yourDefenceViewPath = 'features/response/your-defence';
const yourDefenceController = express.Router();

yourDefenceController.get(RESPONSE_YOUR_DEFENCE_URL, async (req: express.Request, res: express.Response, next: express.NextFunction) => {
  try {
    const claim = await getCaseDataFromStore(req.params.id);
    const form = new GenericForm(claim);
    res.render(yourDefenceViewPath, {
      form,
      claimantName: claim.getClaimantName(),
    });
  } catch (error) {
    next(error);
  }
});

yourDefenceController.post(RESPONSE_YOUR_DEFENCE_URL, async (req: express.Request, res: express.Response, next: express.NextFunction) => {
  try {
    const claimId = req.params.id;
    const claim = await getCaseDataFromStore(claimId);
    const defence = new Defence(req.body.text);
    const form = new GenericForm(defence);
    form.validateSync();
    if (form.hasErrors()) {
      res.render(yourDefenceViewPath, {
        form,
        claimantName: claim.getClaimantName(),
      });
    } else {
      await saveYourDefence(claim, claimId, defence);
      res.redirect(constructResponseUrlWithIdParams(claimId, CITIZEN_TIMELINE_URL));
    }
  } catch (error) {
    next(error);
  }
});

export default yourDefenceController;
