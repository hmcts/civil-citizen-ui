import * as express from 'express';
import {
  DQ_PHONE_OR_VIDEO_HEARING_URL,
  VULNERABILITY_URL,
} from '../../urls';
import {
  getphoneOrVideoHearing,
  getphoneOrVideoHearingForm,
  savephoneOrVideoHearing,
} from '../../../services/features/directionsQuestionnaire/phoneOrVideoHearingService';
import {GenericForm} from '../../../common/form/models/genericForm';
import {constructResponseUrlWithIdParams} from '../../../common/utils/urlFormatter';
import {PhoneOrVideoHearing} from '../../../common/models/directionsQuestionnaire/hearing/phoneOrVideoHearing';

const phoneOrVideoHearingController = express.Router();

const phoneOrVideoHearingViewPath = 'features/directionsQuestionnaire/phone-or-video-hearing';

function renderView(form: GenericForm<PhoneOrVideoHearing>, res: express.Response): void {
  res.render(phoneOrVideoHearingViewPath, {form});
}

phoneOrVideoHearingController.get(DQ_PHONE_OR_VIDEO_HEARING_URL, async (req, res, next: express.NextFunction) => {
  try {
    const phoneOrVideoHearing = await getphoneOrVideoHearing(req.params.id);
    renderView(new GenericForm(phoneOrVideoHearing), res);
  } catch (error) {
    next(error);
  }
});

phoneOrVideoHearingController.post(DQ_PHONE_OR_VIDEO_HEARING_URL, async (req: express.Request, res: express.Response, next: express.NextFunction) => {
  try {
    const claimId = req.params.id;
    const phoneOrVideoHearingForm = getphoneOrVideoHearingForm(req.body.option, req.body.details);
    const form = new GenericForm(phoneOrVideoHearingForm);
    form.validateSync();

    if (form.hasErrors()) {
      renderView(form, res);
    } else {
      await savephoneOrVideoHearing(claimId, phoneOrVideoHearingForm);
      res.redirect(constructResponseUrlWithIdParams(claimId, VULNERABILITY_URL));
    }
  } catch (error) {
    next(error);
  }
});

export default phoneOrVideoHearingController;
