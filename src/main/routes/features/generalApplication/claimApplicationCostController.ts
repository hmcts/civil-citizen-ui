import {NextFunction, Request, RequestHandler, Response, Router} from 'express';
import {
  GA_APPLICATION_COSTS_URL,
  GA_CLAIM_APPLICATION_COST_URL,
  ORDER_JUDGE_URL,
} from 'routes/urls';
import {GenericForm} from 'common/form/models/genericForm';
import {AppRequest} from 'common/models/AppRequest';
import {getClaimById} from 'modules/utilityService';
import {generateRedisKey} from 'modules/draft-store/draftStoreService';
import {getCancelUrl, getLast, saveApplicationCosts} from 'services/features/generalApplication/generalApplicationService';
import {GenericYesNo} from 'form/models/genericYesNo';
import {Claim} from 'models/claim';
import {constructResponseUrlWithIdParams} from 'common/utils/urlFormatter';
import {claimApplicationCostGuard} from 'routes/guards/generalApplication/claimApplicationCostGuard';
import {selectedApplicationType} from 'models/generalApplication/applicationTypeConstants/selectedApplicationType';

const claimApplicationCostController = Router();
const viewPath = 'features/generalApplication/claim-application-cost';

async function renderView(form: GenericForm<GenericYesNo>, claim: Claim, claimId: string, res: Response): Promise<void> {
  const applicationType = selectedApplicationType[getLast(claim.generalApplication?.applicationTypes)?.option];
  const cancelUrl = await getCancelUrl(claimId, claim);
  const backLinkUrl = constructResponseUrlWithIdParams(claimId, GA_APPLICATION_COSTS_URL);
  res.render(viewPath, {
    form,
    cancelUrl,
    backLinkUrl,
    applicationType,
  });
}

claimApplicationCostController.get(GA_CLAIM_APPLICATION_COST_URL, claimApplicationCostGuard, (async (req: AppRequest, res: Response, next: NextFunction) => {
  try {
    const claimId = req.params.id;
    const claim = await getClaimById(claimId, req, true);
    const form = new GenericForm(new GenericYesNo(claim.generalApplication?.applicationCosts));
    await renderView(form, claim, claimId, res);
  } catch (error) {
    next(error);
  }
}) as RequestHandler);

claimApplicationCostController.post(GA_CLAIM_APPLICATION_COST_URL, claimApplicationCostGuard, (async (req: AppRequest | Request, res: Response, next: NextFunction) => {
  try {
    const claimId = req.params.id;
    const claim = await getClaimById(claimId, req, true);
    const redisKey = generateRedisKey(<AppRequest>req);
    const form = new GenericForm(new GenericYesNo(req.body.option, 'ERRORS.GENERAL_APPLICATION.CLAIM_APPLICATION_COSTS_YES_NO_SELECTION'));
    await form.validate();

    if (form.hasErrors()) {
      await renderView(form, claim, claimId, res);
    } else {
      await saveApplicationCosts(redisKey, req.body.option);
      res.redirect(constructResponseUrlWithIdParams(claimId, ORDER_JUDGE_URL));
    }
  } catch (error) {
    next(error);
  }
}) as RequestHandler);

export default claimApplicationCostController;
