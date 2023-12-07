import {NextFunction, Request, RequestHandler, Response} from 'express';
import {DEFENDANT_SIGN_SETTLEMENT_AGREEMENT} from '../../routes/urls';
import {constructResponseUrlWithIdParams} from 'common/utils/urlFormatter';
import {getClaimById} from 'modules/utilityService';

const {Logger} = require('@hmcts/nodejs-logging');
const logger = Logger.getLogger('respondSettlementAgreementConfirmationGuard');

export const respondSettlementAgreementConfirmationGuard = (async (req: Request, res: Response, next: NextFunction) => {
  try {
    const claimId = req.params.id;
    const claim = await getClaimById(claimId, req, true);
    if (!claim.defendantSignedSettlementAgreement) {
      logger.info('Redirecting to settlement agreement response from ', req.url);
      res.redirect(constructResponseUrlWithIdParams(req.params.id, DEFENDANT_SIGN_SETTLEMENT_AGREEMENT));
    } else {
      next();
    }
  } catch (error) {
    next(error);
  }
}) as RequestHandler;
