import {NextFunction, RequestHandler, Router} from 'express';
import {
  DASHBOARD_CLAIMANT_URL,
  DEFENDANT_SUMMARY_URL,
  REQUEST_FOR_RECONSIDERATION_CONFIRMATION_URL,
} from 'routes/urls';
import {AppRequest} from 'models/AppRequest';
import config from 'config';
import {CivilServiceClient} from 'client/civilServiceClient';
import {CaseRole} from 'form/models/caseRoles';
import {constructResponseUrlWithIdParams} from 'common/utils/urlFormatter';
import {
  getRequestForReconsiderationConfirmationContent,
} from 'services/features/caseProgression/requestForReconsideration/requestForReviewContent';
import {Claim} from 'models/claim';

const requestForReconsiderationConfirmationViewPath = 'features/caseProgression/requestForReconsideration/confirmation.njk';
const requestForReconsiderationConfirmationController = Router();
const civilServiceApiBaseUrl = config.get<string>('services.civilService.url');
const civilServiceClient: CivilServiceClient = new CivilServiceClient(civilServiceApiBaseUrl);

requestForReconsiderationConfirmationController.get(REQUEST_FOR_RECONSIDERATION_CONFIRMATION_URL, (async (req, res, next: NextFunction) => {
  try {
    const claimId = req.params.id;
    const claim: Claim = await civilServiceClient.retrieveClaimDetails(claimId, <AppRequest>req);
    const lang = req.query.lang ? req.query.lang : req.cookies.lang;
    const dashboardUrl = claim.caseRole === CaseRole.CLAIMANT
      ? constructResponseUrlWithIdParams(claimId, DASHBOARD_CLAIMANT_URL)
      : constructResponseUrlWithIdParams(claimId, DEFENDANT_SUMMARY_URL);
    const requestForReconsiderationDoc = '/#'; //TODO: placeholder for request for reconsideration document
    res.render(requestForReconsiderationConfirmationViewPath, {
      confirmationContents:getRequestForReconsiderationConfirmationContent(claim, lang),
      requestForReconsiderationDoc: requestForReconsiderationDoc,
      dashboardUrl});
  } catch (error) {
    next(error);
  }
}) as RequestHandler);

export default requestForReconsiderationConfirmationController;
