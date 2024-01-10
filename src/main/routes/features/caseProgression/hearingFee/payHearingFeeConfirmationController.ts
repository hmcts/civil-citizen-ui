import {NextFunction, RequestHandler, Router} from 'express';
import {
  DASHBOARD_CLAIMANT_URL, HEARING_FEE_CONFIRMATION_URL,
} from 'routes/urls';
import {constructResponseUrlWithIdParams} from 'common/utils/urlFormatter';
import {PageSectionBuilder} from 'common/utils/pageSectionBuilder';
import {FeeType} from 'form/models/helpWithFees/feeType';
import {t} from 'i18next';

const payHearingFeeStartScreenViewPath = 'features/caseProgression/hearingFee/pay-hearing-fee-confirmation';
const payHearingFeeConfirmationController = Router();

const getHearingFeeConfirmationContent = (claimId: string, lng: string) => {
  return new PageSectionBuilder()
    .addTitle('PAGES.PAY_HEARING_FEE.CONFIRMATION_PAGE.WHAT_HAPPENS_NEXT')
    .addParagraph('PAGES.PAY_HEARING_FEE.CONFIRMATION_PAGE.YOU_WILL_RECEIVE')
    .addButton(t('COMMON.BUTTONS.CLOSE_AND_RETURN_TO_CASE_OVERVIEW', {lng}), constructResponseUrlWithIdParams(claimId, DASHBOARD_CLAIMANT_URL)).build();
};

//TODO: we need to revisit this controller once we have all pay hearing fee journey in place
payHearingFeeConfirmationController.get(HEARING_FEE_CONFIRMATION_URL, (async (req, res, next: NextFunction) => {
  const claimId = req.params.id;
  const lng = req.query.lang ? req.query.lang : req.cookies.lang;
  res.render(payHearingFeeStartScreenViewPath, {
    confirmationTitle : t(`PAGES.PAY_HEARING_FEE.CONFIRMATION_PAGE.CONFIRMATION_TITLE.${FeeType.HEARING}`, {lng}),
    referenceNumber: claimId,
    confirmationContent: getHearingFeeConfirmationContent(claimId, lng),
  });
}) as RequestHandler);

export default payHearingFeeConfirmationController;
