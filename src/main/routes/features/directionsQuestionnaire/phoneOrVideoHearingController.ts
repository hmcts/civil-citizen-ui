import * as express from 'express';
import {
  DQ_PHONE_OR_VIDEO_HEARING_URL,
  VULNERABILITY_URL,
} from '../../urls';
import {
  getDirectionQuestionnaire,
  saveDirectionQuestionnaire,
} from '../../../services/features/directionsQuestionnaire/directionQuestionnaireService';
import {GenericForm} from '../../../common/form/models/genericForm';
import {constructResponseUrlWithIdParams} from '../../../common/utils/urlFormatter';
import {PhoneOrVideoHearing} from '../../../common/models/directionsQuestionnaire/hearing/phoneOrVideoHearing';
import {YesNo} from '../../../common/form/models/yesNo';

const phoneOrVideoHearingController = express.Router();
const phoneOrVideoHearingViewPath = 'features/directionsQuestionnaire/phone-or-video-hearing';
const dqPropertyName = 'phoneOrVideoHearing';
const dqParentName = 'hearing';

function renderView(form: GenericForm<PhoneOrVideoHearing>, res: express.Response): void {
  res.render(phoneOrVideoHearingViewPath, {form});
}

phoneOrVideoHearingController.get(DQ_PHONE_OR_VIDEO_HEARING_URL, async (req, res, next: express.NextFunction) => {
  try {
    const directionQuestionnaire = await getDirectionQuestionnaire(req.params.id);
    const phoneOrVideoHearing = directionQuestionnaire.hearing?.phoneOrVideoHearing ?
      directionQuestionnaire.hearing.phoneOrVideoHearing : new PhoneOrVideoHearing();
    renderView(new GenericForm(phoneOrVideoHearing), res);
  } catch (error) {
    next(error);
  }
});

phoneOrVideoHearingController.post(DQ_PHONE_OR_VIDEO_HEARING_URL, async (req: express.Request, res: express.Response, next: express.NextFunction) => {
  try {
    const claimId = req.params.id;
    const details = req.body.option === YesNo.YES ? req.body.details : undefined;
    const phoneOrVideoHearing = new GenericForm(new PhoneOrVideoHearing(req.body.option, details));
    phoneOrVideoHearing.validateSync();

    if (phoneOrVideoHearing.hasErrors()) {
      renderView(phoneOrVideoHearing, res);
    } else {
      await saveDirectionQuestionnaire(claimId, phoneOrVideoHearing.model, dqPropertyName, dqParentName);
      res.redirect(constructResponseUrlWithIdParams(claimId, VULNERABILITY_URL));
    }
  } catch (error) {
    next(error);
  }
});

export default phoneOrVideoHearingController;
