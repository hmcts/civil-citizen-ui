import {RequestHandler, Router} from 'express';
import {DEFENDANT_SIGN_SETTLEMENT_AGREEMENT_CONFIRMATION} from 'routes/urls';
import {getClaimById} from 'modules/utilityService';
import {getLng} from 'common/utils/languageToggleUtils';
import {
  getRespondSettlementAgreementConfirmationContent,
} from 'services/features/settlementAgreement/respondSettlementAgreementConfirmationContentService';
import {respondSettlementAgreementConfirmationGuard} from 'routes/guards/respondSettlementAgreementConfirmationGuard';

const respondSettlementAgreementConfirmationController = Router();

respondSettlementAgreementConfirmationController.get(DEFENDANT_SIGN_SETTLEMENT_AGREEMENT_CONFIRMATION, respondSettlementAgreementConfirmationGuard, (async (req, res, next) => {
  try {
    const lang = req.query.lang ? req.query.lang : req.cookies.lang;
    const claimId = req.params.id;
    const claim = await getClaimById(claimId, req, true);
    claim.id = claimId;
    const claimantResponseConfirmationContent = getRespondSettlementAgreementConfirmationContent(claim, getLng(lang));
    res.render('features/settlementAgreement/respond-settlement-agreement-confirmation', {
      claimantResponseConfirmationContent,
    });
  } catch (error) {
    next(error);
  }
}) as RequestHandler);

export default respondSettlementAgreementConfirmationController;
