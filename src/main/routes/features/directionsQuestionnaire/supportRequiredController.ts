import * as express from 'express';
import {constructResponseUrlWithIdParams} from '../../../common/utils/urlFormatter';
import {CLAIM_TASK_LIST_URL, SUPPORT_REQUIRED_URL} from '../../urls';
import {GenericForm} from '../../../common/form/models/genericForm';
import {SupportRequired} from '../../../common/models/directionsQuestionnaire/supportRequired';
import {
  getSupportRequired,
  saveSupportRequired,
} from '../../../services/features/directionsQuestionnaire/supportRequiredService';
import {boolean} from 'boolean';

const expertGuidanceController = express.Router();
const supportRequiredViewPath = 'features/directionsQuestionnaire/support-required';

expertGuidanceController.get(SUPPORT_REQUIRED_URL, async (req, res) => {
  try {
    const supportRequired = await getSupportRequired(req.params.id);
    const form = new GenericForm(supportRequired);
    res.render(supportRequiredViewPath, {form});
  } catch (error) {
    res.status(500).send({error: error.message});
  }
});

expertGuidanceController.post(SUPPORT_REQUIRED_URL, async (req, res) => {
  try {
    const claimId = req.params.id;
    const languageSelected = boolean(req.body.declared.languageSelected);
    const signLanguageSelected = boolean(req.body.declared.signLanguageSelected);
    const disabledAccessSelected = boolean(req.body.declared.disabledAccessSelected);
    const hearingLoopSelected = boolean(req.body.declared.hearingLoopSelected);
    const otherSupportSelected = boolean(req.body.declared.otherSupportSelected);
    const supportRequired = new SupportRequired(languageSelected, req.body.languageInterpreted, signLanguageSelected, req.body.signLanguageInterpreted, hearingLoopSelected, disabledAccessSelected, otherSupportSelected, req.body.otherSupport);
    const form = new GenericForm(supportRequired);
    form.validateSync();
    if (form.hasErrors()) {
      res.render(supportRequiredViewPath, {form});
    } else {
      await saveSupportRequired(claimId, supportRequired);
      res.redirect(constructResponseUrlWithIdParams(req.params.id, CLAIM_TASK_LIST_URL));
    }
  } catch (error) {
    res.status(500).send({error: error.message});
  }
});

export default expertGuidanceController;
