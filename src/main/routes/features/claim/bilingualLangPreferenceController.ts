import {NextFunction, RequestHandler, Response, Router} from 'express';
import {constructResponseUrlWithIdParams} from 'common/utils/urlFormatter';
import {
  saveClaimantBilingualLangPreference,
  getCookieLanguage,
} from 'services/features/response/bilingualLangPreferenceService';
import {
  CLAIM_BILINGUAL_LANGUAGE_PREFERENCE_URL,
  CLAIMANT_TASK_LIST_URL,
} from '../../urls';
import {GenericForm} from 'common/form/models/genericForm';
import {GenericYesNo} from 'common/form/models/genericYesNo';
import {createOrLoadDraft} from 'modules/draft-store/draftStoreManagerService';
import {AppRequest} from 'common/models/AppRequest';
import {claimLanguagePreferenceGuard} from 'routes/guards/claimLanguagePreferenceGuard';
import config from 'config';
import {CivilServiceClient} from 'client/civilServiceClient';
import {isWelshEnabledForMainCase} from '../../../app/auth/launchdarkly/launchDarklyClient';

const bilingualLangPreferenceViewPath = 'features/claim/claim-bilingual-language-preference';
const claimBilingualLangPreferenceController = Router();

const civilServiceApiBaseUrl = config.get<string>('services.civilService.url');
const civilServiceClient: CivilServiceClient = new CivilServiceClient(civilServiceApiBaseUrl);

async function renderView(form: GenericForm<GenericYesNo>, res: Response) {
  const welshEnabled = await isWelshEnabledForMainCase();
  res.render(bilingualLangPreferenceViewPath, {form, pageTitle: 'PAGES.CLAIM_BILINGUAL_LANGUAGE_PREFERENCE.PAGE_TITLE', welshEnabled});
}

claimBilingualLangPreferenceController.get(
  CLAIM_BILINGUAL_LANGUAGE_PREFERENCE_URL,
  claimLanguagePreferenceGuard,
  (req: AppRequest, res: Response, next: NextFunction) => {
    (async () => {
      try {
        const draftResult = await createOrLoadDraft(req);
        if (req.session && draftResult.rawResponse?.draftId) {
          req.session.draftId = draftResult.rawResponse.draftId;
        }
        if (draftResult.isNew) {
          await civilServiceClient.createDashboard(req);
        }
        const form: GenericYesNo = new GenericYesNo();
        await renderView(new GenericForm<GenericYesNo>(form), res);
      } catch (error) {
        next(error);
      }
    })();
  },
);

claimBilingualLangPreferenceController.post(CLAIM_BILINGUAL_LANGUAGE_PREFERENCE_URL, (async (req: AppRequest, res: Response, next: NextFunction) => {
  try {
    const form = new GenericForm(new GenericYesNo(req.body.option, 'ERRORS.CLAIM_LANGUAGE_REQUIRED'));
    form.validateSync();
    if (form.hasErrors()) {
      await renderView(form, res);
    } else {
      res.cookie('lang', getCookieLanguage(await isWelshEnabledForMainCase(), form.model.option));
      await saveClaimantBilingualLangPreference(req, form.model);
      res.redirect(constructResponseUrlWithIdParams(req.params.id, CLAIMANT_TASK_LIST_URL));
    }
  } catch (error) {
    next(error);
  }
}) as RequestHandler);

export default claimBilingualLangPreferenceController;
