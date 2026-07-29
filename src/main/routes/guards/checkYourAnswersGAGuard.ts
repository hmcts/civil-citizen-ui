import {Claim} from 'common/models/claim';
import {constructResponseUrlWithIdParams, constructUrlWithIndex} from 'common/utils/urlFormatter';
import {NextFunction, Request, Response} from 'express';
import {getClaimById} from 'modules/utilityService';
import {
  APPLICATION_TYPE_URL,
  GA_AGREEMENT_FROM_OTHER_PARTY_URL,
  GA_APPLICATION_COSTS_URL,
  GA_CLAIM_APPLICATION_COST_URL,
  GA_HEARING_ARRANGEMENT_URL,
  GA_HEARING_ARRANGEMENTS_GUIDANCE_URL,
  GA_HEARING_CONTACT_DETAILS_URL,
  GA_REQUESTING_REASON_URL,
  GA_UNAVAILABILITY_CONFIRMATION_URL,
  GA_UNAVAILABLE_HEARING_DATES_URL,
  GA_UPLOAD_DOCUMENTS_URL,
  GA_UPLOAD_N245_FORM_URL,
  GA_WANT_TO_UPLOAD_DOCUMENTS_URL,
  INFORM_OTHER_PARTIES_URL,
  ORDER_JUDGE_URL,
} from 'routes/urls';
import {
  ApplicationTypeOption,
  getDuplicateApplicationTypeIndex,
  getInvalidApplicationTypeIndex,
} from 'models/generalApplication/applicationType';
import {YesNo} from 'form/models/yesNo';
import {getCancelUrl} from 'services/features/generalApplication/generalApplicationService';
import {isGaForWelshEnabled} from '../../app/auth/launchdarkly/launchDarklyClient';
import {getRouteParam} from 'common/utils/routeParamUtils';
import {
  applicationTypeErrorUrl,
  duplicateApplicationTypeErrorUrl,
} from 'routes/guards/generalApplication/applicationTypeGuard';

export const checkYourAnswersGAGuard = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const claimId = getRouteParam(req, 'id');
    const claim = await getClaimById(claimId, req, true);
    const gaCoscUrl = '/cosc/';
    const applicationTypes = claim.generalApplication?.applicationTypes || [];
    const welshGaEnabled = await isGaForWelshEnabled();
    //If mainCase has bilingual party submission is not allowed.
    if (claim.isAnyPartyBilingual() && !welshGaEnabled && !req.url.includes(gaCoscUrl)) return res.redirect(await getCancelUrl(claimId, null));

    if (!applicationTypes.length) return res.redirect(applicationTypeErrorUrl(claimId));
    const invalidApplicationTypeIndex = getInvalidApplicationTypeIndex(applicationTypes);
    if (invalidApplicationTypeIndex >= 0) {
      return res.redirect(`${constructResponseUrlWithIdParams(claimId, APPLICATION_TYPE_URL)}?index=${invalidApplicationTypeIndex}`);
    }
    const duplicateApplicationTypeIndex = getDuplicateApplicationTypeIndex(applicationTypes);
    if (duplicateApplicationTypeIndex >= 0) {
      return res.redirect(duplicateApplicationTypeErrorUrl(claimId, duplicateApplicationTypeIndex));
    }

    const nextIncompleteUrl = getNextIncompleteGeneralApplicationUrl(claimId, claim);
    if (nextIncompleteUrl) {
      return res.redirect(nextIncompleteUrl);
    }
    return next();
  } catch (error) {
    return next(error);
  }
};

const getNextIncompleteGeneralApplicationUrl = (claimId: string, claim: Claim): string | undefined => {
  const generalApp = claim.generalApplication;
  const applicationTypes = generalApp?.applicationTypes || [];
  const lastApplicationIndex = Math.max(applicationTypes.length - 1, 0);

  if (!generalApp?.agreementFromOtherParty) {
    return constructResponseUrlWithIdParams(claimId, GA_AGREEMENT_FROM_OTHER_PARTY_URL);
  }

  if (requiresInformOtherParties(generalApp.agreementFromOtherParty, applicationTypes[0]?.option)
    && !generalApp.informOtherParties?.option) {
    return constructResponseUrlWithIdParams(claimId, INFORM_OTHER_PARTIES_URL);
  }

  if (!generalApp.applicationFee) {
    return constructUrlWithIndex(constructResponseUrlWithIdParams(claimId, GA_APPLICATION_COSTS_URL), lastApplicationIndex);
  }

  if (requiresN245Form(claim) && !generalApp.uploadN245Form) {
    return constructUrlWithIndex(constructResponseUrlWithIdParams(claimId, GA_UPLOAD_N245_FORM_URL), lastApplicationIndex);
  }

  if (requiresApplicationCosts(claim) && !generalApp.applicationCosts) {
    return constructUrlWithIndex(constructResponseUrlWithIdParams(claimId, GA_CLAIM_APPLICATION_COST_URL), lastApplicationIndex);
  }

  const incompleteApplicationDetailsUrl = getIncompleteApplicationDetailsUrl(claimId, claim);
  if (incompleteApplicationDetailsUrl) {
    return incompleteApplicationDetailsUrl;
  }

  if (!generalApp.wantToUploadDocuments) {
    return constructUrlWithIndex(constructResponseUrlWithIdParams(claimId, GA_WANT_TO_UPLOAD_DOCUMENTS_URL), lastApplicationIndex);
  }

  if (generalApp.wantToUploadDocuments === YesNo.YES && !generalApp.uploadEvidenceForApplication?.length) {
    return constructUrlWithIndex(constructResponseUrlWithIdParams(claimId, GA_UPLOAD_DOCUMENTS_URL), lastApplicationIndex);
  }

  if (!generalApp.hearingArrangement?.option?.length || !generalApp.hearingArrangement.reasonForPreferredHearingType) {
    return constructUrlWithIndex(
      constructResponseUrlWithIdParams(claimId, generalApp.hearingArrangement ? GA_HEARING_ARRANGEMENT_URL : GA_HEARING_ARRANGEMENTS_GUIDANCE_URL),
      lastApplicationIndex,
    );
  }

  if (!generalApp.hearingContactDetails?.telephoneNumber || !generalApp.hearingContactDetails.emailAddress) {
    return constructUrlWithIndex(constructResponseUrlWithIdParams(claimId, GA_HEARING_CONTACT_DETAILS_URL), lastApplicationIndex);
  }

  if (!generalApp.hasUnavailableDatesHearing) {
    return constructUrlWithIndex(constructResponseUrlWithIdParams(claimId, GA_UNAVAILABILITY_CONFIRMATION_URL), lastApplicationIndex);
  }

  if (generalApp.hasUnavailableDatesHearing === YesNo.YES && !generalApp.unavailableDatesHearing?.items?.length) {
    return constructUrlWithIndex(constructResponseUrlWithIdParams(claimId, GA_UNAVAILABLE_HEARING_DATES_URL), lastApplicationIndex);
  }

  return undefined;
};

const requiresInformOtherParties = (agreementFromOtherParty: YesNo, applicationType?: ApplicationTypeOption): boolean => {
  const applicationTypesSkippingInformOtherParties = [
    ApplicationTypeOption.SETTLE_BY_CONSENT,
    ApplicationTypeOption.VARY_PAYMENT_TERMS_OF_JUDGMENT,
  ];
  return agreementFromOtherParty === YesNo.NO && !applicationTypesSkippingInformOtherParties.includes(applicationType);
};

const requiresN245Form = (claim: Claim): boolean =>
  !claim.isClaimant()
  && claim.generalApplication?.applicationTypes?.some(applicationType =>
    applicationType.option === ApplicationTypeOption.VARY_PAYMENT_TERMS_OF_JUDGMENT);

const requiresApplicationCosts = (claim: Claim): boolean =>
  !claim.generalApplication?.applicationTypes?.some(applicationType =>
    applicationType.option === ApplicationTypeOption.VARY_PAYMENT_TERMS_OF_JUDGMENT);

const getIncompleteApplicationDetailsUrl = (claimId: string, claim: Claim): string | undefined => {
  const generalApp = claim.generalApplication;
  const applicationTypes = generalApp?.applicationTypes || [];

  for (let index = 0; index < applicationTypes.length; index++) {
    if (applicationTypes[index]?.option === ApplicationTypeOption.VARY_PAYMENT_TERMS_OF_JUDGMENT) {
      continue;
    }
    if (!generalApp.orderJudges?.[index]?.text) {
      return constructUrlWithIndex(constructResponseUrlWithIdParams(claimId, ORDER_JUDGE_URL), index);
    }
    if (!generalApp.requestingReasons?.[index]?.text) {
      return constructUrlWithIndex(constructResponseUrlWithIdParams(claimId, GA_REQUESTING_REASON_URL), index);
    }
  }

  return undefined;
};
