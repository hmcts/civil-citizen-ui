import {NextFunction, Request, Response, Router} from 'express';
import {CHILDREN_DISABILITY_URL, CITIZEN_OTHER_DEPENDANTS_URL} from '../../../../urls';
import {
  getChildrenDisability,
  saveChildrenDisability,
} from '../../../../../services/features/response/statementOfMeans/dependants/childrenDisabilityService';
import {constructResponseUrlWithIdParams} from '../../../../../common/utils/urlFormatter';
import {GenericForm} from '../../../../../common/form/models/genericForm';
import {GenericYesNo} from '../../../../../common/form/models/genericYesNo';
import {AppRequest} from 'common/models/AppRequest';
import {generateRedisKey} from 'modules/draft-store/draftStoreService';

const childrenDisabilityViewPath = 'features/response/statementOfMeans/dependants/children-disability';
const childrenDisabilityController = Router();

childrenDisabilityController
  .get(CHILDREN_DISABILITY_URL,
    async (req: Request, res: Response, next: NextFunction) => {
      try {
        const childrenDisability: GenericYesNo = await getChildrenDisability(generateRedisKey(<AppRequest>req));
        const form = new GenericForm(childrenDisability);
        res.render(childrenDisabilityViewPath,{form});
      } catch (error) {
        next(error);
      }
    })
  .post(
    CHILDREN_DISABILITY_URL,
    async (req: Request, res: Response, next: NextFunction) => {
      const childrenDisability: GenericYesNo = new GenericYesNo(req.body.option);
      const form: GenericForm<GenericYesNo> = new GenericForm(childrenDisability);
      await form.validate();

      if (form.hasErrors()) {
        res.render(childrenDisabilityViewPath, {form});
      } else {
        try {
          await saveChildrenDisability(generateRedisKey(<AppRequest>req), childrenDisability);
          res.redirect(constructResponseUrlWithIdParams(req.params.id, CITIZEN_OTHER_DEPENDANTS_URL));
        }
        catch (error) {
          next(error);
        }
      }
    });

export default childrenDisabilityController;
