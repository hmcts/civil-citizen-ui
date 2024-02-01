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

function renderView(form: GenericForm<DeterminationWithoutHearing>, res: Response): void {
  res.render(determinationWithoutHearingViewPath, {form});
}

determinationWithoutHearingController
  .get(DETERMINATION_WITHOUT_HEARING_URL, (async (req, res, next) => {
    try {
      const directionQuestionnaire = await getDirectionQuestionnaire(generateRedisKey(<AppRequest>req));
      const determinationWithoutHearing = directionQuestionnaire?.hearing?.determinationWithoutHearing ?
        directionQuestionnaire.hearing.determinationWithoutHearing : new DeterminationWithoutHearing();

      renderView(new GenericForm(determinationWithoutHearing), res);
    } catch (error) {
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
        renderView(determinationWithoutHearing, res);
      } else {
        await saveDirectionQuestionnaire(generateRedisKey(<AppRequest>req), determinationWithoutHearing.model, dqPropertyName, dqParentName);
        res.redirect(constructResponseUrlWithIdParams(claimId, DQ_EXPERT_SMALL_CLAIMS_URL));
      }
    } catch (error) {
      next(error);
    }
  }) as RequestHandler);

export default determinationWithoutHearingController;
