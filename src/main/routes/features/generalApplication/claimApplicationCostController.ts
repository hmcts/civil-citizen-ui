import {NextFunction, Request, RequestHandler, Response, Router} from 'express';
import {GA_CLAIM_APPLICATION_COST_URL} from 'routes/urls';
import {GenericForm} from 'common/form/models/genericForm';
import {AppRequest} from 'common/models/AppRequest';
import {getClaimById} from 'modules/utilityService';
import {generateRedisKey} from 'modules/draft-store/draftStoreService';
import {getCancelUrl, saveApplicationCosts} from 'services/features/generalApplication/generalApplicationService';
import {selectedApplicationType} from 'models/generalApplication/applicationType';
import {GenericYesNo} from 'form/models/genericYesNo';
import {Claim} from 'models/claim';

const claimApplicationCostController = Router();
const viewPath = 'features/generalApplication/claim-application-cost';
const backLinkUrl = 'test'; // TODO: add url

async function renderView(form: GenericForm<GenericYesNo>, claim: Claim, claimId: string, res: Response): Promise<void> {
  const applicationType = selectedApplicationType[claim.generalApplication?.applicationType?.option];
  const cancelUrl = await getCancelUrl(claimId, claim);
  res.render(viewPath, {
    form,
    cancelUrl,
    backLinkUrl,
    applicationType,
  });
}

claimApplicationCostController.get(GA_CLAIM_APPLICATION_COST_URL, (async (req: AppRequest, res: Response, next: NextFunction) => {
  try {
    const claimId = req.params.id;
    const claim = await getClaimById(claimId, req, true);
    const form = new GenericForm(new GenericYesNo(claim.generalApplication?.applicationCosts));
    await renderView(form, claim, claimId, res);
  } catch (error) {
    next(error);
  }
}) as RequestHandler);

claimApplicationCostController.post(GA_CLAIM_APPLICATION_COST_URL, (async (req: AppRequest | Request, res: Response, next: NextFunction) => {
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
      res.redirect('test'); // TODO: add url
    }
  } catch (error) {
    next(error);
  }
}) as RequestHandler);
export default claimApplicationCostController;
