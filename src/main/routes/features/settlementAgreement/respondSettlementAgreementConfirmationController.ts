import {RequestHandler, Router} from 'express';
import {DEFENDANT_SIGN_SETTLEMENT_AGREEMENT_CONFIRMATION} from 'routes/urls';
import {getLng} from 'common/utils/languageToggleUtils';
import {
  getRespondSettlementAgreementConfirmationContent,
} from 'services/features/settlementAgreement/respondSettlementAgreementConfirmationContentService';
import {respondSettlementAgreementConfirmationGuard} from 'routes/guards/respondSettlementAgreementConfirmationGuard';
import {getClaimById} from 'modules/utilityService';
import {deleteDraftClaimFromStore, generateRedisKey} from 'modules/draft-store/draftStoreService';
import {AppRequest} from 'models/AppRequest';

const respondSettlementAgreementConfirmationViewPath = 'features/settlementAgreement/respond-settlement-agreement-confirmation';
const respondSettlementAgreementConfirmationController = Router();

respondSettlementAgreementConfirmationController.get(DEFENDANT_SIGN_SETTLEMENT_AGREEMENT_CONFIRMATION, respondSettlementAgreementConfirmationGuard, (async (req: AppRequest, res, next) => {
  try {
    const lang = req.query.lang ? req.query.lang : req.cookies.lang;
    const claimId = req.params.id;
    const claim = await getClaimById(claimId, req, true);
    claim.id = claimId;
    const claimantResponseConfirmationContent = getRespondSettlementAgreementConfirmationContent(claim, getLng(lang));
    res.render(respondSettlementAgreementConfirmationViewPath, {
      claimantResponseConfirmationContent,
    });
    await deleteDraftClaimFromStore(generateRedisKey(req));
  } catch (error) {
    next(error);
  }
}) as RequestHandler);

export default respondSettlementAgreementConfirmationController;
