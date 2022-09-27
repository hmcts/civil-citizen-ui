import * as express from 'express';
import {GenericForm} from '../../../common/form/models/genericForm';
import {DQ_OTHER_WITNESSES_URL,DQ_OTHER_WITNESSES_AVAILABILITY_DATES_FOR_HEARING_URL} from '../../urls';
import {OtherWitnesses} from '../../../common/models/directionsQuestionnaire/otherWitnesses/otherWitnesses'; //INIT_ROW_COUNT
import {OtherWitnessItems} from '../../../common/models/directionsQuestionnaire/otherWitnesses/otherWitnessItems';
import {
  getOtherWitnesses,
  saveOtherWitnesses,
} from '../../../../main/services/features/directionsQuestionnaire/otherWitnessesService';
import {constructResponseUrlWithIdParams} from '../../../common/utils/urlFormatter';

const otherWitnessesController = express.Router();
const otherWitnessesViewPath = 'features/directionsQuestionnaire/otherWitnesses/other-witnesses';

function renderView(form: GenericForm<OtherWitnesses>, res: express.Response): void {
  res.render(otherWitnessesViewPath, {form});
}

otherWitnessesController.get(DQ_OTHER_WITNESSES_URL, async (req, res, next: express.NextFunction) => {
  try {
    const form = new GenericForm(await getOtherWitnesses(req.params.id));
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
        await saveOtherWitnesses(req.params.id, form.model);
        res.redirect(constructResponseUrlWithIdParams(req.params.id, DQ_OTHER_WITNESSES_AVAILABILITY_DATES_FOR_HEARING_URL));
      }
    } catch (error) {
      next(error);
    }
  });

function getOtherWitnessDetailsForm(req: express.Request): OtherWitnessItems[] {
  return req.body.witnessItems.map((item: OtherWitnessItems) => {
    return new OtherWitnessItems(item);
  });
}

export default otherWitnessesController;
