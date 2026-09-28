import {NextFunction, RequestHandler, Response, Router} from 'express';
import config from 'config';
import {
  CANCEL_UNISSUED_CLAIM_SPEC_CONFIRMATION_URL,
  CANCEL_UNISSUED_CLAIM_SPEC_URL,
  DASHBOARD_CLAIMANT_URL,
} from 'routes/urls';
import {AppRequest} from 'models/AppRequest';
import {CivilServiceClient} from 'client/civilServiceClient';
import {ClaimUpdate} from 'models/events/eventDto';
import {constructResponseUrlWithIdParams} from 'common/utils/urlFormatter';
import {getRouteParam} from 'common/utils/routeParamUtils';
import {deleteDraftClaimFromStore, generateRedisKey} from 'modules/draft-store/draftStoreService';
import {cancelUnissuedClaimSpecGuard} from 'routes/guards/cancelUnissuedClaimSpecGuard';

const cancelUnissuedClaimSpecViewPath = 'features/cancelUnissuedClaimSpec/cancel-unissued-claim-spec';
const cancelUnissuedClaimSpecConfirmationViewPath = 'features/cancelUnissuedClaimSpec/cancel-unissued-claim-spec-confirmation';
const cancelUnissuedClaimSpecController = Router();
const civilServiceApiBaseUrl = config.get<string>('services.civilService.url');
const civilServiceClient: CivilServiceClient = new CivilServiceClient(civilServiceApiBaseUrl);

cancelUnissuedClaimSpecController.get(CANCEL_UNISSUED_CLAIM_SPEC_URL, cancelUnissuedClaimSpecGuard, (async (req: AppRequest, res: Response, next: NextFunction) => {
  try {
    const claimId = getRouteParam(req, 'id');
    res.render(cancelUnissuedClaimSpecViewPath, {
      dashboardUrl: constructResponseUrlWithIdParams(claimId, DASHBOARD_CLAIMANT_URL),
      pageTitle: 'PAGES.CANCEL_UNISSUED_CLAIM_SPEC.PAGE_TITLE',
    });
  } catch (error) {
    next(error);
  }
}) as RequestHandler);

cancelUnissuedClaimSpecController.post(CANCEL_UNISSUED_CLAIM_SPEC_URL, cancelUnissuedClaimSpecGuard, (async (req: AppRequest, res: Response, next: NextFunction) => {
  try {
    const claimId = getRouteParam(req, 'id');
    const reason = typeof req.body.cancelReason === 'string' ? req.body.cancelReason.trim() : '';
    const claimUpdate: ClaimUpdate = reason ? {cancelUnissuedClaimSpecReason: reason} : {};
    await civilServiceClient.submitCancelUnissuedClaimSpec(claimId, claimUpdate, req);
    await deleteDraftClaimFromStore(generateRedisKey(req));
    res.redirect(constructResponseUrlWithIdParams(claimId, CANCEL_UNISSUED_CLAIM_SPEC_CONFIRMATION_URL));
  } catch (error) {
    next(error);
  }
}) as RequestHandler);

cancelUnissuedClaimSpecController.get(CANCEL_UNISSUED_CLAIM_SPEC_CONFIRMATION_URL, (async (req: AppRequest, res: Response, next: NextFunction) => {
  try {
    res.render(cancelUnissuedClaimSpecConfirmationViewPath, {
      pageTitle: 'PAGES.CANCEL_UNISSUED_CLAIM_SPEC.CONFIRMATION_PAGE_TITLE',
    });
  } catch (error) {
    next(error);
  }
}) as RequestHandler);

export default cancelUnissuedClaimSpecController;
