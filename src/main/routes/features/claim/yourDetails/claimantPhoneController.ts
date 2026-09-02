import {NextFunction, RequestHandler, Response, Router} from 'express';
import {CLAIMANT_PHONE_NUMBER_URL, CLAIMANT_TASK_LIST_URL} from 'routes/urls';
import {GenericForm} from 'form/models/genericForm';
import {getTelephone, saveTelephone} from 'services/features/claim/yourDetails/phoneService';
import {AppRequest} from 'models/AppRequest';
import {CitizenTelephoneNumber} from 'form/models/citizenTelephoneNumber';
import {ClaimantOrDefendant} from 'models/partyType';
import {Claim} from 'models/claim';
import {getDraftClaim} from 'modules/draft-store/draftStoreManagerService';
import {isCarmEnabledForCase} from '../../../../app/auth/launchdarkly/launchDarklyClient';

const claimantPhoneViewPath = 'features/claim/claimant-phone';
const claimantPhoneController = Router();

function renderView(form: GenericForm<CitizenTelephoneNumber>, res: Response, carmEnabled: boolean): void {
  res.render(claimantPhoneViewPath, {form, carmEnabled: carmEnabled, pageTitle: 'PAGES.CLAIMANT_PHONE.PAGE_TITLE'});
}

claimantPhoneController.get(CLAIMANT_PHONE_NUMBER_URL, (async (req: AppRequest, res: Response, next: NextFunction) => {
  try {
    const draftResult = await getDraftClaim(req);
    if (!draftResult) {
      throw new Error('[claimantPhoneController] no draft claim found');
    }
    const claim: Claim = Object.assign(new Claim(), draftResult.claimResponse?.case_data as unknown as Claim);
    if (draftResult.createdAt && !claim.draftClaimCreatedAt) {
      claim.draftClaimCreatedAt = new Date(draftResult.createdAt);
    }
    const carmEnabled = await isCarmEnabledForCase(claim.draftClaimCreatedAt);

    const form: CitizenTelephoneNumber = await getTelephone(req, ClaimantOrDefendant.CLAIMANT);
    renderView(new GenericForm<CitizenTelephoneNumber>(form), res, carmEnabled);
  } catch (error) {
    next(error);
  }
}) as RequestHandler);

claimantPhoneController.post(CLAIMANT_PHONE_NUMBER_URL, (async (req: AppRequest, res: Response, next: NextFunction) => {
  try {
    const draftResult = await getDraftClaim(req);
    if (!draftResult) {
      throw new Error('[claimantPhoneController] no draft claim found');
    }
    const claim: Claim = Object.assign(new Claim(), draftResult.claimResponse?.case_data as unknown as Claim);
    if (draftResult.createdAt && !claim.draftClaimCreatedAt) {
      claim.draftClaimCreatedAt = new Date(draftResult.createdAt);
    }
    const carmEnabled = await isCarmEnabledForCase(claim.draftClaimCreatedAt);
    const form: GenericForm<CitizenTelephoneNumber> = new GenericForm(new CitizenTelephoneNumber(req.body.telephoneNumber === '' ? undefined : req.body.telephoneNumber, undefined, true));
    form.validateSync();

    if (form.hasErrors()) {
      renderView(form, res, carmEnabled);
    } else {
      await saveTelephone(req, form.model, ClaimantOrDefendant.CLAIMANT);
      res.redirect(CLAIMANT_TASK_LIST_URL);
    }
  } catch (error) {
    next(error);
  }
}) as RequestHandler);

export default claimantPhoneController;
