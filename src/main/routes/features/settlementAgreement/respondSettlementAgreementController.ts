import {
  NextFunction,
  Request,
  RequestHandler,
  Response,
  Router,
} from 'express';
import { DEFENDANT_SIGN_SETTLEMENT_AGREEMENT } from '../../urls';
import { GenericForm } from 'common/form/models/genericForm';
import {
  generateRedisKey,
  getCaseDataFromStore,
  saveDraftClaim,
} from 'modules/draft-store/draftStoreService';
import {
  getAmount,
  getFinalPaymentDate,
  getFirstRepaymentDate,
  getPaymentAmount,
  getPaymentDate,
  getPaymentOptionType,
  getRepaymentFrequency,
} from 'common/utils/repaymentUtils';
import { formatDateToFullDate } from 'common/utils/dateUtils';
import { Claim } from 'common/models/claim';
import { GenericYesNo } from 'form/models/genericYesNo';
import { constructResponseUrlWithIdParams } from 'common/utils/urlFormatter';
import { AppRequest } from 'common/models/AppRequest';
import { CivilServiceClient } from 'client/civilServiceClient';
import config from 'config';
import { toCCDYesNo } from 'services/translation/response/convertToCCDYesNo';
import { getClaimById } from 'modules/utilityService';

const respondSettlementAgreementViewPath =
  'features/settlementAgreement/respond-settlement-agreement';
const respondSettlementAgreementController = Router();
const civilServiceApiBaseUrl = config.get<string>('services.civilService.url');
const civilServiceClient: CivilServiceClient = new CivilServiceClient(
  civilServiceApiBaseUrl,
);

function renderView(
  form: GenericForm<GenericYesNo>,
  res: Response,
  data?: object,
): void {
  res.render(respondSettlementAgreementViewPath, { form, data });
}

const getSettlementAgreementData = (claim: Claim, req: Request) => {
  const lang = req.query.lang ? req.query.lang : req.cookies.lang;
  const data = {
    amount: getAmount(claim),
    claimant: claim.getClaimantFullName(),
    defendant: claim.getDefendantFullName(),
    paymentOption: getPaymentOptionType(claim),
    firstRepaymentDate: formatDateToFullDate(
      getFirstRepaymentDate(claim),
      lang,
    ),
    finalRepaymentDate: formatDateToFullDate(getFinalPaymentDate(claim), lang),
    paymentDate: formatDateToFullDate(getPaymentDate(claim), lang),
    paymentAmount: getPaymentAmount(claim),
    repaymentFrequency: getRepaymentFrequency(claim),
  };

  return data;
};

respondSettlementAgreementController.get(
  DEFENDANT_SIGN_SETTLEMENT_AGREEMENT,
  (async (req: Request, res: Response, next: NextFunction) => {
    try {
      const claimId = req.params.id;
      const claim = await getClaimById(claimId, req, true);
      // TODO: Populate form from saved response once this is implemented in the model
      renderView(
        new GenericForm(
          new GenericYesNo(
            req.body.option || claim.respondentSignSettlementAgreement?.option,
            'PAGES.DEFENDANT_RESPOND_TO_SETTLEMENT_AGREEMENT.DETAILS.VALID_YES_NO_OPTION',
          ),
        ),
        res,
        getSettlementAgreementData(claim, req),
      );
    } catch (error) {
      next(error);
    }
  }) as RequestHandler,
);

respondSettlementAgreementController.post(
  DEFENDANT_SIGN_SETTLEMENT_AGREEMENT,
  (async (req: Request, res: Response, next) => {
    try {
      const claimId = req.params.id;
      const redisKey = generateRedisKey(req as unknown as AppRequest);
      const respondSettlementAgreementOption = new GenericYesNo(
        req.body.option,
        'PAGES.DEFENDANT_RESPOND_TO_SETTLEMENT_AGREEMENT.DETAILS.VALID_YES_NO_OPTION',
      );
      const respondSettlementAgreement = new GenericForm(
        respondSettlementAgreementOption,
      );

      respondSettlementAgreement.validateSync();
      const claim = await getCaseDataFromStore(redisKey);
      if (respondSettlementAgreement.hasErrors()) {
        renderView(
          respondSettlementAgreement,
          res,
          getSettlementAgreementData(claim, req),
        );
      } else {
        // TODO : Save respondSettlementAgreement.model.option value and redirect to next page
        claim.respondentSignSettlementAgreement =
          respondSettlementAgreementOption;
        await saveDraftClaim(redisKey, claim, true);

        await civilServiceClient.submitDefendantSignSettlementAgreementEvent(
          claimId,
          {
            respondentSignSettlementAgreement: toCCDYesNo(
              claim.respondentSignSettlementAgreement.option,
            ),
          },
          <AppRequest>req,
        );
        res.redirect(constructResponseUrlWithIdParams(claimId, '<Next page>>'));
      }
    } catch (error) {
      next(error);
    }
  }) as RequestHandler,
);

export default respondSettlementAgreementController;
