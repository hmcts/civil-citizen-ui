import {NextFunction, Request, RequestHandler, Response, Router} from 'express';
import {
  DEFENDANT_SIGN_SETTLEMENT_AGREEMENT,
  DEFENDANT_SIGN_SETTLEMENT_AGREEMENT_CONFIRMATION,
} from '../../urls';
import {GenericForm} from 'common/form/models/genericForm';
import {GenericYesNo} from 'form/models/genericYesNo';
import {constructResponseUrlWithIdParams} from 'common/utils/urlFormatter';
import {getClaimById} from 'modules/utilityService';
import {generateRedisKey, saveDraftClaim} from 'modules/draft-store/draftStoreService';
import {AppRequest} from 'models/AppRequest';
import {YesNo} from 'form/models/yesNo';
import {
  getRespondSettlementAgreementText,
} from 'services/features/settlementAgreement/respondSettlementAgreementService';

const respondSettlementAgreementViewPath = 'features/settlementAgreement/respond-settlement-agreement';
const respondSettlementAgreementController = Router();

function renderView(form: GenericForm<GenericYesNo>, res: Response, data?: object): void {
  res.render(respondSettlementAgreementViewPath, {form, data});
}

respondSettlementAgreementController.get(DEFENDANT_SIGN_SETTLEMENT_AGREEMENT, (async (req: Request, res: Response, next: NextFunction) => {
  try {
    const claimId = req.params.id;
    const claim = await getClaimById(claimId, req, true);
    renderView(new GenericForm(new GenericYesNo(claim.defendantSignedSettlementAgreement, 'PAGES.DEFENDANT_RESPOND_TO_SETTLEMENT_AGREEMENT.DETAILS.VALID_YES_NO_OPTION')), res, getRespondSettlementAgreementText(claim, req));
  } catch (error) {
    next(error);
  }
}) as RequestHandler);

respondSettlementAgreementController.post(DEFENDANT_SIGN_SETTLEMENT_AGREEMENT, (async (req: Request, res: Response, next) => {
  try {
    const claimId = req.params.id;
    const respondSettlementAgreement = new GenericForm(new GenericYesNo(req.body.option, 'PAGES.DEFENDANT_RESPOND_TO_SETTLEMENT_AGREEMENT.DETAILS.VALID_YES_NO_OPTION'));
    respondSettlementAgreement.validateSync();

    const claim = await getClaimById(claimId, req);
    if (respondSettlementAgreement.hasErrors()) {
      renderView(respondSettlementAgreement, res, getRespondSettlementAgreementText(claim, req));
    } else {
      claim.defendantSignedSettlementAgreement = respondSettlementAgreement.model.option as YesNo;
      await saveDraftClaim(generateRedisKey(<AppRequest>req), claim, true);
      res.redirect(constructResponseUrlWithIdParams(claimId, DEFENDANT_SIGN_SETTLEMENT_AGREEMENT_CONFIRMATION));
    }
  } catch (error) {
    next(error);
  }
}) as RequestHandler);

export default respondSettlementAgreementController;

