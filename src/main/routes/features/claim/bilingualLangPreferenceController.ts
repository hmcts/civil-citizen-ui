import {NextFunction, Request, Response, Router} from 'express';
import {constructResponseUrlWithIdParams} from 'common/utils/urlFormatter';
import {
  saveClaimantBilingualLangPreference,
} from 'services/features/response/bilingualLangPreferenceService';
import {
  CLAIM_BILINGUAL_LANGUAGE_PREFERENCE_URL,
  CLAIMANT_TASK_LIST_URL,
} from '../../urls';
import {GenericForm} from 'common/form/models/genericForm';
import {GenericYesNo} from 'common/form/models/genericYesNo';
import {ClaimBilingualLanguagePreference} from 'common/models/claimBilingualLanguagePreference';
import {
  createDraftClaimInStoreWithExpiryTime,
  generateRedisKey,
  getCaseDataFromStore
} from 'modules/draft-store/draftStoreService';
import {AppRequest} from 'common/models/AppRequest';
import {claimLanguagePreferenceGuard} from 'routes/guards/claimLanguagePreferenceGuard';
import {Claim} from 'models/claim';

const bilingualLangPreferenceViewPath = 'features/claim/claim-bilingual-language-preference';
const claimBilingualLangPreferenceController = Router();

function renderView(form: GenericForm<GenericYesNo>, res: Response): void {
  res.render(bilingualLangPreferenceViewPath, {form});
}

claimBilingualLangPreferenceController.get(
  CLAIM_BILINGUAL_LANGUAGE_PREFERENCE_URL,
  claimLanguagePreferenceGuard,
  (req: Request, res: Response, next: NextFunction) => {
    (async () => {
      try {
        const userId = (<AppRequest>req).session?.user?.id;
        const caseData: Claim = await getCaseDataFromStore(userId, true);
        if (!caseData?.isDraftClaim()) {
          await createDraftClaimInStoreWithExpiryTime(userId);
        }
        const form: GenericYesNo = new GenericYesNo();
        console.log('dgknsfgnmfsg');
        renderView(new GenericForm<GenericYesNo>(form), res);
        console.log('dgknsfgnmfsg');
      } catch (error) {
        next(error);
      }
    })();
  },
);

claimBilingualLangPreferenceController.post(CLAIM_BILINGUAL_LANGUAGE_PREFERENCE_URL, async (req: Request, res: Response, next: NextFunction) => {
  try {
    console.log('post 1');
    const form = new GenericForm(new GenericYesNo(req.body.option, 'ERRORS.CLAIM_SELECT_WELSH_AND_ENGLISH_OPTION'));
    console.log('post 2');
    form.validateSync();
    console.log('post 3');
    if (form.hasErrors()) {
      renderView(form, res);
      console.log('post 4');
    } else {
      console.log('post 5');
      res.cookie('lang', form.model.option === ClaimBilingualLanguagePreference.ENGLISH ? 'en' : 'cy');
      await saveClaimantBilingualLangPreference(generateRedisKey(<AppRequest>req), form.model);
      res.redirect(constructResponseUrlWithIdParams(req.params.id, CLAIMANT_TASK_LIST_URL));
    }
  } catch (error) {
    next(error);
  }
});

export default claimBilingualLangPreferenceController;
