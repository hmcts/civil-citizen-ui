import {NextFunction, Request, RequestHandler, Response, Router} from 'express';
import {DEFENDANT_SIGN_SETTLEMENT_AGREEMENT} from '../../urls';
import {GenericForm} from 'common/form/models/genericForm';
import {
  getAmount,
  getFinalPaymentDate,
  getFirstRepaymentDate,
  getPaymentAmount, getPaymentDate, getPaymentOptionType,
  getRepaymentFrequency,
} from 'common/utils/repaymentUtils';
import {formatDateToFullDate} from 'common/utils/dateUtils';
import {Claim} from 'common/models/claim';
import {GenericYesNo} from 'form/models/genericYesNo';
import {constructResponseUrlWithIdParams} from 'common/utils/urlFormatter';
import {getClaimById} from "modules/utilityService";

const respondSettlementAgreementViewPath = 'features/settlementAgreement/respond-settlement-agreement';
const respondSettlementAgreementController = Router();

function renderView(form: GenericForm<GenericYesNo>, res: Response, data?: object): void {
  res.render(respondSettlementAgreementViewPath, {form, data});
}

const getSettlementAgreementData = (claim: Claim, req: Request) => {
  const lang = req.query.lang ? req.query.lang : req.cookies.lang;
  const data = {
    amount: getAmount(claim),
    claimant: claim.getClaimantFullName(),
    defendant: claim.getDefendantFullName(),
    paymentOption: getPaymentOptionType(claim),
    firstRepaymentDate: formatDateToFullDate(getFirstRepaymentDate(claim), lang),
    finalRepaymentDate: formatDateToFullDate(getFinalPaymentDate(claim), lang),
    paymentDate: formatDateToFullDate(getPaymentDate(claim), lang),
    paymentAmount: getPaymentAmount(claim),
    repaymentFrequency: getRepaymentFrequency(claim),
  };

  return data;
};

respondSettlementAgreementController.get(DEFENDANT_SIGN_SETTLEMENT_AGREEMENT, (async (req: Request, res: Response, next: NextFunction) => {
  try {
    const claimId = req.params.id;
    const claim = await getClaimById(claimId, req);
    // TODO: Populate form from saved response once this is implemented in the model
    renderView(new GenericForm(new GenericYesNo(req.body.option, 'PAGES.DEFENDANT_RESPOND_TO_SETTLEMENT_AGREEMENT.DETAILS.VALID_YES_NO_OPTION')), res, getSettlementAgreementData(claim, req));
  } catch (error) {
    next(error);
  }
}) as RequestHandler);

respondSettlementAgreementController.post(DEFENDANT_SIGN_SETTLEMENT_AGREEMENT, (async (req: Request, res: Response, next) => {
  try {
    const claimId = req.params.id;
    const respondSettlementAgreement = new GenericForm(new GenericYesNo(req.body.option, 'PAGES.DEFENDANT_RESPOND_TO_SETTLEMENT_AGREEMENT.DETAILS.VALID_YES_NO_OPTION'));
    respondSettlementAgreement.validateSync();

    if (respondSettlementAgreement.hasErrors()) {
      const claim = await getClaimById(claimId, req);
      renderView(respondSettlementAgreement, res, getSettlementAgreementData(claim, req));
    } else {
      // TODO : Save respondSettlementAgreement.model.option value and redirect to next page
      res.redirect(constructResponseUrlWithIdParams(claimId, '<Next page>>'));
    }
  } catch (error) {
    next(error);
  }
}) as RequestHandler);

export default respondSettlementAgreementController;

