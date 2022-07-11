import express from 'express';
import {Dependants} from '../../../../../common/form/models/statementOfMeans/dependants/dependants';
import {
  CHILDREN_DISABILITY_URL,
  CITIZEN_DEPENDANTS_EDUCATION_URL,
  CITIZEN_DEPENDANTS_URL,
  CITIZEN_OTHER_DEPENDANTS_URL,
} from '../../../../urls';
import {GenericForm} from '../../../../../common/form/models/genericForm';
import dependantsService from '../../../../../services/features/response/statementOfMeans/dependants/dependantsService';
import {hasDisabledChildren} from '../../../../../services/features/response/statementOfMeans/dependants/childrenDisabilityService';
import {constructResponseUrlWithIdParams} from '../../../../../common/utils/urlFormatter';

const residenceViewPath = 'features/response/statementOfMeans/dependants/dependants';

const dependantsController = express.Router();
dependantsController
  .get(
    CITIZEN_DEPENDANTS_URL,
    async (req: express.Request, res: express.Response, next: express.NextFunction) => {
      try {
        const dependants: Dependants = await dependantsService.getDependants(req.params.id);
        res.render(residenceViewPath, {form: new GenericForm(dependants)});
      } catch (error) {
        next(error);
      }
    })
  .post(
    CITIZEN_DEPENDANTS_URL,
    async (req: express.Request, res: express.Response, next: express.NextFunction) => {
      const dependants = dependantsService.buildDependants(req.body.declared, req.body.under11,
        req.body.between11and15, req.body.between16and19);
      const form: GenericForm<Dependants> = dependantsService.validateDependants(dependants);

      if (form.hasErrors() || form.hasNestedErrors()) {
        res.render(residenceViewPath, {form});
      } else {
        try {
          const claim = await dependantsService.saveDependants(req.params.id, dependants);
          if (dependants.hasChildrenBetween16and19()) {
            res.redirect(constructResponseUrlWithIdParams(req.params.id, CITIZEN_DEPENDANTS_EDUCATION_URL));
          } else if (hasDisabledChildren(claim)) {
            res.redirect(constructResponseUrlWithIdParams(req.params.id, CHILDREN_DISABILITY_URL));
          } else {
            res.redirect(constructResponseUrlWithIdParams(req.params.id, CITIZEN_OTHER_DEPENDANTS_URL));
          }
        } catch (error) {
          next(error);
        }
      }
    });

export default dependantsController;
