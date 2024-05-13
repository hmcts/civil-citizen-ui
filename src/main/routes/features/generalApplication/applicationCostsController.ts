import {NextFunction, RequestHandler, Response, Router} from 'express';
import {GA_APPLICATION_COSTS_URL} from 'routes/urls';
import {AppRequest} from 'common/models/AppRequest';
import {selectedApplicationType} from 'common/models/generalApplication/applicationType';
import {getClaimById} from 'modules/utilityService';
import {Claim} from 'models/claim';
import {getApplicationCostsContent} from 'services/features/generalApplication/applicationCostsService';
import {YesNo} from 'form/models/yesNo';

const applicationCostsController = Router();
const viewPath = 'features/generalApplication/application-costs';
const backLinkUrl = 'test'; // TODO: add url

async function renderView(claim: Claim, req: AppRequest, res: Response): Promise<void> {
  const lang = req.query.lang ? req.query.lang : req.cookies.lang;
  const applicationType = selectedApplicationType[claim.generalApplication?.applicationType?.option];
  const applicationCostsContent = await getApplicationCostsContent(
    claim.generalApplication?.applicationType?.option, claim.generalApplication?.agreementFromOtherParty,
    claim.generalApplication?.informOtherParties?.option as YesNo, lang, req);
  res.render(viewPath, { backLinkUrl, applicationType, applicationCostsContent });
}

applicationCostsController.get(GA_APPLICATION_COSTS_URL, (async (req: AppRequest, res: Response, next: NextFunction) => {
  try {
    const claimId = req.params.id;
    const claim = await getClaimById(claimId, req, true);
    await renderView(claim, req, res);
  } catch (error) {
    next(error);
  }
}) as RequestHandler);

export default applicationCostsController;
