import * as express from 'express';
import {
  DQ_PHONE_OR_VIDEO_HEARING_URL,
  VULNERABILITY_URL,
} from '../../urls';
import {GenericForm} from '../../../common/form/models/genericForm';
import {constructResponseUrlWithIdParams} from '../../../common/utils/urlFormatter';
import {PhoneOrVideoHearing} from '../../../common/models/directionsQuestionnaire/hearing/phoneOrVideoHearing';
import {GenericYesNo} from '../../../common/form/models/genericYesNo';
import {YesNo} from '../../../common/form/models/yesNo';
import {
  getGenericOption,
  saveDirectionQuestionnaire,
} from '../../../services/features/directionsQuestionnaire/directionQuestionnaireService';

const phoneOrVideoHearingController = express.Router();
const phoneOrVideoHearingViewPath = 'features/directionsQuestionnaire/phone-or-video-hearing';
const dqPropertyName = 'phoneOrVideoHearing';
const dqParentName = 'hearing';

function renderView(form: GenericForm<GenericYesNo>, res: express.Response): void {
  res.render(phoneOrVideoHearingViewPath, {form});
}

phoneOrVideoHearingController.get(DQ_PHONE_OR_VIDEO_HEARING_URL, async (req, res, next: express.NextFunction) => {
  try {
    const phoneOrVideoHearing = await getGenericOption(req.params.id, dqPropertyName, dqParentName);
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
