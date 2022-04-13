import * as express from 'express';
import {CITIZEN_ALREADY_PAID_URL} from '../../../../urls';

const alreadyPaidController = express.Router();
const citizenAlreadyPaidViewPath = 'features/response/admission/partialAdmission/already-paid';

function renderView(form: any, res: express.Response): void {
  res.render(citizenAlreadyPaidViewPath, {form});
}

alreadyPaidController.get(CITIZEN_ALREADY_PAID_URL, async (req, res) => {
  try {
    renderView('' , res);
  } catch (error) {
    res.status(500).send({error: error.message});
  }
});

export default alreadyPaidController;
