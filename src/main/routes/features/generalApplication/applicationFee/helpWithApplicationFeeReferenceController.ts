import {NextFunction, Request, RequestHandler, Response, Router} from 'express';
import {
  DASHBOARD_CLAIMANT_URL,
  GA_APPLY_HELP_WITH_FEE_REFERENCE, GA_APPLY_HELP_WITH_FEE_SELECTION,
  GA_APPLY_HELP_WITH_FEES_START, GA_CHECK_ANSWERS_URL,
  GENERIC_HELP_FEES_URL,
} from 'routes/urls';
import {GenericForm} from 'form/models/genericForm';
import {constructResponseUrlWithIdParams} from 'common/utils/urlFormatter';
import {AppRequest} from 'models/AppRequest';
import {generateRedisKey, getCaseDataFromStore} from 'modules/draft-store/draftStoreService';
import {Claim} from 'models/claim';
import {ApplyHelpFeesReferenceForm} from 'form/models/caseProgression/hearingFee/applyHelpFeesReferenceForm';
import {YesNo} from 'form/models/yesNo';
import {getClaimById} from 'modules/utilityService';
import {saveApplicationHWFNumber} from 'services/features/generalApplication/generalApplicationService';
import {
  getHelpWithApplicationFeeReferenceContents,getButtonsContents}
  from 'services/features/generalApplication/applicationFee/helpWithFeeReferenceContents';

const applyHelpWithFeeReferenceViewPath  = 'features/generalApplication/applicationFee/help-with-application-fee-reference';
const helpWithApplicationFeeReferenceController: Router = Router();

async function renderView(res: Response, req: AppRequest | Request, form: GenericForm<ApplyHelpFeesReferenceForm>, claimId: string, redirectUrl: string) {
  const claim: Claim = await getClaimById(claimId, req, true);
  if (!form.hasErrors()) {
    form = claim.generalApplication.helpFeeReferenceNumberForm ? new GenericForm(claim.generalApplication.helpFeeReferenceNumberForm) : form;
  }
  const backLinkUrl = constructResponseUrlWithIdParams(req.params.id, GA_APPLY_HELP_WITH_FEES_START);
  const genericHelpFeeUrl : string = GENERIC_HELP_FEES_URL;
  res.render(applyHelpWithFeeReferenceViewPath,
    {
      redirectUrl,
      form,
      backLinkUrl,
      genericHelpFeeUrl,
      applyHelpWithFeeReferenceContents: getHelpWithApplicationFeeReferenceContents(),
      applyHelpWithFeeReferenceButtonContents: getButtonsContents(claimId),
    });
}

helpWithApplicationFeeReferenceController.get(GA_APPLY_HELP_WITH_FEE_REFERENCE, (async (req, res, next: NextFunction) => {
  try{
    const claimId = req.params.id;
    const redirectUrl = constructResponseUrlWithIdParams(claimId, DASHBOARD_CLAIMANT_URL);
    await renderView(res, req, new GenericForm(new ApplyHelpFeesReferenceForm()), claimId, redirectUrl);
  }catch (error) {
    next(error);
  }
}) as RequestHandler);

helpWithApplicationFeeReferenceController.post(GA_APPLY_HELP_WITH_FEE_REFERENCE, (async (req: AppRequest | Request, res: Response, next) => {
  try{
    const claimId = req.params.id;
    const redisClaimId = generateRedisKey(<AppRequest>req);
    const form = new GenericForm(new ApplyHelpFeesReferenceForm(req.body.option, req.body.referenceNumber));
    form.validateSync();
    await form.validate();
    if (form.hasErrors()) {
      const redirectUrl = constructResponseUrlWithIdParams(claimId, GA_APPLY_HELP_WITH_FEE_REFERENCE);
      await renderView(res, req, form, claimId, redirectUrl);
    } else {
      const claim: Claim = await getCaseDataFromStore(redisClaimId);
      let redirectUrl = GA_APPLY_HELP_WITH_FEE_SELECTION;
      if (form.model.option === YesNo.YES) {
        redirectUrl = GA_CHECK_ANSWERS_URL;
      }
      await saveApplicationHWFNumber(redisClaimId, claim, new ApplyHelpFeesReferenceForm(req.body.option, req.body.referenceNumber));
      res.redirect(constructResponseUrlWithIdParams(claimId, redirectUrl));
    }
  }catch (error) {
    next(error);
  }
})as RequestHandler);
export default helpWithApplicationFeeReferenceController;
