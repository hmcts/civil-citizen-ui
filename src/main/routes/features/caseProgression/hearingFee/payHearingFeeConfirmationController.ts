import {NextFunction, RequestHandler, Router} from 'express';
import {
  DASHBOARD_CLAIMANT_URL, HEARING_FEE_CONFIRMATION_URL,
} from 'routes/urls';
import {constructResponseUrlWithIdParams} from 'common/utils/urlFormatter';
import {PageSectionBuilder} from 'common/utils/pageSectionBuilder';
import {FeeType} from 'form/models/helpWithFees/feeType';
import {t} from 'i18next';
import {generateRedisKey, getCaseDataFromStore} from 'modules/draft-store/draftStoreService';
import {AppRequest} from 'models/AppRequest';
import {Claim} from 'models/claim';

const payHearingFeeStartScreenViewPath = 'features/caseProgression/hearingFee/pay-hearing-fee-confirmation';
const payHearingFeeConfirmationController = Router();

const getHearingFeeConfirmationContent = (claimId: string) => {
  return new PageSectionBuilder()
    .addTitle('PAGES.PAY_HEARING_FEE.CONFIRMATION_PAGE.WHAT_HAPPENS_NEXT')
    .addParagraph('PAGES.PAY_HEARING_FEE.CONFIRMATION_PAGE.YOU_WILL_RECEIVE')
    .addButton('COMMON.BUTTONS.CLOSE_AND_RETURN_TO_CASE_OVERVIEW',constructResponseUrlWithIdParams(claimId, DASHBOARD_CLAIMANT_URL)).build();
};

payHearingFeeConfirmationController.get(HEARING_FEE_CONFIRMATION_URL, (async (req, res, next: NextFunction) => {
  try {
    const redisClaimId = generateRedisKey(<AppRequest>req);
    const claim: Claim = await getCaseDataFromStore(redisClaimId);
    const claimId = req.params.id;
    res.render(payHearingFeeStartScreenViewPath, {
      confirmationTitle : t(`PAGES.PAY_HEARING_FEE.CONFIRMATION_PAGE.CONFIRMATION_TITLE.${FeeType.HEARING}`),
      referenceNumber: claim.caseProgression.helpFeeReferenceNumberForm.referenceNumber,
      confirmationContent: getHearingFeeConfirmationContent(claimId),
    });
  }catch (error) {
    next(error);
  }
}) as RequestHandler);

export default payHearingFeeConfirmationController;
