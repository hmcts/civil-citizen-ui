import * as express from 'express';
import {constructResponseUrlWithIdParams} from '../../../common/utils/urlFormatter';
import {CLAIM_TASK_LIST_URL, SUPPORT_REQUIRED_URL} from '../../urls';
import {GenericForm} from '../../../common/form/models/genericForm';
import {Support, SupportRequired, SupportRequiredList} from '../../../common/models/directionsQuestionnaire/supportRequired';
import {
  // getDirectionQuestionnaire,
  saveDirectionQuestionnaire,
} from '../../../services/features/directionsQuestionnaire/directionQuestionnaireService';
import {getSupportRequired, generatePersonList, generatePersonListWithSelected} from '../../../services/features/directionsQuestionnaire/supportRequiredService';
import {getCaseDataFromStore} from '../../../modules/draft-store/draftStoreService';
// import {YesNo} from '../../../common/form/models/yesNo';

const supportRequiredController = express.Router();
const supportRequiredViewPath = 'features/directionsQuestionnaire/support-required-list';
const dqPropertyName = 'supportRequiredList';
const dqParentName = 'hearing';

supportRequiredController.get(SUPPORT_REQUIRED_URL, async (req, res, next: express.NextFunction) => {
  debugger;
  try {
    //TODO change naming
    const data = await getSupportRequired(req.params.id)
    const form = new GenericForm(data[0]);
    res.render(supportRequiredViewPath, {form, nameLists : data[1]});
  } catch (error) {
    next(error);
  }
});

supportRequiredController.post(SUPPORT_REQUIRED_URL, async (req, res, next: express.NextFunction) => {
  try {
    debugger;
    const claimId = req.params.id;
    // TODO : we only need the function to get namelists
    const caseData = await getCaseDataFromStore(claimId);
    // TODO ; insert if condtion with this and the following form process
    // const supportRequiredDetailsDetails = req.body.option === YesNo.YES ? req.body.model.itmes : undefined;

    if (req.body.declared?.length) {
      // TODO : fxi any type
      req.body.declared?.forEach((declared: any, index: number) => {
        if (declared) {
          // tODO : cover scenario with single decalred not array
          Array.isArray(declared) && declared.forEach((supportName: keyof SupportRequired) => {
            if (req.body.model.items[index][supportName]) {
              req.body.model.items[index][supportName] = new Support(supportName.toString(), true, req.body.model.items[index][supportName].content);
            } else {
              req.body.model.items[index][supportName] = new Support(undefined, true);
            }
          });

          if (!Array.isArray(declared)) {
            const supportName: keyof SupportRequired =  declared;
            if (req.body.model.items[index][supportName]) {
              req.body.model.items[index][supportName] = new Support(supportName.toString(), true, req.body.model.items[index][supportName].content);
            } else {
              req.body.model.items[index][supportName] = new Support(undefined, true);
            }
          }
        }
      });
    }

    const form = new GenericForm(new SupportRequiredList(req.body.option, req.body.model.items.map((item:any)=> new SupportRequired(item))));
    form.validateSync();
    if (form.hasErrors()) {
      const providedNames = form.model?.items?.map(item => item.name.toLowerCase());
      const defaultList = generatePersonList(caseData);
      //  TODO : move this logic inside generatePersonListWithSelected
      const nameLists = providedNames ? generatePersonListWithSelected(defaultList, providedNames) : [defaultList];
      res.render(supportRequiredViewPath, {form, nameLists});
    } else {
      await saveDirectionQuestionnaire(claimId, form.model, dqPropertyName, dqParentName);
      res.redirect(constructResponseUrlWithIdParams(claimId, CLAIM_TASK_LIST_URL));
    }
  } catch (error) {
    next(error);
  }
});

export default supportRequiredController;
