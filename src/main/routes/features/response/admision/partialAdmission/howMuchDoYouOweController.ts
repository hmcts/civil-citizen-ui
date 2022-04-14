import * as express from 'express';
import {
  HowMuchDoYouOwe,
} from '../../../../../common/form/models/admission/partialAdmission/howMuchDoYouOwe';
import {CITIZEN_OWED_AMOUNT_URL, CLAIM_TASK_LIST_URL} from '../../../../urls';
import {validateForm} from '../../../../../common/form/validators/formValidator';
import {
  getHowMuchDoYouOweForm,
  saveHowMuchDoYouOweData,
} from '../../../../../modules/admission/partialAdmission/howMuchDoYouOweService';
import {constructResponseUrlWithIdParams} from '../../../../../common/utils/urlFormatter';
import { toNumberOrUndefined } from '../../../../../common/utils/numberConverter';

const howMuchDoYouOweViewPath = 'features/response/admission/partialAdmisssion/how-much-do-you-owe';
const howMuchDoYouOweController = express.Router();

function renderView(form: HowMuchDoYouOwe, res: express.Response) {
  res.render(howMuchDoYouOweViewPath, {form: form});
}

howMuchDoYouOweController.get(CITIZEN_OWED_AMOUNT_URL, async (req:express.Request, res:express.Response) => {
  try {
    const form = await getHowMuchDoYouOweForm(req.params.id);
    renderView(form, res);
  } catch (error) {
    res.status(500).send({error: error.message});
  }

});

howMuchDoYouOweController.post(CITIZEN_OWED_AMOUNT_URL, async (req:express.Request, res:express.Response) => {

  try {
    const savedValues = await getHowMuchDoYouOweForm(req.params.id);
    const form = new HowMuchDoYouOwe(toNumberOrUndefined(req.body.amount), savedValues.totalAmount);
    await validateForm(form);
    if (form.hasErrors()) {

      renderView(form, res);
    } else {
      await saveHowMuchDoYouOweData(req.params.id, form);
      res.redirect(constructResponseUrlWithIdParams(req.params.id, CLAIM_TASK_LIST_URL));
    }
  } catch (error) {
    res.status(500).send({error: error.message});
  }
});
export default howMuchDoYouOweController;

