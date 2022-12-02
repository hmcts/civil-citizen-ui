import {Router, Response} from 'express';
import {constructResponseUrlWithIdParams} from '../../../common/utils/urlFormatter';
import {
  DQ_COURT_LOCATION_URL, 
  SUPPORT_REQUIRED_URL,
} from '../../urls';
import {GenericForm} from '../../../common/form/models/genericForm';
import {saveDirectionQuestionnaire} from '../../../services/features/directionsQuestionnaire/directionQuestionnaireService';
import {
  generatePeopleListWithSelectedValues,
  getSupportRequired,
  getSupportRequiredForm,
} from '../../../services/features/directionsQuestionnaire/supportRequiredService';
import {SupportRequiredList} from 'common/models/directionsQuestionnaire/supportRequired';

const supportRequiredController = Router();
const supportRequiredViewPath = 'features/directionsQuestionnaire/support-required-list';
const dqPropertyName = 'supportRequiredList';
const dqParentName = 'hearing';

async function renderView(form: GenericForm<SupportRequiredList>, claimId: string, lang: string, res: Response) {
  const selectedNames = form.model?.items?.map(item => item.fullName);
  const peopleLists = await generatePeopleListWithSelectedValues(claimId, selectedNames, lang);
  res.render(supportRequiredViewPath, {form, peopleLists});
}

supportRequiredController.get(SUPPORT_REQUIRED_URL, async (req, res, next) => {
  try {
    const lang = req.query.lang ? req.query.lang : req.cookies.lang;
    const supportRequiredList = await getSupportRequired(req.params.id);
    const form = new GenericForm(supportRequiredList);
    renderView(form, req.params.id, lang, res);
  } catch (error) {
    next(error);
  }
});

supportRequiredController.post(SUPPORT_REQUIRED_URL, async (req, res, next) => {
  try {
    const claimId = req.params.id;
    const supportRequiredList = getSupportRequiredForm(req);
    const form = new GenericForm(supportRequiredList);
    form.validateSync();
    if (form.hasErrors()) {
      const lang = req.query.lang ? req.query.lang : req.cookies.lang;
      renderView(form, claimId, lang, res);
    } else {
      await saveDirectionQuestionnaire(claimId, form.model, dqPropertyName, dqParentName);
      res.redirect(constructResponseUrlWithIdParams(claimId, DQ_COURT_LOCATION_URL));
    }
  } catch (error) {
    next(error);
  }
});

export default supportRequiredController;
