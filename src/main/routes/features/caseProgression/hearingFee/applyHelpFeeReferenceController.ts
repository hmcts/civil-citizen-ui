import {NextFunction, RequestHandler, Response, Router} from 'express';
import {
  APPLY_HELP_WITH_FEES_REFERENCE, APPLY_HELP_WITH_FEES_START,
  DASHBOARD_CLAIMANT_URL,
  HEARING_FEE_CANCEL_JOURNEY, HEARING_FEE_CONFIRMATION_URL,
} from 'routes/urls';
import {GenericForm} from 'form/models/genericForm';
import {constructResponseUrlWithIdParams} from 'common/utils/urlFormatter';
import {AppRequest} from 'models/AppRequest';
import {generateRedisKey, getCaseDataFromStore} from 'modules/draft-store/draftStoreService';
import {getButtonsContents} from 'services/features/caseProgression/hearingFee/applyHelpFeeSelectionButtonContents';
import {saveCaseProgression} from 'services/features/caseProgression/caseProgressionService';
import {Claim} from 'models/claim';
import {ApplyHelpFeesReferenceForm} from "form/models/caseProgression/hearingFee/applyHelpFeesReferenceForm";
import {
  getApplyHelpFeeReferenceContents
} from 'services/features/caseProgression/hearingFee/applyHelpFeeReferenceContents';

const applyHelpFeeReferenceViewPath  = 'features/caseProgression/hearingFee/apply-help-fee-reference';
const applyHelpFeeReferenceController: Router = Router();

async function renderView(res: Response, req: any, form: any, claimId: string, redirectUrl: string) {
  const redisClaimId = generateRedisKey(<AppRequest>req);
  const claim: Claim = await getCaseDataFromStore(redisClaimId);
  if (!form) {
    form = new GenericForm(new ApplyHelpFeesReferenceForm());
    if(claim.caseProgression?.helpFeeReferenceNumberForm)
    {
      form = new GenericForm(claim.caseProgression.helpFeeReferenceNumberForm);
    }
  }
  const startApplyHelpFee = constructResponseUrlWithIdParams(req.params.id, APPLY_HELP_WITH_FEES_START);
  res.render(applyHelpFeeReferenceViewPath,
    {
      redirectUrl,
      form,
      startApplyHelpFee,
      applyHelpFeeReferenceContents: getApplyHelpFeeReferenceContents(),
      applyHelpFeeReferenceButtonContents: getButtonsContents(claimId),
    });
}

applyHelpFeeReferenceController.get(APPLY_HELP_WITH_FEES_REFERENCE, (async (req, res, next: NextFunction) => {
  const claimId = req.params.id;
  const redirectUrl = constructResponseUrlWithIdParams(claimId, DASHBOARD_CLAIMANT_URL);
  await renderView(res, req, null, claimId, redirectUrl);
}) as RequestHandler);

applyHelpFeeReferenceController.post(APPLY_HELP_WITH_FEES_REFERENCE, (async (req:any, res) => {
  const claimId = req.params.id;
  const redisClaimId = generateRedisKey(<AppRequest>req);
  const form = new GenericForm(new ApplyHelpFeesReferenceForm(req.body.option));
  form.validateSync();
  await form.validate();
  if (form.hasErrors()) {
    const redirectUrl = constructResponseUrlWithIdParams(claimId, HEARING_FEE_CANCEL_JOURNEY);
    await renderView(res, req, form, claimId, redirectUrl);
  } else {
    const redirectUrl = HEARING_FEE_CONFIRMATION_URL;
    await saveCaseProgression(redisClaimId, form.model, 'helpFeeReferenceNumberForm');
    res.redirect(constructResponseUrlWithIdParams(claimId, redirectUrl));
  }
})as RequestHandler);

export default applyHelpFeeReferenceController;

