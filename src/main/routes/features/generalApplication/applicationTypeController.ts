import { NextFunction, Request, RequestHandler, Response, Router } from 'express';
import {
  APPLICATION_TYPE_URL, BACK_URL,
  GA_AGREEMENT_FROM_OTHER_PARTY_URL, GA_ASK_PROOF_OF_DEBT_PAYMENT_GUIDANCE_URL, ORDER_JUDGE_URL,
} from 'routes/urls';
import { GenericForm } from 'common/form/models/genericForm';
import { AppRequest } from 'common/models/AppRequest';
import {
  ApplicationType,
  ApplicationTypeOption,
  LinKFromValues,
} from 'common/models/generalApplication/applicationType';
import {
  deleteGAFromClaimsByUserId,
  getByIndex,
  getCancelUrl,
  saveApplicationType, validateAdditionalApplicationtType,
} from 'services/features/generalApplication/generalApplicationService';
import { generateRedisKey } from 'modules/draft-store/draftStoreService';
import { getClaimById } from 'modules/utilityService';
import { queryParamNumber } from 'common/utils/requestUtils';
import {constructResponseUrlWithIdParams} from 'common/utils/urlFormatter';
import {isQueryManagementEnabled} from '../../../app/auth/launchdarkly/launchDarklyClient';
import {YesNo} from 'form/models/yesNo';

const applicationTypeController = Router();
const viewPath = 'features/generalApplication/application-type';

applicationTypeController.get(APPLICATION_TYPE_URL, (async (req: AppRequest, res: Response, next: NextFunction) => {
  try {
    const linkFrom = req.query.linkFrom;
    const isAskMoreTime:boolean = req.query.isAskMoreTime === 'true';
    const isAmendClaim:boolean = req.query.isAmendClaim === 'true';
    const isAdjournHearing: boolean = req.query.isAdjournHearing === 'true';
    const applicationIndex = queryParamNumber(req, 'index');

    if (linkFrom === LinKFromValues.start) {
      await deleteGAFromClaimsByUserId(req.session?.user?.id);
    }

    const claimId = req.params.id;
    const claim = await getClaimById(claimId, req, true);

    const applicationTypeOption = getByIndex(claim.generalApplication?.applicationTypes, applicationIndex)?.option;
    const applicationType = new ApplicationType(applicationTypeOption);
    const form = new GenericForm(applicationType);
    const cancelUrl = await getCancelUrl(claimId, claim);
    const backLinkUrl = BACK_URL;
    const showCCJ  = claim.isDefendant();
    const isQMEnabled = await isQueryManagementEnabled(claim.submittedDate);
    res.render(viewPath, {
      form,
      cancelUrl,
      backLinkUrl,
      isOtherSelected: applicationType.isOtherSelected() || isAmendClaim,
      showCCJ: showCCJ,
      isQMEnabled,
      isAskMoreTime,
      isAdjournHearing,
      isAmendClaim,
    });
  } catch (error) {
    next(error);
  }
}) as RequestHandler);

applicationTypeController.post(APPLICATION_TYPE_URL, (async (req: AppRequest | Request, res: Response, next: NextFunction) => {

  try {
    const redisKey = generateRedisKey(<AppRequest>req);
    const claim = await getClaimById(redisKey, req, true);
    let applicationType = null;

    let applicationIndex = queryParamNumber(req, 'index');

    if (req.body.option === ApplicationTypeOption.OTHER_OPTION) {
      applicationType = new ApplicationType(req.body.optionOther);
    } else {
      applicationType = new ApplicationType(req.body.option);
    }
    const form = new GenericForm(applicationType);
    form.validateSync();
    if(!applicationIndex && applicationIndex != 0) {
      validateAdditionalApplicationtType(claim,form.errors,applicationType,req.body);
    }
    const cancelUrl = await getCancelUrl( req.params.id, claim);
    const backLinkUrl = BACK_URL;

    const showCCJ  = claim.isDefendant();
    if (form.hasErrors()) {
      res.render(viewPath, { form, cancelUrl, backLinkUrl, isOtherSelected: applicationType.isOtherSelected() ,  showCCJ: showCCJ});
    } else {
      await saveApplicationType(redisKey, claim, applicationType, applicationIndex);

      if(!applicationIndex) {
        applicationIndex = claim.generalApplication.applicationTypes.length - 1;
      }
      if (showCCJ && claim.joIsLiveJudgmentExists?.option === YesNo.YES && req.body.option === ApplicationTypeOption.CONFIRM_CCJ_DEBT_PAID) {
        res.redirect(constructResponseUrlWithIdParams(req.params.id, GA_ASK_PROOF_OF_DEBT_PAYMENT_GUIDANCE_URL));
      } else {
        if (claim?.generalApplication?.applicationTypes?.length > 1){
          res.redirect(constructResponseUrlWithIdParams(req.params.id,ORDER_JUDGE_URL )
            + (applicationIndex >= 0 ? `?index=${applicationIndex}` : ''));
        } else {
          res.redirect(constructResponseUrlWithIdParams(req.params.id,GA_AGREEMENT_FROM_OTHER_PARTY_URL )
          + (applicationIndex >= 0 ? `?index=${applicationIndex}` : ''));
        }
      }
    }
  } catch (error) {
    next(error);
  }
}) as RequestHandler);

export default applicationTypeController;
