import {RequestHandler, Response, Router} from 'express';
import {CLAIMANT_RESPONSE_CONFIRMATION_URL} from 'routes/urls';
import {getClaimById} from 'modules/utilityService';
import {getClaimantResponseConfirmationContent} from 'services/features/claimantResponse/claimantResponseConfirmation/claimantResponseConfirmationContentService';
import {getLng} from 'common/utils/languageToggleUtils';
import {claimantResponseConfirmationGuard} from 'routes/guards/claimantResponseConfirmationGuard';
import {AppRequest} from 'common/models/AppRequest';
import {deleteDraftClaimFromStore, generateRedisKey} from 'modules/draft-store/draftStoreService';
import {isCarmEnabledForCase, isMintiEnabledForCase} from '../../../app/auth/launchdarkly/launchDarklyClient';
import {getRespondToSettlementAgreementDeadline} from 'services/features/claimantResponse/signSettlmentAgreementService';
import {isIntermediateTrack, isMultiTrack} from 'form/models/claimType';

const claimantResponseConfirmationController = Router();

claimantResponseConfirmationController.get(CLAIMANT_RESPONSE_CONFIRMATION_URL, claimantResponseConfirmationGuard, (async (req: AppRequest, res: Response, next) => {
  try {
    const lang = req.query.lang ? req.query.lang : req.cookies.lang;
    await deleteDraftClaimFromStore(generateRedisKey(req));
    const claim = await getClaimById(req.params.id, req, true);
    const carmApplicable = await isCarmEnabledForCase(claim.submittedDate);
    const mintiEnabled = await isMintiEnabledForCase(claim.submittedDate);
    const isMultiOrIntermediateTrack = isIntermediateTrack(claim.totalClaimAmount, mintiEnabled) || isMultiTrack(claim.totalClaimAmount, mintiEnabled)
    const respondToSettlementAgreementDeadLine = await getRespondToSettlementAgreementDeadline(req, claim);
    const claimantResponseConfirmationContent = getClaimantResponseConfirmationContent(claim, getLng(lang), carmApplicable, isMultiOrIntermediateTrack, respondToSettlementAgreementDeadLine);
    res.render('features/claimantResponse/claimant-response-confirmation', {
      claimantResponseConfirmationContent,
      pageTitle: 'PAGES.CLAIMANT_RESPONSE_CONFIRMATION.PAGE_TITLE',
    });
  } catch (error) {
    next(error);
  }
}) as RequestHandler);

export default claimantResponseConfirmationController;
