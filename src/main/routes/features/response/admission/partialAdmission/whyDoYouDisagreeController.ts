import * as express from 'express';
import {WhyDoYouDisagree} from '../../../../../common/form/models/admission/partialAdmission/whyDoYouDisagree';
import {
  getWhyDoYouDisagreeForm,
  saveWhyDoYouDisagreeData,
} from '../../../../../services/features/response/admission/partialAdmission/whyDoYouDisagreeService';
import {constructResponseUrlWithIdParams} from '../../../../../common/utils/urlFormatter';
import {CITIZEN_TIMELINE_URL, CITIZEN_WHY_DO_YOU_DISAGREE_URL} from '../../../../urls';
import {WhyDoYouDisagreeForm} from '../../../../../common/models/whyDoYouDisagreeForm';
import {GenericForm} from '../../../../../common/form/models/genericForm';

const whyDoYouDisagreeController = express.Router();
const whyDoYouDisagreeViewPath = 'features/response/admission/partialAdmission/why-do-you-disagree';
let claimAmount: number;

function renderView(form: GenericForm<WhyDoYouDisagree>, _claimAmount: number, res: express.Response) {
  res.render(whyDoYouDisagreeViewPath, {form: form, claimAmount: _claimAmount});
}

whyDoYouDisagreeController.get(CITIZEN_WHY_DO_YOU_DISAGREE_URL, async (req, res) => {
  try {
    const form = await getWhyDoYouDisagreeForm(req.params.id);
    claimAmount = form.claimAmount;
    renderView(new GenericForm(form.whyDoYouDisagree), claimAmount, res);
  } catch (error) {
    res.status(500).send({error: error.message});
  }
});

whyDoYouDisagreeController.post(CITIZEN_WHY_DO_YOU_DISAGREE_URL, async (req, res) => {
  const whyDoYouDisagree = new WhyDoYouDisagree(req.body.text);
  const whyDoYouDisagreeForm = new WhyDoYouDisagreeForm();
  whyDoYouDisagreeForm.claimAmount = claimAmount;
  whyDoYouDisagreeForm.whyDoYouDisagree = whyDoYouDisagree;
  const form = new GenericForm(whyDoYouDisagree);
  await form.validate();
  try {
    if (form.hasErrors() || form.hasNestedErrors()) {
      renderView(form, whyDoYouDisagreeForm.claimAmount, res);
    } else {
      await saveWhyDoYouDisagreeData(req.params.id, form.model);
      res.redirect(constructResponseUrlWithIdParams(req.params.id, CITIZEN_TIMELINE_URL));
    }
  } catch (error) {
    res.status(500).send({error: error.message});
  }
},
);

export default whyDoYouDisagreeController;
