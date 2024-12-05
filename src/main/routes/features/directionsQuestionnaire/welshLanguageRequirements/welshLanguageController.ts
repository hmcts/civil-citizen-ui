import * as express from 'express';
import {CLAIMANT_RESPONSE_TASK_LIST_URL, RESPONSE_TASK_LIST_URL, DQ_WELSH_LANGUAGE_URL} from 'routes/urls';
import {GenericForm} from 'form/models/genericForm';
import {
  getDirectionQuestionnaire,
  saveDirectionQuestionnaire,
} from 'services/features/directionsQuestionnaire/directionQuestionnaireService';
import {constructResponseUrlWithIdParams} from 'common/utils/urlFormatter';
import {Language} from 'models/directionsQuestionnaire/welshLanguageRequirements/language';
import {getCaseDataFromStore,generateRedisKey} from 'modules/draft-store/draftStoreService';
import {AppRequest} from 'common/models/AppRequest';
import {RequestHandler} from 'express';
import {isCarmEnabledForCase} from '../../../../app/auth/launchdarkly/launchDarklyClient';

const welshLanguageController = express.Router();
const welshLanguageViewPath = 'features/directionsQuestionnaire/welshLanguageRequirements/welsh-language';
const languageProperty = 'language';
const welshLanguageRequirementsProperty = 'welshLanguageRequirements';

function renderView(form: GenericForm<Language>, res: express.Response, carmEnabled: boolean): void {
  res.render(welshLanguageViewPath, {form, pageTitle: 'PAGES.WELSH_LANGUAGE.PAGE_TITLE', carmEnabled: carmEnabled});
}

welshLanguageController.get(DQ_WELSH_LANGUAGE_URL, (async (req, res, next) => {
  try {
    const directionQuestionnaire = await getDirectionQuestionnaire(generateRedisKey(<AppRequest>req));
    const redisKey = generateRedisKey(<AppRequest>req);
    const claim = await getCaseDataFromStore(redisKey);
    const carmApplicable = await isCarmEnabledForCase(claim.submittedDate) && claim.isSmallClaimsTrackDQ;
    const welshLanguageRequirements = directionQuestionnaire.welshLanguageRequirements?.language
      ? new Language(directionQuestionnaire.welshLanguageRequirements.language.speakLanguage, directionQuestionnaire.welshLanguageRequirements.language.documentsLanguage)
      : new Language();
    renderView(new GenericForm(welshLanguageRequirements), res, carmApplicable);
  } catch (error) {
    next(error);
  }
}) as RequestHandler);

welshLanguageController.post(DQ_WELSH_LANGUAGE_URL, (async (req, res, next) => {
  try {
    const claimId = req.params.id;
    const redisKey = generateRedisKey(<AppRequest>req);
    const claim = await getCaseDataFromStore(redisKey);
    const form = new GenericForm(new Language(req.body.speakLanguage, req.body.documentsLanguage));
    const carmApplicable = await isCarmEnabledForCase(claim.submittedDate);
    form.validateSync();
    if (form.hasErrors()) {
      renderView(form, res, carmApplicable);
    } else {
      await saveDirectionQuestionnaire(redisKey, form.model, languageProperty, welshLanguageRequirementsProperty);
      const redirectUrl = claim.isClaimantIntentionPending() ? CLAIMANT_RESPONSE_TASK_LIST_URL : RESPONSE_TASK_LIST_URL;
      res.redirect(constructResponseUrlWithIdParams(claimId, redirectUrl));
    }
  } catch (error) {
    next(error);
  }
}) as RequestHandler);

export default welshLanguageController;
