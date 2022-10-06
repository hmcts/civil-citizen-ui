import * as express from 'express';
import {DETERMINATION_WITHOUT_HEARING_URL, EXPERT_GUIDANCE_URL} from '../../urls';
import {
  DeterminationWithoutHearing,
} from '../../../common/models/directionsQuestionnaire/hearing/determinationWithoutHearing';
import {GenericForm} from '../../../common/form/models/genericForm';

import {constructResponseUrlWithIdParams} from '../../../common/utils/urlFormatter';
import {
  getDirectionQuestionnaire,
  saveDirectionQuestionnaire,
} from '../../../services/features/directionsQuestionnaire/directionQuestionnaireService';
import {YesNo} from '../../../common/form/models/yesNo';

const determinationWithoutHearingController = express.Router();
const determinationWithoutHearingViewPath = 'features/directionsQuestionnaire/determination-without-hearing';
const dqPropertyName = 'determinationWithoutHearing';
const dqParentName = 'hearing';

function renderView(form: GenericForm<DeterminationWithoutHearing>, res: express.Response): void {
  res.render(determinationWithoutHearingViewPath, {form});
}

determinationWithoutHearingController
  .get(DETERMINATION_WITHOUT_HEARING_URL, async (req, res, next) => {
    try {
      const directionQuestionnaire = await getDirectionQuestionnaire(req.params.id);
      const determinationWithoutHearing = directionQuestionnaire?.hearing?.determinationWithoutHearing ?
        directionQuestionnaire.hearing.determinationWithoutHearing : new DeterminationWithoutHearing();

      renderView(new GenericForm(determinationWithoutHearing), res);
    } catch (error) {
      next(error);
    }
  });

determinationWithoutHearingController
  .post(DETERMINATION_WITHOUT_HEARING_URL, async (req, res, next) => {
    try {
      const claimId = req.params.id;
      const reasonForHearing = req.body.option === YesNo.NO ? req.body.reasonForHearing : undefined;
      const determinationWithoutHearing = new GenericForm(new DeterminationWithoutHearing(req.body.option, reasonForHearing));
      determinationWithoutHearing.validateSync();

      if (determinationWithoutHearing.hasErrors()) {
        renderView(determinationWithoutHearing, res);
      } else {
        await saveDirectionQuestionnaire(claimId, determinationWithoutHearing.model, dqPropertyName, dqParentName);
        res.redirect(constructResponseUrlWithIdParams(claimId, EXPERT_GUIDANCE_URL));
      }
    } catch (error) {
      next(error);
    }
  });

export default determinationWithoutHearingController;
