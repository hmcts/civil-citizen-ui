import * as express from 'express';
import {
  DQ_PHONE_OR_VIDEO_HEARING_URL,
  DQ_UNAVAILABLE_FOR_HEARING,
} from '../../urls';
import {GenericForm} from '../../../common/form/models/genericForm';
import {constructResponseUrlWithIdParams} from '../../../common/utils/urlFormatter';
import {
  getDirectionQuestionnaire,
  saveDirectionQuestionnaire,
} from '../../../services/features/directionsQuestionnaire/directionQuestionnaireService';
import {WhyUnavailableForHearing} from '../../../common/models/directionsQuestionnaire/hearing/whyUnavailableForHearing';

const whyUnavailableForHearingController = express.Router();
const whyUnavailableForHearingViewPath = 'features/directionsQuestionnaire/why-unavailable-for-hearing';
const dqPropertyName = 'whyUnavailableForHearing';
const dqParentName = 'hearing';

function renderView(form: GenericForm<WhyUnavailableForHearing>, res: express.Response): void {
  //TO DO: Change the hardcoded 22 to the correct number of days (To be calculated on the page "Are there any dates in
  // the next 12 months when you, your experts or your witnesses cannot attend a hearing?")
  res.render(whyUnavailableForHearingViewPath, {form, days:22});
}

whyUnavailableForHearingController.get(DQ_UNAVAILABLE_FOR_HEARING, async (req: express.Request, res: express.Response, next: express.NextFunction) => {
  try {

    const directionQuestionnaire = await getDirectionQuestionnaire(req.params.id);
    const whyUnavailableForHearing = directionQuestionnaire.hearing?.whyUnavailableForHearing ?
      directionQuestionnaire.hearing.whyUnavailableForHearing : new WhyUnavailableForHearing();
    renderView(new GenericForm(whyUnavailableForHearing), res);
  } catch (error) {
    next(error);
  }
});

whyUnavailableForHearingController.post(DQ_UNAVAILABLE_FOR_HEARING, async (req: express.Request, res: express.Response, next: express.NextFunction) => {
  try {
    const claimId = req.params.id;
    const whyUnavailableForHearing = new GenericForm(new WhyUnavailableForHearing(req.body.reason));
    whyUnavailableForHearing.validateSync();

    if (whyUnavailableForHearing.hasErrors()) {
      renderView(whyUnavailableForHearing, res);
    } else {
      await saveDirectionQuestionnaire(claimId, whyUnavailableForHearing.model, dqPropertyName, dqParentName);
      res.redirect(constructResponseUrlWithIdParams(claimId, DQ_PHONE_OR_VIDEO_HEARING_URL));
    }
  } catch (error) {
    next(error);
  }
});

export default whyUnavailableForHearingController;
