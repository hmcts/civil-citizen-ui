import {NextFunction, RequestHandler, Router} from 'express';
import {CCJ_CONFIRMATION_URL} from 'routes/urls';
import {generateRedisKey, getCaseDataFromStore} from 'modules/draft-store/draftStoreService';
import {ccjConfirmationGuard} from 'routes/guards/ccjConfirmationGuard';
import { AppRequest } from 'common/models/AppRequest';
import {isJudgmentOnlineLive} from '../../../../app/auth/launchdarkly/launchDarklyClient';
import { t } from 'i18next';

const ccjConfirmationController = Router();
ccjConfirmationController.get(CCJ_CONFIRMATION_URL, ccjConfirmationGuard, (async (req, res, next: NextFunction) => {
  try {
    const claim = await getCaseDataFromStore(generateRedisKey(req as unknown as AppRequest));
    const defendantName = claim.getDefendantFullName();
    const isJudgmentOnline = claim.isCCJCompleteForJo(await isJudgmentOnlineLive());
    let processYourRequest, processYourRequest1;
    if (isJudgmentOnline) {
      processYourRequest = t('PAGES.CCJ_CONFIRMATION.PROCESS_YOUR_REQUEST_JO', {defendantName});
      processYourRequest1 = t('PAGES.CCJ_CONFIRMATION.NO_LONGER_RESPONSE', {defendantName});
    } else {
      processYourRequest = t('PAGES.CCJ_CONFIRMATION.PROCESS_YOUR_REQUEST', {defendantName});
      processYourRequest1 = t('PAGES.CCJ_CONFIRMATION.PROCESS_YOUR_REQUEST_1', {defendantName});
    }

    res.render('features/claimantResponse/ccj/ccj-confirmation', {defendantName, isJudgmentOnline, pageTitle: 'PAGES.CCJ_CONFIRMATION.PAGE_TITLE', processYourRequest, processYourRequest1});
  } catch (error) {
    next(error);
  }
}) as RequestHandler);

export default ccjConfirmationController;
