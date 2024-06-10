import {NextFunction, Request, RequestHandler, Response, Router} from 'express';
import {GA_HEARING_CONTACT_DETAILS_URL, VIEW_APPLICATIONS_URL} from 'routes/urls';
import {GenericForm} from 'common/form/models/genericForm';
import {AppRequest} from 'common/models/AppRequest';
import {selectedApplicationType} from 'common/models/generalApplication/applicationType';
import {
  getCancelUrl,
  getLast,
  saveHearingArrangement
} from 'services/features/generalApplication/generalApplicationService';
import {generateRedisKey} from 'modules/draft-store/draftStoreService';
import {getClaimById} from 'modules/utilityService';
import {Claim} from 'models/claim';
import {HearingArrangement} from 'models/generalApplication/hearingArrangement';
import {getListOfCourtLocations} from 'services/features/directionsQuestionnaire/hearing/specificCourtLocationService';
import {constructResponseUrlWithIdParams} from 'common/utils/urlFormatter';
import config from 'config';
import {GeneralApplicationClient} from 'client/generalApplicationClient';

const viewMyApplicationsController = Router();
const viewPath = 'features/generalApplication/view-applications';
const backLinkUrl = 'test'; // TODO: add url
const baseUrl: string = config.get<string>('services.generalApplication.url');
const generalApplicationClient = new GeneralApplicationClient(baseUrl);

async function renderView(claimId: string, claim: Claim, form: GenericForm<HearingArrangement>, req: AppRequest | Request, res: Response): Promise<void> {
  const applicationType = selectedApplicationType[getLast(claim.generalApplication?.applicationTypes)?.option];
  const cancelUrl = await getCancelUrl(claimId, claim);
  const courtLocations = await getListOfCourtLocations(<AppRequest> req);
  res.render(viewPath, { form, cancelUrl, backLinkUrl, applicationType, courtLocations });
}

viewMyApplicationsController.get(VIEW_APPLICATIONS_URL, (async (req: AppRequest, res: Response, next: NextFunction) => {
  try {
    const claimId = req.params.id;
    const claim = await getClaimById(claimId, req, true);
    const hearingArrangement = claim.generalApplication?.hearingArrangement || new HearingArrangement();
    const form = new GenericForm(hearingArrangement);
    const claimantDashboardItems = await generalApplicationClient.getApplications(req);
    console.log(claimantDashboardItems);
    await renderView(claimId, claim, form, req, res);
  } catch (error) {
    next(error);
  }
}) as RequestHandler);

viewMyApplicationsController.post(VIEW_APPLICATIONS_URL, (async (req: AppRequest | Request, res: Response, next: NextFunction) => {
  try {
    const claimId = req.params.id;
    const claim = await getClaimById(claimId, req, true);
    const redisKey = generateRedisKey(<AppRequest>req);
    const hearingArrangement: HearingArrangement = new HearingArrangement(req.body.option, req.body.reasonForPreferredHearingType, req.body.courtLocation);
    const form = new GenericForm(hearingArrangement);
    await form.validate();
    if (form.hasErrors()) {
      await renderView(claimId, claim, form, req, res);
    } else {
      await saveHearingArrangement(redisKey, hearingArrangement);
      res.redirect(constructResponseUrlWithIdParams(claimId, GA_HEARING_CONTACT_DETAILS_URL));
    }
  } catch (error) {
    next(error);
  }
}) as RequestHandler);

export default viewMyApplicationsController;
