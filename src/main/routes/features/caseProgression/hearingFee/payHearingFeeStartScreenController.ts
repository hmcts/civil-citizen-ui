import {NextFunction, RequestHandler, Router} from 'express';
import {CP_PAY_HEARING_FEE_START_URL} from 'routes/urls';
import {
  getPayHearingFeeStartScreenContent,
} from 'services/features/dashboard/caseProgression/hearingFee/payHearingFeeStartScreenContent';
import {AppRequest} from 'models/AppRequest';
import config from 'config';
import {CivilServiceClient} from 'client/civilServiceClient';

const payHearingFeeStartScreenViewPath = 'features/dashboard/caseProgression/hearingFee/pay-hearing-fee-start';
const payHearingFeeStartScreenController = Router();
const civilServiceApiBaseUrl = config.get<string>('services.civilService.url');
const civilServiceClient: CivilServiceClient = new CivilServiceClient(civilServiceApiBaseUrl);

const getPayHearingFeeStartScreenContent = (claimId: string, claim: Claim): PayHearingFeeStartScreenContent => {
  return new PageSectionBuilder().addMicroText('PAGES.PAY_HEARING_FEE.START.MICRO_TEXT')
    .addMainTitle('PAGES.PAY_HEARING_FEE.START.TITLE')
    .addParagraph('PAGES.PAY_HEARING_FEE.START.YOU_MUST_PAY', {
      hearingFee:hearingFee,
      hearingFeePaymentDeadline:hearingFeePaymentDeadline,
    })
    .addParagraph('PAGES.PAY_HEARING_FEE.START.IF_YOU_DO_NOT_PAY')
    .addStartButtonWithLink('PAGES.PAY_HEARING_FEE.START.START_NOW', startHref, cancelHref).build();
};
}
payHearingFeeStartScreenController.get(CP_PAY_HEARING_FEE_START_URL, (async (req, res, next: NextFunction) => {
  try {
    const claimId = req.params.id;
    const claim = await civilServiceClient.retrieveClaimDetails(claimId, <AppRequest>req);
    res.render(payHearingFeeStartScreenViewPath, {payHearingFeeStartScreenContent:getPayHearingFeeStartScreenContent(claim)});
  } catch (error) {
    next(error);
  }
}) as RequestHandler);

export default payHearingFeeStartScreenController;
