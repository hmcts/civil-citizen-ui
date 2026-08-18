import { NextFunction, Request, RequestHandler, Response, Router } from 'express';
import {
  APPLICATION_TYPE_URL, BACK_URL,
  GA_AGREEMENT_FROM_OTHER_PARTY_URL, GA_ASK_PROOF_OF_DEBT_PAYMENT_GUIDANCE_URL, ORDER_JUDGE_URL,
} from 'routes/urls';
import { GenericForm } from 'common/form/models/genericForm';
import { AppRequest } from 'common/models/AppRequest';
import { Claim } from 'common/models/claim';
import {
  ApplicationType,
  ApplicationTypeOption,
  isOtherApplicationTypeOption,
  LinkFromValues,
} from 'common/models/generalApplication/applicationType';
import {
  deleteGAFromClaimsByUserId,
  getByIndex,
  getCancelUrl,
  isChangeScreenFromCya,
  resolveApplicationTypeIndexForGet,
  resolveApplicationTypeIndexForPost,
  saveApplicationType,
  startApplicationTypeChangeFromCya,
  validateAdditionalApplicationType,
} from 'services/features/generalApplication/generalApplicationService';
import { generateRedisKey } from 'modules/draft-store/draftStoreService';
import { getClaimById } from 'modules/utilityService';
import {constructResponseUrlWithIdParams} from 'common/utils/urlFormatter';
import {isQueryManagementEnabled} from '../../../app/auth/launchdarkly/launchDarklyClient';
import {YesNo} from 'form/models/yesNo';
import {getRouteParam} from 'common/utils/routeParamUtils';
import {
  SHOW_APPLICATION_TYPE_ERROR_QUERY_PARAM,
  SHOW_DUPLICATE_APPLICATION_TYPE_ERROR_QUERY_PARAM,
} from 'routes/guards/generalApplication/applicationTypeGuard';
import {FormValidationError} from 'common/form/validationErrors/formValidationError';

const applicationTypeController = Router();
const viewPath = 'features/generalApplication/application-type';
const applicationTypeValidationError = 'ERRORS.APPLICATION_TYPE_REQUIRED';

applicationTypeController.get(APPLICATION_TYPE_URL, (async (req: AppRequest, res: Response, next: NextFunction) => {
  try {
    const linkFrom = req.query.linkFrom;
    const isAskMoreTime:boolean = req.query.isAskMoreTime === 'true';
    const isAmendClaim:boolean = req.query.isAmendClaim === 'true';
    const isAdjournHearing: boolean = req.query.isAdjournHearing === 'true';

    if (linkFrom === LinkFromValues.start) {
      await deleteGAFromClaimsByUserId(req.session?.user?.id);
    }

    const claimId = getRouteParam(req, 'id');
    const claim = await getClaimById(claimId, req, true);
    const applicationIndex = resolveApplicationTypeIndexForGet(req, claim);
    if (isChangeScreenFromCya(req)) {
      await startApplicationTypeChangeFromCya(generateRedisKey(req), claim, applicationIndex);
    }

    const showApplicationTypeError = req.query[SHOW_APPLICATION_TYPE_ERROR_QUERY_PARAM] === 'true';
    const applicationTypeOption = showApplicationTypeError
      ? undefined
      : getByIndex(claim.generalApplication?.applicationTypes, applicationIndex)?.option;
    const applicationType = new ApplicationType(applicationTypeOption);
    const form = new GenericForm(applicationType);
    if (showApplicationTypeError) {
      form.validateSync();
    }
    if (req.query[SHOW_DUPLICATE_APPLICATION_TYPE_ERROR_QUERY_PARAM] === 'true') {
      form.errors = form.errors || [];
      form.errors.push(new FormValidationError({
        target: applicationType,
        value: applicationType.option,
        constraints: {
          duplicateApplicationError: 'ERRORS.GENERAL_APPLICATION.ADDITIONAL_APPLICATION_DUPLICATE',
        },
        property: 'option',
      }));
    }
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
    const claimId = getRouteParam(req, 'id');
    const redisKey = generateRedisKey(<AppRequest>req);
    const claim = await getClaimById(claimId, req, true);
    let applicationType: ApplicationType;

    let applicationIndex = resolveApplicationTypeIndexForPost(req, claim);

    if (req.body.option === ApplicationTypeOption.OTHER_OPTION) {
      applicationType = new ApplicationType(req.body.optionOther);
    } else {
      applicationType = new ApplicationType(req.body.option);
    }
    const form = new GenericForm(applicationType);
    form.validateSync();
    validateOtherApplicationTypeBranch(form, applicationType, req.body.option, req.body.optionOther);
    validateAdditionalApplicationType(claim, form.errors, applicationType, req.body, applicationIndex);
    const cancelUrl = await getCancelUrl(claimId, claim);
    const backLinkUrl = BACK_URL;

    const showCCJ  = claim.isDefendant();
    if (form.hasErrors()) {
      res.render(viewPath, { form, cancelUrl, backLinkUrl, isOtherSelected: applicationType.isOtherSelected() || req.body.option === ApplicationTypeOption.OTHER_OPTION,  showCCJ: showCCJ});
    } else {
      await saveApplicationType(redisKey, claim, applicationType, applicationIndex);

      applicationIndex = getSavedApplicationIndex(claim, applicationIndex);
      if (showCCJ && claim.joIsLiveJudgmentExists?.option === YesNo.YES && req.body.option === ApplicationTypeOption.CONFIRM_CCJ_DEBT_PAID) {
        res.redirect(constructResponseUrlWithIdParams(claimId, GA_ASK_PROOF_OF_DEBT_PAYMENT_GUIDANCE_URL));
      } else {
        if (claim?.generalApplication?.applicationTypes?.length > 1){
          const redirectUrl = constructResponseUrlWithIdParams(claimId,ORDER_JUDGE_URL )
            + (applicationIndex >= 0 ? `?index=${applicationIndex}` : '');
          res.redirect(redirectUrl);
        } else {
          res.redirect(constructResponseUrlWithIdParams(claimId,GA_AGREEMENT_FROM_OTHER_PARTY_URL )
          + (applicationIndex >= 0 ? `?index=${applicationIndex}` : ''));
        }
      }
    }
  } catch (error) {
    next(error);
  }
}) as RequestHandler);

const validateOtherApplicationTypeBranch = (form: GenericForm<ApplicationType>, applicationType: ApplicationType, option: unknown, optionOther: unknown): void => {
  if (option !== ApplicationTypeOption.OTHER_OPTION || isOtherApplicationTypeOption(optionOther)) {
    return;
  }
  if (form.hasFieldError('option')) {
    return;
  }
  if (!form.errors) {
    form.errors = [];
  }
  form.errors.push(new FormValidationError({
    target: applicationType,
    value: optionOther,
    constraints: {
      applicationTypeInvalid: applicationTypeValidationError,
    },
    property: 'option',
  }));
};

const getSavedApplicationIndex = (claim: Claim, applicationIndex: number | undefined): number => {
  const lastApplicationIndex = claim.generalApplication.applicationTypes.length - 1;
  return applicationIndex !== undefined && applicationIndex >= 0 && applicationIndex <= lastApplicationIndex
    ? applicationIndex
    : lastApplicationIndex;
};

export default applicationTypeController;
