import * as express from 'express';
import {CITIZEN_CONTACT_THEM} from '../../urls';

import {getDraftClaimFromStore} from 'modules/draft-store/draftStoreService';
import {GenericForm} from 'common/form/models/genericForm';
import {Claim} from 'models/claim';

const citizenEmploymentStatusViewPath = 'features/dashboard/contact-them';
const contactThemController = express.Router();

let claim = new Claim();

function renderView(form: GenericForm<Claim>, res: express.Response): void {
  res.render(citizenEmploymentStatusViewPath, {form: form});
}

contactThemController.get(CITIZEN_CONTACT_THEM, async (req, res) => {
  try {
    claim = await getDraftClaimFromStore(req.params.id);
    renderView(new GenericForm(claim), res);
  } catch (error) {
    res.status(500).send({error: error.message});
  }
});

export default contactThemController;
