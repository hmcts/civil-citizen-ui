import {NextFunction, RequestHandler, Router} from 'express';
import {
  DASHBOARD_CLAIMANT_URL, GA_APPLICATION_FEE_CONFIRMATION_URL,
} from 'routes/urls';
import {constructResponseUrlWithIdParams} from 'common/utils/urlFormatter';
import {PageSectionBuilder} from 'common/utils/pageSectionBuilder';
import {t} from 'i18next';
import {generateRedisKey, getCaseDataFromStore} from 'modules/draft-store/draftStoreService';
import {AppRequest} from 'models/AppRequest';
import {Claim} from 'models/claim';

const payApplicationFeeConfirmationScreenViewPath = 'features/caseProgression/hearingFee/pay-hearing-fee-confirmation';
const payApplicationFeeConfirmationController = Router();

const getApplicationFeeConfirmationContent = (claimId: string, lng: string) => {
  return new PageSectionBuilder()
    .addTitle('PAGES.PAY_HEARING_FEE.CONFIRMATION_PAGE.WHAT_HAPPENS_NEXT')
    .addParagraph('PAGES.PAY_HEARING_FEE.CONFIRMATION_PAGE.YOU_WILL_RECEIVE')
    .addButton(t('COMMON.BUTTONS.CLOSE_AND_RETURN_TO_CASE_OVERVIEW', {lng}), constructResponseUrlWithIdParams(claimId, DASHBOARD_CLAIMANT_URL)).build();
};

payApplicationFeeConfirmationController.get(GA_APPLICATION_FEE_CONFIRMATION_URL, (async (req, res, next: NextFunction) => {
  try {
    const lng = req.query.lang ? req.query.lang : req.cookies.lang;
    const redisClaimId = generateRedisKey(<AppRequest>req);
    const claim: Claim = await getCaseDataFromStore(redisClaimId);
    const claimId = req.params.id;

    res.render(payApplicationFeeConfirmationScreenViewPath, {
      confirmationTitle : t('PAGES.GENERAL_APPLICATION.APPLY_HELP_WITH_FEE.CONFIRMATION_PAGE.TITLE', {lng}),
      referenceNumber: claim.generalApplication?.helpFeeReferenceNumberForm?.referenceNumber,
      confirmationContent: getApplicationFeeConfirmationContent(claimId, lng),
    });
  }catch (error) {
    next(error);
  }
}) as RequestHandler);

export default payApplicationFeeConfirmationController;
