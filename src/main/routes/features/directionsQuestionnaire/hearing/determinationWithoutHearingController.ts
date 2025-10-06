import {RequestHandler, Response, Router} from 'express';
import {
  DETERMINATION_WITHOUT_HEARING_URL,
  DQ_EXPERT_SMALL_CLAIMS_URL,
} from '../../../urls';
import {
  DeterminationWithoutHearing,
} from 'models/directionsQuestionnaire/hearing/determinationWithoutHearing';
import {GenericForm} from 'form/models/genericForm';

import {constructResponseUrlWithIdParams} from 'common/utils/urlFormatter';
import {
  getDirectionQuestionnaire,
  saveDirectionQuestionnaire,
} from 'services/features/directionsQuestionnaire/directionQuestionnaireService';
import {YesNo} from 'form/models/yesNo';
import {AppRequest} from 'common/models/AppRequest';
import {generateRedisKey} from 'modules/draft-store/draftStoreService';

const determinationWithoutHearingController = Router();
const determinationWithoutHearingViewPath = 'features/directionsQuestionnaire/hearing/determination-without-hearing';
const dqPropertyName = 'determinationWithoutHearing';
const dqParentName = 'hearing';

const {Logger} = require('@hmcts/nodejs-logging');
const logger = Logger.getLogger('determinationWithoutHearingController');

function renderView(form: GenericForm<DeterminationWithoutHearing>, res: Response): void {
  res.render(determinationWithoutHearingViewPath, {form, pageTitle: 'PAGES.DETERMINATION_WITHOUT_HEARING.TITLE'});
}

determinationWithoutHearingController
  .get(DETERMINATION_WITHOUT_HEARING_URL, (async (req, res, next) => {
    try {
      const directionQuestionnaire = await getDirectionQuestionnaire(generateRedisKey(<AppRequest>req));
      const determinationWithoutHearing = directionQuestionnaire?.hearing?.determinationWithoutHearing ?
        directionQuestionnaire.hearing.determinationWithoutHearing : new DeterminationWithoutHearing();

      renderView(new GenericForm(determinationWithoutHearing), res);
    } catch (error) {
      logger.error(`Error when GET : determination without hearing - ${error.message}`);
      next(error);
    }
  }) as RequestHandler);

determinationWithoutHearingController
  .post(DETERMINATION_WITHOUT_HEARING_URL, (async (req, res, next) => {
    try {
      const claimId = req.params.id;
      const reasonForHearing = req.body.option === YesNo.NO ? req.body.reasonForHearing : undefined;
      const determinationWithoutHearing = new GenericForm(new DeterminationWithoutHearing(req.body.option, reasonForHearing));
      determinationWithoutHearing.validateSync();

      if (determinationWithoutHearing.hasErrors()) {
        logger.info(`determination without hearing har error - ${determinationWithoutHearing.hasErrors()}`);
        renderView(determinationWithoutHearing, res);
      } else {
        await saveDirectionQuestionnaire(generateRedisKey(<AppRequest>req), determinationWithoutHearing.model, dqPropertyName, dqParentName);
        res.redirect(constructResponseUrlWithIdParams(claimId, DQ_EXPERT_SMALL_CLAIMS_URL));
      }
    } catch (error) {
      logger.error(`Error when POST : determination without hearing - ${error.message}`);
      next(error);
    }
  }) as RequestHandler);

export default determinationWithoutHearingController;
