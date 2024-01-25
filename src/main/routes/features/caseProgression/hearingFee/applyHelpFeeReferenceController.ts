import {NextFunction, Request, RequestHandler, Response, Router} from 'express';
import {
  APPLY_HELP_WITH_FEES_REFERENCE, APPLY_HELP_WITH_FEES_START,
  DASHBOARD_CLAIMANT_URL, GENERIC_HELP_FEES_URL, HEARING_FEE_APPLY_HELP_FEE_SELECTION,
  HEARING_FEE_CANCEL_JOURNEY, HEARING_FEE_CONFIRMATION_URL,
} from 'routes/urls';
import {GenericForm} from 'form/models/genericForm';
import {constructResponseUrlWithIdParams} from 'common/utils/urlFormatter';
import {AppRequest} from 'models/AppRequest';
import {generateRedisKey, getCaseDataFromStore} from 'modules/draft-store/draftStoreService';
import {getButtonsContents} from 'services/features/caseProgression/hearingFee/applyHelpFeeSelectionButtonContents';
import {saveCaseProgression} from 'services/features/caseProgression/caseProgressionService';
import {Claim} from 'models/claim';
import {ApplyHelpFeesReferenceForm} from 'form/models/caseProgression/hearingFee/applyHelpFeesReferenceForm';
import {
  getApplyHelpFeeReferenceContents,
} from 'services/features/caseProgression/hearingFee/applyHelpFeeReferenceContents';
import {YesNo} from 'form/models/yesNo';
import {triggerNotifyEvent} from 'services/features/caseProgression/hearingFee/hearingFeeService';

const applyHelpFeeReferenceViewPath  = 'features/caseProgression/hearingFee/apply-help-fee-reference';
const applyHelpFeeReferenceController: Router = Router();
const helpFeeReferenceNumberForm = 'helpFeeReferenceNumberForm';

async function renderView(res: Response, req: AppRequest | Request, form: GenericForm<ApplyHelpFeesReferenceForm>, claimId: string, redirectUrl: string) {
  const redisClaimId = generateRedisKey(<AppRequest>req);
  const claim: Claim = await getCaseDataFromStore(redisClaimId);
  if (!form.hasErrors()) {
    form = claim.caseProgression?.helpFeeReferenceNumberForm ? new GenericForm(claim.caseProgression.helpFeeReferenceNumberForm) : form;
  }
  const startApplyHelpFee = constructResponseUrlWithIdParams(req.params.id, APPLY_HELP_WITH_FEES_START);
  const genericHelpFeeUrl : string = GENERIC_HELP_FEES_URL;
  res.render(applyHelpFeeReferenceViewPath,
    {
      redirectUrl,
      form,
      startApplyHelpFee,
      genericHelpFeeUrl,
      applyHelpFeeReferenceContents: getApplyHelpFeeReferenceContents(),
      applyHelpFeeReferenceButtonContents: getButtonsContents(claimId),
    });
}

applyHelpFeeReferenceController.get(APPLY_HELP_WITH_FEES_REFERENCE, (async (req, res, next: NextFunction) => {
  try{
    const claimId = req.params.id;
    const redirectUrl = constructResponseUrlWithIdParams(claimId, DASHBOARD_CLAIMANT_URL);
    await renderView(res, req, new GenericForm(new ApplyHelpFeesReferenceForm()), claimId, redirectUrl);
  }catch (error) {
    next(error);
  }

}) as RequestHandler);

applyHelpFeeReferenceController.post(APPLY_HELP_WITH_FEES_REFERENCE, (async (req:AppRequest | Request, res, next) => {
  try{
    const claimId = req.params.id;
    const redisClaimId = generateRedisKey(<AppRequest>req);
    const form = new GenericForm(new ApplyHelpFeesReferenceForm(req.body.option, req.body.referenceNumber));
    form.validateSync();
    await form.validate();
    if (form.hasErrors()) {
      const redirectUrl = constructResponseUrlWithIdParams(claimId, HEARING_FEE_CANCEL_JOURNEY);
      await renderView(res, req, form, claimId, redirectUrl);
    } else {
      let redirectUrl = HEARING_FEE_APPLY_HELP_FEE_SELECTION;
      await saveCaseProgression(redisClaimId, form.model, helpFeeReferenceNumberForm);
      if (form.model.option === YesNo.YES) {
        const claim: Claim = await getCaseDataFromStore(redisClaimId);
        await triggerNotifyEvent(claimId, req, claim);
        redirectUrl = HEARING_FEE_CONFIRMATION_URL;
      }
      res.redirect(constructResponseUrlWithIdParams(claimId, redirectUrl));
    }
  }catch (error) {
    next(error);
  }

})as RequestHandler);

export default applyHelpFeeReferenceController;

