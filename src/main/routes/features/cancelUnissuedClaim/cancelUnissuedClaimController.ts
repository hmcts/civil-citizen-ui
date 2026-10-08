import {NextFunction, RequestHandler, Response, Router} from 'express';
import config from 'config';
import {
  CANCEL_UNISSUED_CLAIM_CONFIRMATION_URL,
  CANCEL_UNISSUED_CLAIM_URL,
  CLAIM_FEE_BREAKUP,
  CLAIM_FEE_MAKE_PAYMENT_AGAIN_URL,
  DASHBOARD_CLAIMANT_URL,
} from 'routes/urls';
import {AppRequest} from 'models/AppRequest';
import {CivilServiceClient} from 'client/civilServiceClient';
import {ClaimUpdate} from 'models/events/eventDto';
import {constructResponseUrlWithIdParams} from 'common/utils/urlFormatter';
import {getRouteParam} from 'common/utils/routeParamUtils';
import {deleteDraftClaimFromStore, generateRedisKey} from 'modules/draft-store/draftStoreService';
import {cancelUnissuedClaimGuard} from 'routes/guards/cancelUnissuedClaimGuard';
import {unissuedClaimCancelledGuard} from 'routes/guards/unissuedClaimCancelledGuard';
import {GenericForm} from 'form/models/genericForm';
import {
  CANCEL_UNISSUED_CLAIM_REASON_MAX_LENGTH,
  CancelUnissuedClaimReason,
} from 'form/models/cancelUnissuedClaim/cancelUnissuedClaimReason';

const cancelUnissuedClaimViewPath = 'features/cancelUnissuedClaim/cancel-unissued-claim';
const cancelUnissuedClaimConfirmationViewPath = 'features/cancelUnissuedClaim/cancel-unissued-claim-confirmation';
const cancelUnissuedClaimController = Router();
const civilServiceApiBaseUrl = config.get<string>('services.civilService.url');
const civilServiceClient: CivilServiceClient = new CivilServiceClient(civilServiceApiBaseUrl);

// This router is registered before the claim fee payment routers, so the guard runs first and stops payment once
// the unissued claim has been cancelled; otherwise it passes the request on to the payment routes
cancelUnissuedClaimController.all([CLAIM_FEE_BREAKUP, CLAIM_FEE_MAKE_PAYMENT_AGAIN_URL], unissuedClaimCancelledGuard);

const renderView = (res: Response, claimId: string, form: GenericForm<CancelUnissuedClaimReason>): void => {
  res.render(cancelUnissuedClaimViewPath, {
    form,
    maxLength: CANCEL_UNISSUED_CLAIM_REASON_MAX_LENGTH,
    dashboardUrl: constructResponseUrlWithIdParams(claimId, DASHBOARD_CLAIMANT_URL),
    pageTitle: 'PAGES.CANCEL_UNISSUED_CLAIM.PAGE_TITLE',
  });
};

cancelUnissuedClaimController.get(CANCEL_UNISSUED_CLAIM_URL, cancelUnissuedClaimGuard, (async (req: AppRequest, res: Response, next: NextFunction) => {
  try {
    const claimId = getRouteParam(req, 'id');
    const unsubmittedReason = req.session.cancelUnissuedClaimReason;
    // The language toggle reloads the page with ?lang=, so keep text that failed validation and show its error again
    if (req.query.lang && unsubmittedReason?.claimId === claimId) {
      const form = new GenericForm(new CancelUnissuedClaimReason(unsubmittedReason.reason));
      await form.validate();
      return renderView(res, claimId, form);
    }
    delete req.session.cancelUnissuedClaimReason;
    renderView(res, claimId, new GenericForm(new CancelUnissuedClaimReason()));
  } catch (error) {
    next(error);
  }
}) as RequestHandler);

cancelUnissuedClaimController.post(CANCEL_UNISSUED_CLAIM_URL, cancelUnissuedClaimGuard, (async (req: AppRequest, res: Response, next: NextFunction) => {
  try {
    const claimId = getRouteParam(req, 'id');
    // Browsers submit new lines as \r\n; count them as one character, as the character count component does
    const reason = typeof req.body.cancelReason === 'string' ? req.body.cancelReason.replace(/\r\n/g, '\n').trim() : '';
    const form = new GenericForm(new CancelUnissuedClaimReason(reason));
    await form.validate();
    if (form.hasErrors()) {
      req.session.cancelUnissuedClaimReason = {claimId, reason};
      return renderView(res, claimId, form);
    }
    delete req.session.cancelUnissuedClaimReason;
    const claimUpdate: ClaimUpdate = reason ? {cancelUnissuedClaimReason: reason} : {};
    await civilServiceClient.submitCancelUnissuedClaim(claimId, claimUpdate, req);
    await deleteDraftClaimFromStore(generateRedisKey(req));
    res.redirect(constructResponseUrlWithIdParams(claimId, CANCEL_UNISSUED_CLAIM_CONFIRMATION_URL));
  } catch (error) {
    next(error);
  }
}) as RequestHandler);

cancelUnissuedClaimController.get(CANCEL_UNISSUED_CLAIM_CONFIRMATION_URL, (async (req: AppRequest, res: Response, next: NextFunction) => {
  try {
    res.render(cancelUnissuedClaimConfirmationViewPath, {
      pageTitle: 'PAGES.CANCEL_UNISSUED_CLAIM.CONFIRMATION_PAGE_TITLE',
    });
  } catch (error) {
    next(error);
  }
}) as RequestHandler);

export default cancelUnissuedClaimController;
