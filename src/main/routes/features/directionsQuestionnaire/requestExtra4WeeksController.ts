import {RequestHandler, Response, Router} from 'express';
import {
  DQ_CONSIDER_CLAIMANT_DOCUMENTS_URL,
  DQ_DISCLOSURE_OF_DOCUMENTS_URL,
  DQ_REQUEST_EXTRA_4WEEKS_URL, SUBJECT_TO_FRC_URL,
} from '../../urls';
import {GenericForm} from 'form/models/genericForm';
import {GenericYesNo} from 'form/models/genericYesNo';
import {constructResponseUrlWithIdParams} from 'common/utils/urlFormatter';
import {
  getGenericOption,
  getGenericOptionFormDirectionQuestionnaire,
  saveDirectionQuestionnaire,
} from 'services/features/directionsQuestionnaire/directionQuestionnaireService';
import {generateRedisKey, getCaseDataFromStore} from 'modules/draft-store/draftStoreService';
import {AppRequest} from 'common/models/AppRequest';
import {isIntermediateTrack, isMultiTrack} from 'form/models/claimType';
import {isMintiEnabledForCase} from '../../../app/auth/launchdarkly/launchDarklyClient';

const requestExtra4WeeksController = Router();
const dqPropertyName = 'requestExtra4weeks';
const dqParentName = 'hearing';

function renderView(form: GenericForm<GenericYesNo>, res: Response): void {
  res.render('features/directionsQuestionnaire/request-extra-4weeks', {form, pageTitle: 'PAGES.REQUEST_EXTRA_4WEEKS.PAGE_TITLE'});
}

requestExtra4WeeksController.get(DQ_REQUEST_EXTRA_4WEEKS_URL, (async (req, res, next) => {
  try {
    renderView(new GenericForm(await getGenericOption(generateRedisKey(<AppRequest>req), dqPropertyName, dqParentName)), res);
  } catch (error) {
    next(error);
  }
}) as RequestHandler);

requestExtra4WeeksController.post(DQ_REQUEST_EXTRA_4WEEKS_URL, (async (req, res, next) => {
  try {
    const claimId = req.params.id;
    const form = new GenericForm(getGenericOptionFormDirectionQuestionnaire(req.body.option, dqPropertyName));
    form.validateSync();

    if (form.hasErrors()) {
      renderView(form, res);
    } else {
      await saveDirectionQuestionnaire(generateRedisKey(<AppRequest>req), form.model, dqPropertyName, dqParentName);
      const redisKey = generateRedisKey(<AppRequest>req);
      const claim = await getCaseDataFromStore(redisKey);
      const mintiFlag = await isMintiEnabledForCase(claim.submittedDate);
      if (isIntermediateTrack(claim.totalClaimAmount, mintiFlag)) {
        res.redirect(constructResponseUrlWithIdParams(claimId, SUBJECT_TO_FRC_URL));
      } else if (isMultiTrack(claim.totalClaimAmount, mintiFlag)) {
        res.redirect(constructResponseUrlWithIdParams(claimId, DQ_DISCLOSURE_OF_DOCUMENTS_URL));
      } else {
        res.redirect(constructResponseUrlWithIdParams(claimId, DQ_CONSIDER_CLAIMANT_DOCUMENTS_URL));
      }
    }
  } catch (error) {
    next(error);
  }
}) as RequestHandler);

export default requestExtra4WeeksController;
