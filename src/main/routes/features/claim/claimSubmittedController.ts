import {NextFunction, RequestHandler, Response, Router} from 'express';
import {
  CLAIM_CONFIRMATION_URL,
  CLAIM_FEE_BREAKUP,
  CLAIM_FEE_CHANGE_URL,
} from '../../urls';
import {formatDateToFullDate} from 'common/utils/dateUtils';
import {AppRequest} from 'models/AppRequest';
import {checkIfClaimFeeHasChanged} from 'services/features/claim/amount/checkClaimFee';
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
      const isClaimFeeChanged = await checkIfClaimFeeHasChanged(claimId, claim, req);
      const claimFeeBreakUpUrl = CLAIM_FEE_BREAKUP.replace(':id', claimId);
      const feeChangeUrl = CLAIM_FEE_CHANGE_URL.replace(':id', claimId);
      const redirectUrl = isClaimFeeChanged ? feeChangeUrl : claimFeeBreakUpUrl;

      res.render(claimSubmittedView, {
        claimNumber,
        defendantFullName,
        defendantResponseLimit,
        helpWithFee,
        claimId,
        redirectUrl,
      });
    }
  } catch (error) {
    next(error);
  }
}) as RequestHandler);

export default claimSubmittedController;
