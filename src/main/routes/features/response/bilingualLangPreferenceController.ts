import {NextFunction, Request, RequestHandler, Response, Router} from 'express';
import {constructResponseUrlWithIdParams} from 'common/utils/urlFormatter';
import {
  getBilingualLangPreference,
  saveBilingualLangPreference,
  setCookieLanguage,
} from 'services/features/response/bilingualLangPreferenceService';
import {
  BILINGUAL_LANGUAGE_PREFERENCE_URL,
  RESPONSE_TASK_LIST_URL,
} from '../../urls';
import {GenericForm} from 'common/form/models/genericForm';
import {GenericYesNo} from 'common/form/models/genericYesNo';
import {languagePreferenceGuard} from 'routes/guards/languagePreferenceGuard';
import {generateRedisKey} from 'modules/draft-store/draftStoreService';
import {AppRequest} from 'common/models/AppRequest';
import {isGaForWelshEnabled} from '../../../app/auth/launchdarkly/launchDarklyClient';

const bilingualLangPreferenceViewPath = 'features/response/bilingual-language-preference';
const bilingualLangPreferenceController = Router();

async function renderView(form: GenericForm<GenericYesNo>, res: Response) {
  const welshGaEnabled = await isGaForWelshEnabled();
  res.render(bilingualLangPreferenceViewPath, {form, welshGaEnabled});
}

bilingualLangPreferenceController.get(
  BILINGUAL_LANGUAGE_PREFERENCE_URL,
  languagePreferenceGuard,
  (req: Request, res: Response, next: NextFunction) => {
    (async () => {
      try {
        const form: GenericYesNo = await getBilingualLangPreference(req);
        renderView(new GenericForm<GenericYesNo>(form), res);
      } catch (error) {
        next(error);
      }
    })();
  },
);

bilingualLangPreferenceController.post(BILINGUAL_LANGUAGE_PREFERENCE_URL, (async (req: Request, res: Response, next: NextFunction) => {
  try {
    const form = new GenericForm(new GenericYesNo(req.body.option, 'ERRORS.SELECT_WELSH_AND_ENGLISH_OPTION'));
    form.validateSync();
    if (form.hasErrors()) {
      renderView(form, res);
    } else {
      res.cookie('lang', setCookieLanguage(form.model.option));
      await saveBilingualLangPreference(generateRedisKey(<AppRequest>req), form.model);
      res.redirect(constructResponseUrlWithIdParams(req.params.id, RESPONSE_TASK_LIST_URL));
    }
  } catch (error) {
    next(error);
  }
}) as RequestHandler);

export default bilingualLangPreferenceController;
