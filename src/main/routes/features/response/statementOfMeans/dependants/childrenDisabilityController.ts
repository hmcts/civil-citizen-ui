import * as express from 'express';
import {CHILDREN_DISABILITY_URL, CITIZEN_OTHER_DEPENDANTS_URL} from '../../../../urls';
import {ChildrenDisability} from '../../../../../common/form/models/statementOfMeans/dependants/childrenDisability';
import {
  getChildrenDisability,
  saveChildrenDisability,
} from '../../../../../services/features/response/statementOfMeans/dependants/childrenDisabilityService';
import {constructResponseUrlWithIdParams} from '../../../../../common/utils/urlFormatter';
import {GenericForm} from '../../../../../common/form/models/genericForm';

const childrenDisabilityViewPath = 'features/response/statementOfMeans/dependants/children-disability';
const childrenDisabilityController = express.Router();

childrenDisabilityController
  .get(CHILDREN_DISABILITY_URL,
    async (req: express.Request, res: express.Response, next: express.NextFunction) => {
      try {
        const childrenDisability : ChildrenDisability = await getChildrenDisability(req.params.id);
        const form = new GenericForm(childrenDisability);
        // This is a workaround as the YesNo macro used in the view assumes Form but controller assumes GenericForm
        // TODO: Discard the workaround once the decision Form Vs. GenericForm is made and YesNo macro is adjusted accordingly
        const _form = Object.assign(form);
        _form.option = childrenDisability.option;
        res.render(childrenDisabilityViewPath,{
          form: _form,
        });
      } catch (error) {
        next(error);
      }
    })
  .post(
    CHILDREN_DISABILITY_URL,
    async (req: express.Request, res: express.Response, next: express.NextFunction) => {
      const childrenDisability: ChildrenDisability = new ChildrenDisability(req.body.option);
      const form: GenericForm<ChildrenDisability> = new GenericForm(childrenDisability);
      await form.validate();

      if (form.hasErrors()) {
        res.render(childrenDisabilityViewPath, {
          form: form,
        });
      } else {
        try {
          await saveChildrenDisability(req.params.id, childrenDisability);
          res.redirect(constructResponseUrlWithIdParams(req.params.id, CITIZEN_OTHER_DEPENDANTS_URL));
        }
        catch (error) {
          next(error);
        }
      }
    });

export default childrenDisabilityController;
