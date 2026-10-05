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
import {GenericForm} from 'form/models/genericForm';
import {
  CANCEL_UNISSUED_CLAIM_SPEC_REASON_MAX_LENGTH,
  CancelUnissuedClaimSpecReason,
} from 'form/models/cancelUnissuedClaimSpec/cancelUnissuedClaimSpecReason';

const cancelUnissuedClaimSpecViewPath = 'features/cancelUnissuedClaimSpec/cancel-unissued-claim-spec';
const cancelUnissuedClaimSpecConfirmationViewPath = 'features/cancelUnissuedClaimSpec/cancel-unissued-claim-spec-confirmation';
const cancelUnissuedClaimSpecController = Router();
const civilServiceApiBaseUrl = config.get<string>('services.civilService.url');
const civilServiceClient: CivilServiceClient = new CivilServiceClient(civilServiceApiBaseUrl);

const renderView = (res: Response, claimId: string, form: GenericForm<CancelUnissuedClaimSpecReason>): void => {
  res.render(cancelUnissuedClaimSpecViewPath, {
    form,
    maxLength: CANCEL_UNISSUED_CLAIM_SPEC_REASON_MAX_LENGTH,
    dashboardUrl: constructResponseUrlWithIdParams(claimId, DASHBOARD_CLAIMANT_URL),
    pageTitle: 'PAGES.CANCEL_UNISSUED_CLAIM_SPEC.PAGE_TITLE',
  });
};

cancelUnissuedClaimSpecController.get(CANCEL_UNISSUED_CLAIM_SPEC_URL, cancelUnissuedClaimSpecGuard, (async (req: AppRequest, res: Response, next: NextFunction) => {
  try {
    const claimId = getRouteParam(req, 'id');
    const unsubmittedReason = req.session.cancelUnissuedClaimSpecReason;
    // The language toggle reloads the page with ?lang=, so keep text that failed validation and show its error again
    if (req.query.lang && unsubmittedReason?.claimId === claimId) {
      const form = new GenericForm(new CancelUnissuedClaimSpecReason(unsubmittedReason.reason));
      await form.validate();
      return renderView(res, claimId, form);
    }
    delete req.session.cancelUnissuedClaimSpecReason;
    renderView(res, claimId, new GenericForm(new CancelUnissuedClaimSpecReason()));
  } catch (error) {
    next(error);
  }
}) as RequestHandler);

cancelUnissuedClaimSpecController.post(CANCEL_UNISSUED_CLAIM_SPEC_URL, cancelUnissuedClaimSpecGuard, (async (req: AppRequest, res: Response, next: NextFunction) => {
  try {
    const claimId = getRouteParam(req, 'id');
    // Browsers submit new lines as \r\n; count them as one character, as the character count component does
    const reason = typeof req.body.cancelReason === 'string' ? req.body.cancelReason.replace(/\r\n/g, '\n').trim() : '';
    const form = new GenericForm(new CancelUnissuedClaimSpecReason(reason));
    await form.validate();
    if (form.hasErrors()) {
      req.session.cancelUnissuedClaimSpecReason = {claimId, reason};
      return renderView(res, claimId, form);
    }
    delete req.session.cancelUnissuedClaimSpecReason;
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
