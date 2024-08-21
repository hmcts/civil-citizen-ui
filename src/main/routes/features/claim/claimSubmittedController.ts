import {NextFunction, RequestHandler, Response, Router} from 'express';
import {CLAIM_CONFIRMATION_URL, CLAIM_FEE_BREAKUP} from '../../urls';
import {formatDateToFullDate} from 'common/utils/dateUtils';
import {AppRequest} from 'models/AppRequest';
import {CivilServiceClient} from 'client/civilServiceClient';
import config from 'config';

const claimSubmittedView = 'features/claim/claim-submitted';
const claimSubmittedController = Router();
const civilServiceApiBaseUrl = config.get<string>('services.civilService.url');
const civilServiceClient: CivilServiceClient = new CivilServiceClient(civilServiceApiBaseUrl);

claimSubmittedController.get(CLAIM_CONFIRMATION_URL, (async (req: AppRequest, res: Response, next: NextFunction) => {
  try {
    const claimId = req.params.id;
    const claim = await civilServiceClient.retrieveClaimDetails(claimId, req);
    const lang = req.query.lang? req.query.lang : req.cookies.lang;

    if(!claim.isEmpty()) {
      const claimNumber = claim.getFormattedCaseReferenceNumber(claimId);
      const defendantFullName = claim.getDefendantFullName();
      const defendantResponseLimit = formatDateToFullDate(claim.respondent1ResponseDeadline, lang);
      const helpWithFee = claim.hasHelpWithFees();
      const redirectUrl = CLAIM_FEE_BREAKUP.replace(':id', claimId);

      res.render(claimSubmittedView, {
        claimNumber,
        defendantFullName,
        defendantResponseLimit,
        helpWithFee,
        claimId,
        redirectUrl,
        pageTitle: 'PAGES.CLAIM_SUBMITTED.PAGE_TITLE',
      });
    }
  } catch (error) {
    next(error);
  }
}) as RequestHandler);

export default claimSubmittedController;
