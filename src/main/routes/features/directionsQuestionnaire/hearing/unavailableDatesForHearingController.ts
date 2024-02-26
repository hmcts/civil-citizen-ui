import {Router, Response, RequestHandler} from 'express';
import {GenericForm} from 'common/form/models/genericForm';
import {SupportRequiredList} from 'common/models/directionsQuestionnaire/supportRequired';
import {constructResponseUrlWithIdParams} from 'common/utils/urlFormatter';
import {
  DQ_AVAILABILITY_DATES_FOR_HEARING_URL,
  DQ_PHONE_OR_VIDEO_HEARING_URL,
  DQ_UNAVAILABLE_FOR_HEARING_URL,
} from 'routes/urls';
import {getDirectionQuestionnaire, saveDirectionQuestionnaire} from 'services/features/directionsQuestionnaire/directionQuestionnaireService';
import {UnavailableDates} from 'common/models/directionsQuestionnaire/hearing/unavailableDates';
import {getUnavailableDatesForm} from 'services/features/directionsQuestionnaire/hearing/unavailableDatesForHearingService';
import {getNumberOfUnavailableDays} from 'services/features/directionsQuestionnaire/hearing/unavailableDatesCalculation';
import {AppRequest} from 'common/models/AppRequest';
import {generateRedisKey} from 'modules/draft-store/draftStoreService';

const UNAVAILABLE_DAYS_LIMIT = 30;
const unavailableDatesForHearingController = Router();
const unavailableDatesForHearingViewPath = 'features/directionsQuestionnaire/hearing/unavailable-dates-for-hearing';
const dqPropertyName = 'unavailableDatesForHearing';
const dqParentName = 'hearing';

function renderView(form: GenericForm<SupportRequiredList|UnavailableDates>, res: Response) {
  res.render(unavailableDatesForHearingViewPath, { form });
}

unavailableDatesForHearingController.get(DQ_AVAILABILITY_DATES_FOR_HEARING_URL, (async (req, res, next) => {
  try {
    const directionQuestionnaire = await getDirectionQuestionnaire(generateRedisKey(<AppRequest>req));
    const unavailableDatesForHearing = directionQuestionnaire.hearing?.unavailableDatesForHearing ?? new UnavailableDates();
    const form = new GenericForm(unavailableDatesForHearing);
    renderView(form, res);
  } catch (error) {
    next(error);
  }
}) as RequestHandler);

unavailableDatesForHearingController.post(DQ_AVAILABILITY_DATES_FOR_HEARING_URL, (async (req, res, next) => {
  try {
    const claimId = req.params.id;
    const unavailableDatesForHearing = getUnavailableDatesForm(req.body);
    const form = new GenericForm(unavailableDatesForHearing);
    form.validateSync();
    if (form.hasErrors()) {
      renderView(form, res);
    } else {
      await saveDirectionQuestionnaire(generateRedisKey(<AppRequest>req), form.model, dqPropertyName, dqParentName);
      const numberOfUnavailableDays = getNumberOfUnavailableDays(form.model);
      if(numberOfUnavailableDays <= UNAVAILABLE_DAYS_LIMIT) {
        res.redirect(constructResponseUrlWithIdParams(claimId, DQ_PHONE_OR_VIDEO_HEARING_URL));
      } else if (numberOfUnavailableDays > UNAVAILABLE_DAYS_LIMIT) {
        res.redirect(constructResponseUrlWithIdParams(claimId, DQ_UNAVAILABLE_FOR_HEARING_URL));
      }
    }
  } catch (error) {
    next(error);
  }
}) as RequestHandler);

export default unavailableDatesForHearingController;
