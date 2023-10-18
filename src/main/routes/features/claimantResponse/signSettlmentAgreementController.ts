import {NextFunction, Request, Response, Router} from 'express';
import {constructResponseUrlWithIdParams} from 'common/utils/urlFormatter';
import {
  CLAIMANT_SIGN_SETTLEMENT_AGREEMENT,
  CLAIMANT_RESPONSE_TASK_LIST_URL,
} from '../../urls';
import {GenericForm} from 'common/form/models/genericForm';
import {getClaimantResponse, saveClaimantResponse} from 'services/features/claimantResponse/claimantResponseService';
import {getCaseDataFromStore} from 'modules/draft-store/draftStoreService';
import {SignSettlmentAgreement} from 'common/form/models/claimantResponse/signSettlementAgreement';
import {
  getAmount,
  getFinalPaymentDate,
  getFirstRepaymentDate,
  getPaymentAmount,
  getRepaymentFrequency,
} from 'common/utils/repaymentUtils';
import {SignSettlmentAgreementGuard} from 'routes/guards/signSettlmentAgreementGuard';
import {formatDateToFullDate} from 'common/utils/dateUtils';
import {Claim} from 'common/models/claim';

const signSettlementAgreementViewPath = 'features/claimantResponse/sign-settlement-agreement';
const signSettlementAgreementController = Router();
const crPropertyName = 'signed';
const crParentName = 'signSettlementAgreement';

function renderView(form: GenericForm<SignSettlmentAgreement>, res: Response, data?: object): void {
  res.render(signSettlementAgreementViewPath, {form, data});
}

const getRepaymentPlan = (claim: Claim, req: Request) => {
  const lang = req.query.lang ? req.query.lang : req.cookies.lang;
  const data = {
    amount: getAmount(claim),
    defendant: claim.getDefendantFullName(),
    firstRepaymentDate: formatDateToFullDate(getFirstRepaymentDate(claim), lang),
    finalRepaymentDate: formatDateToFullDate(getFinalPaymentDate(claim), lang),
    paymentAmount: getPaymentAmount(claim),
    repaymentFrequency: getRepaymentFrequency(claim),
  };

  return data;
};

signSettlementAgreementController.get(CLAIMANT_SIGN_SETTLEMENT_AGREEMENT, SignSettlmentAgreementGuard.apply(CLAIMANT_RESPONSE_TASK_LIST_URL), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const claim = await getCaseDataFromStore(req.params.id);
    const claimantResponse = await getClaimantResponse(req.params.id);
    renderView(new GenericForm(claimantResponse.signSettlementAgreement), res, getRepaymentPlan(claim, req));
  } catch (error) {
    next(error);
  }
});

signSettlementAgreementController.post(CLAIMANT_SIGN_SETTLEMENT_AGREEMENT, async (req: Request, res: Response, next) => {
  try {
    const claimId = req.params.id;
    const signSettlementAgreement = new GenericForm(new SignSettlmentAgreement(req.body.signed));
    signSettlementAgreement.validateSync();

    if (signSettlementAgreement.hasErrors()) {
      const claim = await getCaseDataFromStore(req.params.id);
      renderView(signSettlementAgreement, res, getRepaymentPlan(claim, req));
    } else {
      await saveClaimantResponse(claimId, signSettlementAgreement.model.signed, crPropertyName, crParentName);
      res.redirect(constructResponseUrlWithIdParams(claimId, CLAIMANT_RESPONSE_TASK_LIST_URL));
    }
  } catch (error) {
    next(error);
  }
});

export default signSettlementAgreementController;

