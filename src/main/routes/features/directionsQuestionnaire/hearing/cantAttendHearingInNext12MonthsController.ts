import {RequestHandler, Response, Router} from 'express';
import {
  DQ_NEXT_12MONTHS_CAN_NOT_HEARING_URL,
  DQ_PHONE_OR_VIDEO_HEARING_URL,
  DQ_AVAILABILITY_DATES_FOR_HEARING_URL,
} from 'routes/urls';
import {GenericForm} from 'form/models/genericForm';
import {GenericYesNo} from 'form/models/genericYesNo';
import {constructResponseUrlWithIdParams} from 'common/utils/urlFormatter';
import {
  getGenericOption,
  getGenericOptionFormDirectionQuestionnaire,
  saveDirectionQuestionnaire,
} from 'services/features/directionsQuestionnaire/directionQuestionnaireService';
import {YesNo} from 'common/form/models/yesNo';
import {AppRequest} from 'common/models/AppRequest';
import {generateRedisKey} from 'modules/draft-store/draftStoreService';

const cantAttendHearingInNext12MonthsController = Router();
const dqPropertyName = 'cantAttendHearingInNext12Months';
const dqParentName = 'hearing';

const {Logger} = require('@hmcts/nodejs-logging');
const logger = Logger.getLogger('cantAttendHearingInNext12MonthsController');

function renderView(form: GenericForm<GenericYesNo>, res: Response): void {
  res.render('features/directionsQuestionnaire/hearing/cant-attend-hearing-in-next-12-months', {form, pageTitle: 'PAGES.CANT_ATTEND_HEARING_IN_NEXT_12MONTHS.PAGE_TITLE'});
}

cantAttendHearingInNext12MonthsController.get(DQ_NEXT_12MONTHS_CAN_NOT_HEARING_URL, (async (req, res, next) => {
  try {
    renderView(new GenericForm(await getGenericOption(generateRedisKey(<AppRequest>req), dqPropertyName, dqParentName)), res);
  } catch (error) {
    logger.error(`Error when GET : can attend hearing next 12 months - ${error.message}`);
    next(error);
  }
}) as RequestHandler);

cantAttendHearingInNext12MonthsController.post(DQ_NEXT_12MONTHS_CAN_NOT_HEARING_URL, (async (req, res, next) => {
  try {
    const claimId = req.params.id;
    const form = new GenericForm(getGenericOptionFormDirectionQuestionnaire(req.body.option, dqPropertyName));
    form.validateSync();

    if (form.hasErrors()) {
      logger.info(`Form has errors: ${form.hasErrors()}`);
      renderView(form, res);
    } else {
      await saveDirectionQuestionnaire(generateRedisKey(<AppRequest>req), form.model, dqPropertyName, dqParentName);
      const redirectUrl = form.model.option === YesNo.YES ? DQ_AVAILABILITY_DATES_FOR_HEARING_URL : DQ_PHONE_OR_VIDEO_HEARING_URL;
      res.redirect(constructResponseUrlWithIdParams(claimId, redirectUrl));
    }
  } catch (error) {
    logger.error(`Error when POST : can attend hearing next 12 months - ${error.message}`);
    next(error);
  }
}) as RequestHandler);

export default cantAttendHearingInNext12MonthsController;
