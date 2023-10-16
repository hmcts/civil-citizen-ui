import {NextFunction, Request, Response, Router} from 'express';
import {DQ_PHONE_OR_VIDEO_HEARING_URL, VULNERABILITY_URL} from '../../../urls';
import {GenericForm} from '../../../../common/form/models/genericForm';
import {constructResponseUrlWithIdParams} from '../../../../common/utils/urlFormatter';
import {PhoneOrVideoHearing} from '../../../../common/models/directionsQuestionnaire/hearing/phoneOrVideoHearing';
import {GenericYesNo} from '../../../../common/form/models/genericYesNo';
import {YesNo} from '../../../../common/form/models/yesNo';
import {
  getGenericOption,
  saveDirectionQuestionnaire,
} from '../../../../services/features/directionsQuestionnaire/directionQuestionnaireService';
import {generateRedisKey} from 'modules/draft-store/draftStoreService';
import {AppRequest} from 'common/models/AppRequest';

const phoneOrVideoHearingController = Router();
const phoneOrVideoHearingViewPath = 'features/directionsQuestionnaire/hearing/phone-or-video-hearing';
const dqPropertyName = 'phoneOrVideoHearing';
const dqParentName = 'hearing';

function renderView(form: GenericForm<GenericYesNo>, res: Response): void {
  res.render(phoneOrVideoHearingViewPath, {form});
}

phoneOrVideoHearingController.get(DQ_PHONE_OR_VIDEO_HEARING_URL, async (req, res, next: NextFunction) => {
  try {
    const phoneOrVideoHearing = await getGenericOption(generateRedisKey(<AppRequest>req), dqPropertyName, dqParentName);
    renderView(new GenericForm(phoneOrVideoHearing), res);
  } catch (error) {
    next(error);
  }
});

phoneOrVideoHearingController.post(DQ_PHONE_OR_VIDEO_HEARING_URL, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const claimId = req.params.id;
    const details = req.body.option === YesNo.YES ? req.body.details : undefined;
    const phoneOrVideoHearing = new GenericForm(new PhoneOrVideoHearing(req.body.option, details));
    phoneOrVideoHearing.validateSync();

    if (phoneOrVideoHearing.hasErrors()) {
      renderView(phoneOrVideoHearing, res);
    } else {
      await saveDirectionQuestionnaire(generateRedisKey(<AppRequest>req), phoneOrVideoHearing.model, dqPropertyName, dqParentName);
      res.redirect(constructResponseUrlWithIdParams(claimId, VULNERABILITY_URL));
    }
  } catch (error) {
    next(error);
  }
});

export default phoneOrVideoHearingController;
