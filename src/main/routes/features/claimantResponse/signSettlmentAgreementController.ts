import {NextFunction, Request, Response, Router} from 'express';
import {constructResponseUrlWithIdParams} from 'common/utils/urlFormatter';
import {
  CLAIMANT_SIGN_SETTLEMENT_AGREEMENT,
  CLAIMANT_RESPONSE_TASK_LIST_URL,
} from '../../urls';
import {GenericForm} from 'common/form/models/genericForm';
import {getClaimantResponse, saveClaimantResponse} from 'services/features/claimantResponse/claimantResponseService';
import { generateRedisKey, getCaseDataFromStore } from 'modules/draft-store/draftStoreService';
import {SignSettlmentAgreement} from 'common/form/models/claimantResponse/signSettlementAgreement';
import {SignSettlmentAgreementGuard} from 'routes/guards/signSettlmentAgreementGuard';
import { AppRequest } from 'common/models/AppRequest';
import {getPaymentText} from 'services/features/claimantResponse/signSettlmentAgreementService';

const signSettlementAgreementViewPath = 'features/claimantResponse/sign-settlement-agreement';
const signSettlementAgreementController = Router();
const crPropertyName = 'signed';
const crParentName = 'signSettlementAgreement';

function renderView(form: GenericForm<SignSettlmentAgreement>, res: Response, data?: object): void {
  res.render(signSettlementAgreementViewPath, {form, data});
}

signSettlementAgreementController.get(CLAIMANT_SIGN_SETTLEMENT_AGREEMENT, SignSettlmentAgreementGuard.apply(CLAIMANT_RESPONSE_TASK_LIST_URL), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const redisKey = generateRedisKey(req as unknown as AppRequest);
    const claim = await getCaseDataFromStore(redisKey);
    const claimantResponse = await getClaimantResponse(redisKey);
    renderView(new GenericForm(claimantResponse.signSettlementAgreement), res, getPaymentText(claim, req));
  } catch (error) {
    next(error);
  }
});

signSettlementAgreementController.post(CLAIMANT_SIGN_SETTLEMENT_AGREEMENT, async (req: Request, res: Response, next) => {
  try {
    const claimId = req.params.id;
    const redisKey = generateRedisKey(req as unknown as AppRequest);
    const signSettlementAgreement = new GenericForm(new SignSettlmentAgreement(req.body.signed));
    signSettlementAgreement.validateSync();

    if (signSettlementAgreement.hasErrors()) {
      const claim = await getCaseDataFromStore(redisKey);
      renderView(signSettlementAgreement, res, getPaymentText(claim, req));
    } else {
      await saveClaimantResponse(redisKey, signSettlementAgreement.model.signed, crPropertyName, crParentName);
      res.redirect(constructResponseUrlWithIdParams(claimId, CLAIMANT_RESPONSE_TASK_LIST_URL));
    }
  } catch (error) {
    next(error);
  }
});

export default signSettlementAgreementController;

