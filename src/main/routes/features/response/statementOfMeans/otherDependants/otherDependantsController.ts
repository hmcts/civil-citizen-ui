import * as express from 'express';
import {
  CITIZEN_OTHER_DEPENDANTS_URL,
  CITIZEN_EMPLOYMENT_URL,
  CITIZEN_CARER_URL,
} from '../../../../urls';
import {OtherDependants} from '../../../../../common/form/models/statementOfMeans/otherDependants';
import {OtherDependantsService} from '../../../../../services/features/response/statementOfMeans/otherDependants/otherDependantsService';
import {constructResponseUrlWithIdParams} from '../../../../../common/utils/urlFormatter';
import {Claim} from '../../../../../common/models/claim';
import {getCaseDataFromStore} from '../../../../../modules/draft-store/draftStoreService';
import {GenericForm} from '../../../../../common/form/models/genericForm';

const citizenOtherDependantsViewPath = 'features/response/statementOfMeans/otherDependants/other-dependants';
const otherDependantsController = express.Router();
const otherDependantsService = new OtherDependantsService();

function renderView(form: GenericForm<OtherDependants>, res: express.Response): void {
  res.render(citizenOtherDependantsViewPath, {form});
}

otherDependantsController.get(CITIZEN_OTHER_DEPENDANTS_URL, async (req, res, next: express.NextFunction) => {
  try {
    const response = await otherDependantsService.getOtherDependants(req.params.id);
    const otherDependants = response
      ? new GenericForm(new OtherDependants(response.option, response.numberOfPeople, response.details))
      : new GenericForm(new OtherDependants());
    renderView(otherDependants, res);
  } catch (error) {
    next(error);
  }
});

otherDependantsController.post(CITIZEN_OTHER_DEPENDANTS_URL,
  async (req, res, next: express.NextFunction) => {
    try {
      const form: GenericForm<OtherDependants> = new GenericForm(new OtherDependants(
        req.body.option, req.body.numberOfPeople, req.body.details));
      form.validateSync();
      if (form.hasErrors()) {
        renderView(form, res);
      } else {
        await otherDependantsService.saveOtherDependants(req.params.id, form);
        const claim: Claim = await getCaseDataFromStore(req.params.id);
        if (claim.isDefendantSeverelyDisabledOrDependentsDisabled()) {
          res.redirect(constructResponseUrlWithIdParams(req.params.id, CITIZEN_EMPLOYMENT_URL));
        } else {
          res.redirect(constructResponseUrlWithIdParams(req.params.id, CITIZEN_CARER_URL));
        }
      }
    } catch (error) {
      next(error);
    }
  });

export default otherDependantsController;
