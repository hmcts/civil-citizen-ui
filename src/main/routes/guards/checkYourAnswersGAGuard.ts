import {Claim} from 'common/models/claim';
import {constructResponseUrlWithIdParams} from 'common/utils/urlFormatter';
import {NextFunction, Request, Response} from 'express';
import {getClaimById} from 'modules/utilityService';
import {APPLICATION_TYPE_URL} from 'routes/urls';
import {ApplicationTypeOption, LinKFromValues} from 'models/generalApplication/applicationType';
import {YesNo} from 'form/models/yesNo';
import {getCancelUrl} from 'services/features/generalApplication/generalApplicationService';

export const checkYourAnswersGAGuard = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const claimId = req.params.id;
    const claim = await getClaimById(claimId, req, true);
    const gaCoscUrl = '/cosc/';
    const applicationTypes = claim.generalApplication?.applicationTypes || [];
    const hasRequiredFields = isGARequiredFieldsPresent(claim);
    //If mainCase has bilingual party submission is not allowed.
    if (claim.isAnyPartyBilingual() && !req.url.includes(gaCoscUrl)) return res.redirect(await getCancelUrl(claimId, null));

    if (!applicationTypes.length) return res.redirect(constructResponseUrlWithIdParams(claimId, APPLICATION_TYPE_URL + `?linkFrom=${LinKFromValues.start}`));

    if (applicationTypes.length === 1) {
      const applicationType = applicationTypes[0].option;

      if ((!claim.isClaimant() && applicationType.includes(ApplicationTypeOption.VARY_PAYMENT_TERMS_OF_JUDGMENT) && claim.generalApplication.uploadN245Form) ||
        hasRequiredFields) {
        return next();
      } else {
        return res.redirect(constructResponseUrlWithIdParams(claimId, APPLICATION_TYPE_URL + `?linkFrom=${LinKFromValues.start}`));
      }
    } else {
      // GA application with Multiple application types
      if (claim.generalApplication.orderJudges && hasRequiredFields) {
        return next();
      } else {
        return res.redirect(constructResponseUrlWithIdParams(claimId, APPLICATION_TYPE_URL + `?linkFrom=${LinKFromValues.start}`));
      }
    }
  } catch (error) {
    return next(error);
  }

  function isGARequiredFieldsPresent(claim: Claim) {
    const generalApp = claim.generalApplication;
    return generalApp?.agreementFromOtherParty &&
      generalApp.applicationFee &&
      (generalApp.wantToUploadDocuments === YesNo.NO ||
        (generalApp.wantToUploadDocuments === YesNo.YES && generalApp.uploadEvidenceForApplication.length)) &&
      (generalApp.hasUnavailableDatesHearing === YesNo.NO ||
        (generalApp.hasUnavailableDatesHearing === YesNo.YES && generalApp.unavailableDatesHearing?.items)) &&
      generalApp.hearingContactDetails &&
      generalApp.hearingArrangement?.option?.length &&
      generalApp.hearingArrangement.reasonForPreferredHearingType;
  }
};
