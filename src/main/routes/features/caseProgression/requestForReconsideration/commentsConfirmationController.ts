import {NextFunction, RequestHandler, Router} from 'express';
import {
  DASHBOARD_CLAIMANT_URL,
  DEFENDANT_SUMMARY_URL, REQUEST_FOR_RECONSIDERATION_COMMENTS_CONFIRMATION_URL,
} from 'routes/urls';
import {AppRequest} from 'models/AppRequest';
import config from 'config';
import {CivilServiceClient} from 'client/civilServiceClient';
import {CaseRole} from 'form/models/caseRoles';
import {constructResponseUrlWithIdParams} from 'common/utils/urlFormatter';
import {Claim} from 'models/claim';
import {
  getRequestForReconsiderationCommentsConfirmationContent,
} from 'services/features/caseProgression/requestForReconsideration/requestForReviewCommentsContent';

const requestForReconsiderationConfirmationViewPath = 'features/caseProgression/requestForReconsideration/comments-confirmation.njk';
const requestForReconsiderationCommentsConfirmationController = Router();
const civilServiceApiBaseUrl = config.get<string>('services.civilService.url');
const civilServiceClient: CivilServiceClient = new CivilServiceClient(civilServiceApiBaseUrl);

requestForReconsiderationCommentsConfirmationController.get(REQUEST_FOR_RECONSIDERATION_COMMENTS_CONFIRMATION_URL, (async (req, res, next: NextFunction) => {
  try {
    const claimId = req.params.id;
    const claim: Claim = await civilServiceClient.retrieveClaimDetails(claimId, <AppRequest>req);
    const lang = req.query.lang ? req.query.lang : req.cookies.lang;
    const dashboardUrl = claim.caseRole === CaseRole.CLAIMANT
      ? constructResponseUrlWithIdParams(claimId, DASHBOARD_CLAIMANT_URL)
      : constructResponseUrlWithIdParams(claimId, DEFENDANT_SUMMARY_URL);

    res.render(requestForReconsiderationConfirmationViewPath, {
      confirmationContents:getRequestForReconsiderationCommentsConfirmationContent(claim, lang, dashboardUrl),
      noCrumbs: true});
  } catch (error) {
    next(error);
  }
}) as RequestHandler);

export default requestForReconsiderationCommentsConfirmationController;
