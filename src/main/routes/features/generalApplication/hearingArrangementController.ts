import {NextFunction, Request, RequestHandler, Response, Router} from 'express';
import {
  GA_HEARING_ARRANGEMENT_URL,
  GA_HEARING_ARRANGEMENTS_GUIDANCE,
  GA_HEARING_CONTACT_DETAILS_URL,
} from 'routes/urls';
import {GenericForm} from 'common/form/models/genericForm';
import {AppRequest} from 'common/models/AppRequest';
import {selectedApplicationType} from 'common/models/generalApplication/applicationType';
import {getCancelUrl, getLast, saveHearingArrangement } from 'services/features/generalApplication/generalApplicationService';
import {generateRedisKey} from 'modules/draft-store/draftStoreService';
import {getClaimById} from 'modules/utilityService';
import {Claim} from 'models/claim';
import {HearingArrangement} from 'models/generalApplication/hearingArrangement';
import {getListOfCourtLocations} from 'services/features/directionsQuestionnaire/hearing/specificCourtLocationService';
import {constructResponseUrlWithIdParams} from 'common/utils/urlFormatter';

const hearingArrangementController = Router();
const viewPath = 'features/generalApplication/hearing-arrangement';

async function renderView(claimId: string, claim: Claim, form: GenericForm<HearingArrangement>, req: AppRequest | Request, res: Response): Promise<void> {
  const applicationType = selectedApplicationType[getLast(claim.generalApplication?.applicationTypes)?.option];
  const cancelUrl = await getCancelUrl(claimId, claim);
  const courtLocations = await getListOfCourtLocations(<AppRequest> req);
  const backLinkUrl = constructResponseUrlWithIdParams(claimId, GA_HEARING_ARRANGEMENTS_GUIDANCE);
  res.render(viewPath, { form, cancelUrl, backLinkUrl, applicationType, courtLocations });
}

hearingArrangementController.get(GA_HEARING_ARRANGEMENT_URL, (async (req: AppRequest, res: Response, next: NextFunction) => {
  try {
    const claimId = req.params.id;
    const claim = await getClaimById(claimId, req, true);
    const hearingArrangement = claim.generalApplication?.hearingArrangement || new HearingArrangement();
    const form = new GenericForm(hearingArrangement);
    await renderView(claimId, claim, form, req, res);
  } catch (error) {
    next(error);
  }
}) as RequestHandler);

hearingArrangementController.post(GA_HEARING_ARRANGEMENT_URL, (async (req: AppRequest | Request, res: Response, next: NextFunction) => {
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

export default hearingArrangementController;
