import * as express from 'express';
import {DETERMINATION_WITHOUT_HEARING_URL, SUPPORT_REQUIRED_URL} from '../../urls';
import {DeterminationWithoutHearing} from '../../../common/models/directionsQuestionnaire/determinationWithoutHearing';
import {GenericForm} from '../../../common/form/models/genericForm';
import {
  getDeterminationWithoutHearing, getDeterminationWithoutHearingForm, saveDeterminationWithoutHearing,
} from '../../../services/features/directionsQuestionnaire/determinationWithoutHearingService';
import {constructResponseUrlWithIdParams} from '../../../common/utils/urlFormatter';

const determinationWithoutHearingController = express.Router();
const determinationWithoutHearingViewPath = 'features/directionsQuestionnaire/determination-without-hearing';

function renderView (form: GenericForm<DeterminationWithoutHearing>, res: express.Response): void {
  const determinationWithoutHearing = Object.assign(form);
  determinationWithoutHearing.option = form.model.isDeterminationWithoutHearing;

  res.render(determinationWithoutHearingViewPath, {form: determinationWithoutHearing});
}

determinationWithoutHearingController
  .get(DETERMINATION_WITHOUT_HEARING_URL, async (req, res, next) => {
    try {
      renderView(new GenericForm(await getDeterminationWithoutHearing(req.params.id)), res);
    } catch (error) {
      next(error);
    }
  });

determinationWithoutHearingController
  .post(DETERMINATION_WITHOUT_HEARING_URL, async (req, res, next) => {
    try {
      const claimId = req.params.id;
      const determinationWithoutHearingForm = getDeterminationWithoutHearingForm(req.body.isDeterminationWithoutHearing, req.body.reasonForHearing);
      const form = new GenericForm(determinationWithoutHearingForm);
      form.validateSync();

      if (form.hasErrors()) {
        renderView(form, res);
      } else {
        await saveDeterminationWithoutHearing(claimId, determinationWithoutHearingForm);
        res.redirect(constructResponseUrlWithIdParams(claimId, SUPPORT_REQUIRED_URL));
      }
    } catch (error) {
      next(error);
    }
  });

export default determinationWithoutHearingController;
