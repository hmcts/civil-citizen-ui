import {NextFunction, Request, Response, Router} from 'express';
import {constructResponseUrlWithIdParams} from 'common/utils/urlFormatter';
import {
  CLAIMANT_SIGN_SETTLEMENT_AGREEMENT,
  CLAIMANT_RESPONSE_TASK_LIST_URL,
  CLAIM_TASK_LIST_URL,
} from '../../urls';
import {GenericForm} from 'common/form/models/genericForm';
import {getClaimantResponse, saveClaimantResponse} from 'services/features/claimantResponse/claimantResponseService';
import {getCaseDataFromStore} from 'modules/draft-store/draftStoreService';
import {SignSettlmentAgreement} from 'common/form/models/claimantResponse/signSettlementAgreement';
import {getAmount, getFinalPaymentDate, getFirstRepaymentDate, getPaymentAmount, getRepaymentFrequency} from 'common/utils/repaymentUtils';
import {SignSettlmentAgreementGuard} from 'routes/guards/signSettlmentAgreementGuard';

const signSettlementAgreementViewPath = 'features/claimantResponse/sign-settlement-agreement';
const signSettlementAgreementController = Router();
const crPropertyName = 'signed';
const crParentName = 'signSettlementAgreement';

function renderView(form: GenericForm<SignSettlmentAgreement>, res: Response, data?:object): void {
  res.render(signSettlementAgreementViewPath, {form,data});
}

signSettlementAgreementController.get(CLAIMANT_SIGN_SETTLEMENT_AGREEMENT, SignSettlmentAgreementGuard.apply(CLAIM_TASK_LIST_URL), async (req:Request, res:Response, next: NextFunction) => {
  try {
    const claim = await getCaseDataFromStore(req.params.id);
    const data = {
      amount:getAmount(claim),
      defendant: claim.getDefendantFullName(),
      firstRepaymentDate: getFirstRepaymentDate(claim),
      finalRepaymentDate: getFinalPaymentDate(claim),
      paymentAmount:getPaymentAmount(),
      repaymentFrequency:getRepaymentFrequency(),
    };

    const claimantResponse = await getClaimantResponse(req.params.id);
    renderView(new GenericForm(claimantResponse.signSettlementAgreement), res, data);
  } catch (error) {
    next(error);
  }
});

signSettlementAgreementController.post(CLAIMANT_SIGN_SETTLEMENT_AGREEMENT, async (req:Request, res:Response, next) => {
  try {
    const claimId = req.params.id;
    const signSettlementAgreement = new GenericForm(new SignSettlmentAgreement(req.body.signed));
    signSettlementAgreement.validateSync();

    if (signSettlementAgreement.hasErrors()) {
      renderView(signSettlementAgreement, res);
    } else {
      await saveClaimantResponse(claimId, signSettlementAgreement.model.signed, crPropertyName, crParentName);
      res.redirect(constructResponseUrlWithIdParams(claimId, CLAIMANT_RESPONSE_TASK_LIST_URL));
    }
  } catch (error) {
    next(error);
  }
});

export default signSettlementAgreementController;

