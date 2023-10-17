import {Response, Router} from 'express';
import {WhyDoYouDisagree} from '../../../../../common/form/models/admission/partialAdmission/whyDoYouDisagree';
import {constructResponseUrlWithIdParams} from '../../../../../common/utils/urlFormatter';
import {CITIZEN_TIMELINE_URL, CITIZEN_WHY_DO_YOU_DISAGREE_FULL_REJECTION_URL} from '../../../../urls';
import {WhyDoYouDisagreeForm} from '../../../../../common/models/whyDoYouDisagreeForm';
import {GenericForm} from '../../../../../common/form/models/genericForm';
import {ResponseType} from '../../../../../common/form/models/responseType';
import {
  getWhyDoYouDisagreeForm,
  saveWhyDoYouDisagreeData,
} from '../../../../../services/features/response/admission/whyDoYouDisagreeService';
import {AppRequest} from 'common/models/AppRequest';
import {generateRedisKey} from 'modules/draft-store/draftStoreService';

const whyDoYouDisagreeFullRejectionController = Router();
const whyDoYouDisagreeViewPath = 'features/response/admission/why-do-you-disagree';
let claimAmount: number;

function renderView(form: GenericForm<WhyDoYouDisagree>, claimAmount: number, res: Response) {
  res.render(whyDoYouDisagreeViewPath, {form, claimAmount});
}

whyDoYouDisagreeFullRejectionController.get(CITIZEN_WHY_DO_YOU_DISAGREE_FULL_REJECTION_URL, async (req, res) => {
  try {
    const form = await getWhyDoYouDisagreeForm(generateRedisKey(<AppRequest>req), ResponseType.FULL_DEFENCE);
    claimAmount = form.claimAmount;
    renderView(new GenericForm(form.whyDoYouDisagree), claimAmount, res);
  } catch (error) {
    res.status(500).send({error: error.message});
  }
});

whyDoYouDisagreeFullRejectionController.post(CITIZEN_WHY_DO_YOU_DISAGREE_FULL_REJECTION_URL, async (req, res) => {
  const whyDoYouDisagree = new WhyDoYouDisagree(req.body.text);
  const whyDoYouDisagreeForm = new WhyDoYouDisagreeForm();
  whyDoYouDisagreeForm.claimAmount = claimAmount;
  whyDoYouDisagreeForm.whyDoYouDisagree = whyDoYouDisagree;
  const form = new GenericForm(whyDoYouDisagree);
  await form.validate();
  try {
    if (form.hasErrors()) {
      renderView(form, whyDoYouDisagreeForm.claimAmount, res);
    } else {
      await saveWhyDoYouDisagreeData(generateRedisKey(<AppRequest>req), form.model, ResponseType.FULL_DEFENCE);
      res.redirect(constructResponseUrlWithIdParams(req.params.id, CITIZEN_TIMELINE_URL));
    }
  } catch (error) {
    res.status(500).send({error: error.message});
  }
},
);

export default whyDoYouDisagreeFullRejectionController;
