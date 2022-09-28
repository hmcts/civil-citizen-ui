import * as express from 'express';
import {GenericForm} from '../../../common/form/models/genericForm';
import {DQ_OTHER_WITNESSES_URL,DQ_OTHER_WITNESSES_AVAILABILITY_DATES_FOR_HEARING_URL} from '../../urls';
import {OtherWitnesses} from '../../../common/models/directionsQuestionnaire/witnesses/otherWitnesses';
import {OtherWitnessItems} from '../../../common/models/directionsQuestionnaire/witnesses/otherWitnessItems';
import {constructResponseUrlWithIdParams} from '../../../common/utils/urlFormatter';
import {saveDirectionQuestionnaire,getDirectionQuestionnaire} from '../../../../main/services/features/directionsQuestionnaire/directionQuestionnaireService';

const otherWitnessesController = express.Router();
const otherWitnessesViewPath = 'features/directionsQuestionnaire/otherWitnesses/other-witnesses';

function renderView(form: GenericForm<OtherWitnesses>, res: express.Response): void {
  res.render(otherWitnessesViewPath, {form});
}

otherWitnessesController.get(DQ_OTHER_WITNESSES_URL, async (req, res, next: express.NextFunction) => {
  try {
    const form = new GenericForm(await getOtherWitnesses(req));
    res.render(otherWitnessesViewPath, {form});
  } catch (error) {
    next(error);
  }
});

otherWitnessesController.post(DQ_OTHER_WITNESSES_URL,
  async (req, res, next: express.NextFunction) => {
    try {
      const form: GenericForm<OtherWitnesses> = new GenericForm(new OtherWitnesses(req.body.option, getOtherWitnessDetailsForm(req)));
      form.validateSync();
      if (form.hasErrors()) {
        renderView(form, res);
      } else {
        const witnesses = { otherWitnesses: form.model };
        await saveDirectionQuestionnaire(req.params.id,witnesses,'witnesses');
        res.redirect(constructResponseUrlWithIdParams(req.params.id, DQ_OTHER_WITNESSES_AVAILABILITY_DATES_FOR_HEARING_URL));
      }
    } catch (error) {
      next(error);
    }
  });

const getOtherWitnesses = async (req: express.Request) => {
  const directionQuestionnaire = await getDirectionQuestionnaire(req.params.id);
  if (directionQuestionnaire.witnesses) {
    const witnesses = directionQuestionnaire.witnesses;
    witnesses.otherWitnesses.witnessItems = witnesses.otherWitnesses.witnessItems.map(item => new OtherWitnessItems(item));
    return new OtherWitnesses(witnesses.otherWitnesses.option, witnesses.otherWitnesses.witnessItems);
  }
  return new OtherWitnesses();
};

function getOtherWitnessDetailsForm(req: express.Request): OtherWitnessItems[] {
  return req.body.witnessItems.map((item: OtherWitnessItems) => {
    return new OtherWitnessItems(item);
  });
}

export default otherWitnessesController;
