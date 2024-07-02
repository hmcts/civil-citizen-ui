import {RequestHandler, Router} from 'express';
import {DEFENDANT_SIGN_SETTLEMENT_AGREEMENT_CONFIRMATION} from 'routes/urls';
import {getLng} from 'common/utils/languageToggleUtils';
import {
  getRespondSettlementAgreementConfirmationContent,
} from 'services/features/settlementAgreement/respondSettlementAgreementConfirmationContentService';
import {respondSettlementAgreementConfirmationGuard} from 'routes/guards/respondSettlementAgreementConfirmationGuard';
import {AppRequest} from 'models/AppRequest';
import config from 'config';
import {CivilServiceClient} from 'client/civilServiceClient';

const respondSettlementAgreementConfirmationViewPath = 'features/settlementAgreement/respond-settlement-agreement-confirmation';
const respondSettlementAgreementConfirmationController = Router();
const civilServiceApiBaseUrl = config.get<string>('services.civilService.url');
const civilServiceClient: CivilServiceClient = new CivilServiceClient(civilServiceApiBaseUrl);

respondSettlementAgreementConfirmationController.get(DEFENDANT_SIGN_SETTLEMENT_AGREEMENT_CONFIRMATION, respondSettlementAgreementConfirmationGuard, (async (req, res, next) => {
  try {
    const lang = req.query.lang ? req.query.lang : req.cookies.lang;
    const claimId = req.params.id;
    const claim = await civilServiceClient.retrieveClaimDetails(claimId, <AppRequest>req);
    claim.id = claimId;
    const claimantResponseConfirmationContent = getRespondSettlementAgreementConfirmationContent(claim, getLng(lang));
    res.render(respondSettlementAgreementConfirmationViewPath, {
      claimantResponseConfirmationContent,
    });
  } catch (error) {
    next(error);
  }
}) as RequestHandler);

export default respondSettlementAgreementConfirmationController;
