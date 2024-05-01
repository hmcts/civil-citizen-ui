import {NextFunction, Request, RequestHandler, Response, Router} from 'express';
import {APPLICATION_COSTS_URL} from 'routes/urls';
import {GenericForm} from 'common/form/models/genericForm';
import {AppRequest} from 'common/models/AppRequest';
import {getClaimById} from 'modules/utilityService';
import {generateRedisKey} from 'modules/draft-store/draftStoreService';
import {getCancelUrl, saveApplicationCosts} from 'services/features/generalApplication/generalApplicationService';
import {selectedApplicationType} from 'models/generalApplication/applicationType';
import {GenericYesNo} from 'form/models/genericYesNo';
import {Claim} from 'models/claim';

const applicationCostsController = Router();
const viewPath = 'features/generalApplication/application-costs';
const backLinkUrl = 'test'; // TODO: add url

function renderView(form: GenericForm<GenericYesNo>, claim: Claim, claimId: string, cancelUrl: string, res: Response): void {
  const applicationType = selectedApplicationType[claim.generalApplication?.applicationType?.option];
  res.render(viewPath, {
    form,
    cancelUrl: cancelUrl,
    backLinkUrl,
    applicationType,
  });
}

applicationCostsController.get(APPLICATION_COSTS_URL, (async (req: AppRequest, res: Response, next: NextFunction) => {
  try {
    const claimId = req.params.id;
    const claim = await getClaimById(claimId, req, true);
    const form = new GenericForm(new GenericYesNo(claim.generalApplication?.applicationCosts));
    const cancelUrl = await getCancelUrl(claimId, claim);
    renderView(form, claim, claimId, cancelUrl, res);
  } catch (error) {
    next(error);
  }
}) as RequestHandler);

applicationCostsController.post(APPLICATION_COSTS_URL, (async (req: AppRequest | Request, res: Response, next: NextFunction) => {
  try {
    const claimId = req.params.id;
    const claim = await getClaimById(claimId, req, true);
    const redisKey = generateRedisKey(<AppRequest>req);
    const cancelUrl = await getCancelUrl(claimId, claim);
    const form = new GenericForm(new GenericYesNo(req.body.option, 'ERRORS.GENERAL_APPLICATION.APPLICATION_COSTS_YES_NO_SELECTION'));
    await form.validate();

    if (form.hasErrors()) {
      renderView(form, claim, claimId, cancelUrl, res);
    } else {
      await saveApplicationCosts(redisKey, req.body.option);
      res.redirect('test'); // TODO: add url
    }
  } catch (error) {
    next(error);
  }
}) as RequestHandler);
export default applicationCostsController;
