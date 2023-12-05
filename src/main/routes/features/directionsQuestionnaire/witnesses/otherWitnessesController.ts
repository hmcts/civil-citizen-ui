import {NextFunction, Response, Router} from 'express';
import {GenericForm} from '../../../../common/form/models/genericForm';
import {
  DQ_DEFENDANT_WITNESSES_URL,
  DQ_NEXT_12MONTHS_CAN_NOT_HEARING_URL,
} from '../../../urls';
import {OtherWitnesses} from '../../../../common/models/directionsQuestionnaire/witnesses/otherWitnesses';
import {constructResponseUrlWithIdParams} from '../../../../common/utils/urlFormatter';
import {
  saveDirectionQuestionnaire,
} from '../../../../services/features/directionsQuestionnaire/directionQuestionnaireService';
import {
  getOtherWitnessDetailsForm,
  getOtherWitnesses,
} from '../../../../services/features/directionsQuestionnaire/otherWitnessesService';
import {generateRedisKey,getCaseDataFromStore} from 'modules/draft-store/draftStoreService';
import {AppRequest} from 'common/models/AppRequest';

const otherWitnessesController = Router();
const otherWitnessesViewPath = 'features/directionsQuestionnaire/witnesses/otherWitnesses/other-witnesses';
const dqPropertyName = 'otherWitnesses';
const dqParentName = 'witnesses';

function renderView(form: GenericForm<OtherWitnesses>, res: Response): void {
  res.render(otherWitnessesViewPath, {form});
}

otherWitnessesController.get(DQ_DEFENDANT_WITNESSES_URL, async (req: AppRequest, res, next: NextFunction) => {
  try {
    const claim = await getCaseDataFromStore(generateRedisKey(req));
    const form = new GenericForm(await getOtherWitnesses(req));
    res.render(otherWitnessesViewPath, {form, isDefendant: claim.isDefendantNotResponded() });
  } catch (error) {
    next(error);
  }
});

otherWitnessesController.post(DQ_DEFENDANT_WITNESSES_URL,
  async (req, res, next: NextFunction) => {
    try {
      const form: GenericForm<OtherWitnesses> = new GenericForm(new OtherWitnesses(req.body.option, getOtherWitnessDetailsForm(req)));
      form.validateSync();
      if (form.hasErrors()) {
        renderView(form, res);
      } else {
        await saveDirectionQuestionnaire(generateRedisKey(<AppRequest>req), form.model, dqPropertyName, dqParentName);
        res.redirect(constructResponseUrlWithIdParams(req.params.id, DQ_NEXT_12MONTHS_CAN_NOT_HEARING_URL));
      }
    } catch (error) {
      next(error);
    }
  });

export default otherWitnessesController;
