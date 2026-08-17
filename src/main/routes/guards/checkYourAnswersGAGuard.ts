import {Claim} from 'common/models/claim';
import {constructResponseUrlWithIdParams, constructUrlWithIndex} from 'common/utils/urlFormatter';
import {NextFunction, Request, Response} from 'express';
import {getClaimById} from 'modules/utilityService';
import {
  APPLICATION_TYPE_URL,
  GA_AGREEMENT_FROM_OTHER_PARTY_URL,
  GA_APPLICATION_COSTS_URL,
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
  ApplicationType,
  ApplicationTypeOption,
  getDuplicateApplicationTypeIndex,
  getInvalidApplicationTypeIndex,
} from 'models/generalApplication/applicationType';
import {YesNo} from 'form/models/yesNo';
import {getRouteParam} from 'common/utils/routeParamUtils';
import {
  applicationTypeErrorUrl,
  duplicateApplicationTypeErrorUrl,
} from 'routes/guards/generalApplication/applicationTypeGuard';

export const checkYourAnswersGAGuard = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const claimId = getRouteParam(req, 'id');
    const claim = await getClaimById(claimId, req, true);
    const applicationTypes = claim.generalApplication?.applicationTypes || [];

    if (!applicationTypes.length) return res.redirect(applicationTypeErrorUrl(claimId));
    if (claim.generalApplication?.applicationTypeChangeInProgress) {
      return res.redirect(applicationTypeErrorUrl(claimId, claim.generalApplication.applicationTypeChangeIndex));
    }
    const invalidApplicationTypeIndex = getInvalidApplicationTypeIndex(applicationTypes);
    if (invalidApplicationTypeIndex >= 0) {
      return res.redirect(`${constructResponseUrlWithIdParams(claimId, APPLICATION_TYPE_URL)}?index=${invalidApplicationTypeIndex}`);
    }
    const duplicateApplicationTypeIndex = getDuplicateApplicationTypeIndex(applicationTypes);
    if (duplicateApplicationTypeIndex >= 0) {
      return res.redirect(duplicateApplicationTypeErrorUrl(claimId, duplicateApplicationTypeIndex));
    }

    const incompleteJourneyUrl = getIncompleteJourneyUrl(claimId, claim, applicationTypes);
    return incompleteJourneyUrl ? res.redirect(incompleteJourneyUrl) : next();
  } catch (error) {
    return next(error);
  }
};

const getIncompleteJourneyUrl = (claimId: string, claim: Claim, applicationTypes: ApplicationType[]): string | undefined => {
  const generalApp = claim.generalApplication;
  const lastApplicationIndex = applicationTypes.length - 1;
  const withIndex = (url: string, index = lastApplicationIndex): string =>
    constructUrlWithIndex(constructResponseUrlWithIdParams(claimId, url), index);
  const hasApplicationType = (applicationTypeOption: ApplicationTypeOption): boolean =>
    applicationTypes.some(applicationType => applicationType.option === applicationTypeOption);

  if (!generalApp?.agreementFromOtherParty) {
    return withIndex(GA_AGREEMENT_FROM_OTHER_PARTY_URL, 0);
  }

  const canSkipInformOtherParties = hasApplicationType(ApplicationTypeOption.VARY_PAYMENT_TERMS_OF_JUDGMENT)
    || hasApplicationType(ApplicationTypeOption.SETTLE_BY_CONSENT);
  if (generalApp.agreementFromOtherParty === YesNo.NO && !canSkipInformOtherParties && !generalApp.informOtherParties?.option) {
    return withIndex(INFORM_OTHER_PARTIES_URL, 0);
  }

  if (!generalApp.applicationFee) {
    return withIndex(GA_APPLICATION_COSTS_URL);
  }

  if (!claim.isClaimant()
    && applicationTypes.length === 1
    && applicationTypes[0].option === ApplicationTypeOption.VARY_PAYMENT_TERMS_OF_JUDGMENT
    && !generalApp.uploadN245Form) {
    return withIndex(GA_UPLOAD_N245_FORM_URL, 0);
  }

  if (!hasApplicationType(ApplicationTypeOption.VARY_PAYMENT_TERMS_OF_JUDGMENT)) {
    for (const [index] of applicationTypes.entries()) {
      if (!generalApp.orderJudges?.[index]?.text) {
        return withIndex(ORDER_JUDGE_URL, index);
      }
      if (!generalApp.requestingReasons?.[index]?.text) {
        return withIndex(GA_REQUESTING_REASON_URL, index);
      }
    }
  }

  if (!generalApp.wantToUploadDocuments) {
    return withIndex(GA_WANT_TO_UPLOAD_DOCUMENTS_URL);
  }

  if (generalApp.wantToUploadDocuments === YesNo.YES && !generalApp.uploadEvidenceForApplication?.length) {
    return withIndex(GA_UPLOAD_DOCUMENTS_URL);
  }

  if (!generalApp.hearingArrangement?.option?.length || !generalApp.hearingArrangement.reasonForPreferredHearingType) {
    return withIndex(GA_HEARING_ARRANGEMENTS_GUIDANCE_URL);
  }

  if (!generalApp.hearingContactDetails) {
    return withIndex(GA_HEARING_CONTACT_DETAILS_URL);
  }

  if (!generalApp.hasUnavailableDatesHearing) {
    return withIndex(GA_UNAVAILABILITY_CONFIRMATION_URL);
  }

  if (generalApp.hasUnavailableDatesHearing === YesNo.YES && !generalApp.unavailableDatesHearing?.items?.length) {
    return withIndex(GA_UNAVAILABLE_HEARING_DATES_URL);
  }

  return undefined;
};
