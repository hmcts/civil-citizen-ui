import {NextFunction, Request, Response, Router} from 'express';
import {CLAIMANT_PHONE_NUMBER_URL, CLAIMANT_TASK_LIST_URL} from '../../../urls';
import {GenericForm} from '../../../../common/form/models/genericForm';
import {getTelephone, saveTelephone} from '../../../../services/features/claim/yourDetails/phoneService';
import {AppRequest} from '../../../../common/models/AppRequest';
import {CitizenTelephoneNumber} from '../../../../common/form/models/citizenTelephoneNumber';
import {ClaimantOrDefendant} from '../../../../common/models/partyType';
import {Claim} from 'models/claim';
import {getCaseDataFromStore} from 'modules/draft-store/draftStoreService';
import {isCarmEnabledForCase} from 'common/utils/carmToggleUtils';

const claimantPhoneViewPath = 'features/claim/claimant-phone';
const claimantPhoneController = Router();

function renderView(form: GenericForm<CitizenTelephoneNumber>, res: Response, carmEnabled: boolean): void {
  res.render(claimantPhoneViewPath, {form, carmEnabled: carmEnabled});
}

claimantPhoneController.get(CLAIMANT_PHONE_NUMBER_URL, async (req: AppRequest, res: Response, next: NextFunction) => {
  try {
    const claimId = req.session.user?.id;
    const claim: Claim = await getCaseDataFromStore(claimId);
    const carmEnabled = await isCarmEnabledForCase(claim.draftClaimCreatedAt);

    const form: CitizenTelephoneNumber = await getTelephone(claimId, ClaimantOrDefendant.CLAIMANT);
    renderView(new GenericForm<CitizenTelephoneNumber>(form), res, carmEnabled);
  } catch (error) {
    next(error);
  }
});

claimantPhoneController.post(CLAIMANT_PHONE_NUMBER_URL, async (req: AppRequest | Request, res: Response, next: NextFunction) => {
  try {
    const claimId = (<AppRequest>req).session.user?.id;
    const claim: Claim = await getCaseDataFromStore(claimId);
    const carmEnabled = await isCarmEnabledForCase(claim.draftClaimCreatedAt);
    const form: GenericForm<CitizenTelephoneNumber> = new GenericForm(new CitizenTelephoneNumber(req.body.telephoneNumber === '' ? undefined : req.body.telephoneNumber, undefined, carmEnabled));
    form.validateSync();

    if (form.hasErrors()) {
      renderView(form, res, carmEnabled);
    } else {
      await saveTelephone(claimId, form.model, ClaimantOrDefendant.CLAIMANT);
      res.redirect(CLAIMANT_TASK_LIST_URL);
    }
  } catch (error) {
    next(error);
  }
});

export default claimantPhoneController;
