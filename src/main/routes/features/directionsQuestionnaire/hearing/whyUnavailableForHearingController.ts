import {NextFunction, Request, RequestHandler, Response, Router} from 'express';
import {DQ_PHONE_OR_VIDEO_HEARING_URL, DQ_UNAVAILABLE_FOR_HEARING_URL} from 'routes/urls';
import {GenericForm} from 'form/models/genericForm';
import {constructResponseUrlWithIdParams} from 'common/utils/urlFormatter';
import {
  getDirectionQuestionnaire,
  saveDirectionQuestionnaire,
} from 'services/features/directionsQuestionnaire/directionQuestionnaireService';
import {
  WhyUnavailableForHearing,
} from 'models/directionsQuestionnaire/hearing/whyUnavailableForHearing';
import {getNumberOfUnavailableDays} from 'services/features/directionsQuestionnaire/hearing/unavailableDatesCalculation';
import {generateRedisKey} from 'modules/draft-store/draftStoreService';
import {AppRequest} from 'common/models/AppRequest';

const whyUnavailableForHearingController = Router();
const whyUnavailableForHearingViewPath = 'features/directionsQuestionnaire/hearing/why-unavailable-for-hearing';
const dqPropertyName = 'whyUnavailableForHearing';
const dqParentName = 'hearing';
let days = 0;

const {Logger} = require('@hmcts/nodejs-logging');
const logger = Logger.getLogger('whyUnavailableForHearingController');

function renderView(form: GenericForm<WhyUnavailableForHearing>, res: Response, days: number): void {
  res.render(whyUnavailableForHearingViewPath, {form, days, pageTitle: 'PAGES.WHY_UNAVAILABLE_FOR_HEARING.PAGE_TITLE'});
}

whyUnavailableForHearingController.get(DQ_UNAVAILABLE_FOR_HEARING_URL, (async (req: Request, res: Response, next: NextFunction) => {
  try {
    const directionQuestionnaire = await getDirectionQuestionnaire(generateRedisKey(<AppRequest>req));
    const whyUnavailableForHearing = directionQuestionnaire.hearing?.whyUnavailableForHearing ?
      directionQuestionnaire.hearing.whyUnavailableForHearing : new WhyUnavailableForHearing();
    days = getNumberOfUnavailableDays(directionQuestionnaire.hearing?.unavailableDatesForHearing);
    renderView(new GenericForm(whyUnavailableForHearing), res, days);
  } catch (error) {
    logger.error(`Error when GET : why unavailable dates for hearing - ${error.message}`);
    next(error);
  }
}) as RequestHandler);

whyUnavailableForHearingController.post(DQ_UNAVAILABLE_FOR_HEARING_URL, (async (req: Request, res: Response, next: NextFunction) => {
  try {
    const claimId = req.params.id;
    const whyUnavailableForHearing = new GenericForm(new WhyUnavailableForHearing(req.body.reason));
    whyUnavailableForHearing.validateSync();

    if (whyUnavailableForHearing.hasErrors()) {
      logger.info(`why unavailable dates for hearing har error - ${whyUnavailableForHearing.hasErrors()}`);
      renderView(whyUnavailableForHearing, res, days);
    } else {
      await saveDirectionQuestionnaire(generateRedisKey(<AppRequest>req), whyUnavailableForHearing.model, dqPropertyName, dqParentName);
      res.redirect(constructResponseUrlWithIdParams(claimId, DQ_PHONE_OR_VIDEO_HEARING_URL));
    }
  } catch (error) {
    logger.error(`Error when POST : why unavailable dates for hearing - ${error.message}`);
    next(error);
  }
}) as RequestHandler);

export default whyUnavailableForHearingController;
