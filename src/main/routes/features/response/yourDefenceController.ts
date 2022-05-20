import * as express from 'express';
import {CITIZEN_TIMELINE_URL, RESPONSE_YOUR_DEFENCE_URL} from '../../urls';
import {getYourDefence, saveYourDefence} from '../../../modules/yourDefenceService';
import {getclaimantName} from '../../../modules/rejectAllOfClaimService';
import {constructResponseUrlWithIdParams} from '../../../common/utils/urlFormatter';
import {GenericForm} from '../../../common/form/models/genericForm';

import {Defence} from '../../../common/form/models/defence';

const yourDefenceViewPath = 'features/response/your-defence';
const yourDefenceController = express.Router();
let claimantName = '';

yourDefenceController.get(RESPONSE_YOUR_DEFENCE_URL, async (req: express.Request, res: express.Response) => {
  try {
    const defence = await getYourDefence(req.params.id);
    claimantName = await getclaimantName(req.params.id);

    const form = new GenericForm(defence);
    res.render(yourDefenceViewPath, {
      form,
      claimantName: claimantName,
    });
  } catch (error) {
    res.status(500).send({error: error.message});
  }
});

yourDefenceController.post(RESPONSE_YOUR_DEFENCE_URL, async (req: express.Request, res: express.Response) => {
  try {
    const claimId = req.params.id;
    const defence = new Defence(req.body.text);
    const form = new GenericForm(defence);
    form.validateSync();
    if (form.hasErrors()) {
      res.render(yourDefenceViewPath, {
        form,
        claimantName: claimantName,
      });
    } else {
      await saveYourDefence(claimId, defence);
      res.redirect(constructResponseUrlWithIdParams(claimId, CITIZEN_TIMELINE_URL));

    }
  } catch (error) {
    res.status(500).send({error: error.message});
  }
});

export default yourDefenceController;
