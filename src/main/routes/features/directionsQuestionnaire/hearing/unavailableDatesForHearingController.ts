import {Router, Response} from 'express';
import {GenericForm} from 'common/form/models/genericForm';
import {SupportRequiredList} from 'common/models/directionsQuestionnaire/supportRequired';
import {constructResponseUrlWithIdParams} from 'common/utils/urlFormatter';
import {
  DQ_AVAILABILITY_DATES_FOR_HEARING_URL,
  DQ_PHONE_OR_VIDEO_HEARING_URL,
} from 'routes/urls';
import {getDirectionQuestionnaire, saveDirectionQuestionnaire} from 'services/features/directionsQuestionnaire/directionQuestionnaireService';
import {UnavailableDatePeriod, UnavailableDates, UnavailableDatesType} from 'common/models/directionsQuestionnaire/hearing/unavailableDates';

const unavailableDatesForHearingController = Router();
const unavailableDatesForHearingViewPath = 'features/directionsQuestionnaire/hearing/unavailable-dates-for-hearing';
const dqPropertyName = 'unavailableDatesForHearing';
const dqParentName = 'hearing';

function renderView(form: GenericForm<SupportRequiredList|UnavailableDates>, res: Response) {
  res.render(unavailableDatesForHearingViewPath, { form });
}

unavailableDatesForHearingController.get(DQ_AVAILABILITY_DATES_FOR_HEARING_URL, async (req, res, next) => {
  try {
    const directionQuestionnaire = await getDirectionQuestionnaire(req.params.id);
    const xForm = directionQuestionnaire?.hearing?.unavailableDatesForHearing ?
      directionQuestionnaire.hearing.unavailableDatesForHearing : new UnavailableDates();
    const form = new GenericForm(xForm);
    renderView(form, res);
  } catch (error) {
    next(error);
  }
});

unavailableDatesForHearingController.post(DQ_AVAILABILITY_DATES_FOR_HEARING_URL, async (req, res, next) => {
  try {
    const claimId = req.params.id;
    const unavailableDates: UnavailableDatePeriod[] = req.body.items.map((item:any) => {
      if (item.type === UnavailableDatesType.SINGLE_DATE) {
        return new UnavailableDatePeriod(item.single.start, undefined);
      }
      if (item.type === UnavailableDatesType.LONGER_PERIOD) {
        return new UnavailableDatePeriod(item.period.start, item.period.end);
      }
    });
    const form = new GenericForm(new UnavailableDates(unavailableDates));
    form.validateSync();
    if (form.hasErrors()) {
      renderView(form, res);
    } else {
      await saveDirectionQuestionnaire(claimId, form.model, dqPropertyName, dqParentName);
      // TODO : update redirection if  more than 30 days goto why anaavailable else phone or video hearing
      res.redirect(constructResponseUrlWithIdParams(claimId, DQ_PHONE_OR_VIDEO_HEARING_URL));
    }
  } catch (error) {
    next(error);
  }
});

export default unavailableDatesForHearingController;
