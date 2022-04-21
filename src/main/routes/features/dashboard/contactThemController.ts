import * as express from 'express';
import {CITIZEN_CONTACT_THEM_URL} from '../../urls';

import {getDraftClaimFromStore} from '../../../modules/draft-store/draftStoreService';
import {Claim} from '../../../common/models/claim';

const citizenContactThemViewPath = 'features/dashboard/contact-them';
const contactThemController = express.Router();

function renderView(form: Claim, res: express.Response): void {
  res.render(citizenContactThemViewPath, {form: form});
}

contactThemController.get(CITIZEN_CONTACT_THEM_URL, async (req, res) => {
  try {
    const claim = await getDraftClaimFromStore(req.params.id);
    renderView(claim, res);
  } catch (error) {
    res.status(500).send({error: error.message});
  }
});

export default contactThemController;
