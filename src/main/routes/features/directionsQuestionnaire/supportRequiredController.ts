import * as express from 'express';
import {constructResponseUrlWithIdParams} from '../../../common/utils/urlFormatter';
import {CLAIM_TASK_LIST_URL, SUPPORT_REQUIRED_URL} from '../../urls';
import {GenericForm} from '../../../common/form/models/genericForm';
import {
  LanguageSupportItem,
  OtherSupportItem,
  SignLanguageSupportItem,
  SupportRequired,
} from '../../../common/models/directionsQuestionnaire/supportRequired';
import {
  getSupportRequired,
  saveSupportRequired,
} from '../../../services/features/directionsQuestionnaire/supportRequiredService';
import {boolean} from 'boolean';

const supportRequiredController = express.Router();
const supportRequiredViewPath = 'features/directionsQuestionnaire/support-required';

supportRequiredController.get(SUPPORT_REQUIRED_URL, async (req, res) => {
  try {
    const supportRequired = await getSupportRequired(req.params.id);
    const form = new GenericForm(supportRequired);
    res.render(supportRequiredViewPath, {form});
  } catch (error) {
    res.status(500).send({error: error.message});
  }
});

supportRequiredController.post(SUPPORT_REQUIRED_URL, async (req, res) => {
  try {
    const claimId = req.params.id;
    const languageSelected = boolean(req.body.declared.includes('languageSelected'));
    const signLanguageSelected = boolean(req.body.declared.includes('signLanguageSelected'));
    console.log(req.body.declared);
    console.log(req.body.languageInterpreted);
    const disabledAccessSelected = boolean(req.body.declared.includes('disabledAccessSelected'));
    const hearingLoopSelected = boolean(req.body.declared.includes('hearingLoopSelected'));
    const otherSupportSelected = boolean(req.body.declared.includes('otherSupportSelected'));
    const languageSupportItem = new LanguageSupportItem(languageSelected, req.body.languageInterpreted);
    const signLanguageSupportItem = new SignLanguageSupportItem(signLanguageSelected, req.body.signLanguageInterpreted);
    const otherSupportItem = new OtherSupportItem(otherSupportSelected, req.body.otherSupport);
    const supportRequired = new SupportRequired(languageSupportItem, signLanguageSupportItem, hearingLoopSelected, disabledAccessSelected, otherSupportItem);
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

export default supportRequiredController;
