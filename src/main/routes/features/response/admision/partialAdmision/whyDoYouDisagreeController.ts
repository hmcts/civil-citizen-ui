import * as express from 'express';
import {WhyDoYouDisagree} from '../../../../../common/form/models/admission/partialAdmission/whyDoYouDisagree';
import {
  getWhyDoYouDisagreeForm,
  saveWhyDoYouDisagreeData,
} from '../../../../../modules/admission/partialAdmission/whyDoYouDisagreeService';
import {constructResponseUrlWithIdParams} from '../../../../../common/utils/urlFormatter';
import {CITIZEN_WHY_DO_YOU_DISAGREE_URL} from '../../../../urls';

const whyDoYouDisagreeController = express.Router();
const whyDoYouDisagreeViewPath = 'features/response/admission/partialAdmission/why-do-you-disagree';

function renderView(form: WhyDoYouDisagree, res: express.Response) {
  res.render(whyDoYouDisagreeViewPath, {form: form});
}

function redirectToNextPage(claimId: string, form: WhyDoYouDisagree, res: express.Response) {
  if (form.text) {
    res.redirect(constructResponseUrlWithIdParams(claimId, ''));
  } else {
    res.redirect(constructResponseUrlWithIdParams(claimId, ''));
  }
}

whyDoYouDisagreeController.get(CITIZEN_WHY_DO_YOU_DISAGREE_URL, async (req, res) => {
  try {
    const form = await getWhyDoYouDisagreeForm(req.params.id);
    renderView(form, res);
  } catch (error) {
    res.status(500).send({error: error.message});
  }
});

whyDoYouDisagreeController.post(CITIZEN_WHY_DO_YOU_DISAGREE_URL, async (req, res) => {
  const form = new WhyDoYouDisagree(req.body);
  try {
    //await validateForm(form);
    //if (form.hasErrors()) {
    //  renderView(form, res);
    // } else {
    await saveWhyDoYouDisagreeData(req.params.id, form);
    redirectToNextPage(req.params.id, form, res);
    // }
  } catch (error) {
    res.status(500).send({error: error.message});
  }

});

export default whyDoYouDisagreeController;
