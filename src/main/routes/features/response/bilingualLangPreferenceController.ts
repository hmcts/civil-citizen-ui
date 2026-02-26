import {NextFunction, Request, RequestHandler, Response, Router} from 'express';
import {constructResponseUrlWithIdParams} from 'common/utils/urlFormatter';
import {
  getBilingualLangPreference,
  saveBilingualLangPreference,
  getCookieLanguage,
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
import {isWelshEnabledForMainCase} from '../../../app/auth/launchdarkly/launchDarklyClient';

const bilingualLangPreferenceViewPath = 'features/response/bilingual-language-preference';
const bilingualLangPreferenceController = Router();

const {Logger} = require('@hmcts/nodejs-logging');
const logger = Logger.getLogger('bilingualLangPreferenceController');

async function renderView(form: GenericForm<GenericYesNo>, res: Response) {
  const welshEnabled = await isWelshEnabledForMainCase();
  res.render(bilingualLangPreferenceViewPath, {form, welshEnabled});
}

bilingualLangPreferenceController.get(
  BILINGUAL_LANGUAGE_PREFERENCE_URL,
  languagePreferenceGuard,
  (req: Request, res: Response, next: NextFunction) => {
    (async () => {
      try {
        const form: GenericYesNo = await getBilingualLangPreference(req);
        await renderView(new GenericForm<GenericYesNo>(form), res);
      } catch (error) {
        logger.error(`Error when getting bilingual language preference - ${error.message}`);
        next(error);
      }
    })();
  },
);

bilingualLangPreferenceController.post(BILINGUAL_LANGUAGE_PREFERENCE_URL, (async (req: Request, res: Response, next: NextFunction) => {
  try {
    const form = new GenericForm(new GenericYesNo(req.body.option, 'ERRORS.RESPONSE_LANGUAGE_REQUIRED'));
    form.validateSync();
    if (form.hasErrors()) {
      await renderView(form, res);
    } else {
      res.cookie('lang', getCookieLanguage(await isWelshEnabledForMainCase(), form.model.option));
      await saveBilingualLangPreference(generateRedisKey(<AppRequest>req), form.model);
      res.redirect(constructResponseUrlWithIdParams(req.params.id, RESPONSE_TASK_LIST_URL));
    }
  } catch (error) {
    logger.error(`Error when posting bilingual language preference - ${error.message}`);
    next(error);
  }
}) as RequestHandler);

export default bilingualLangPreferenceController;
