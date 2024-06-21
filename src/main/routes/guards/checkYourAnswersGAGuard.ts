import {Claim} from 'common/models/claim';
import {constructResponseUrlWithIdParams} from 'common/utils/urlFormatter';
import {NextFunction, Request, Response} from 'express';
import {getClaimById} from 'modules/utilityService';
import {APPLICATION_TYPE_URL} from 'routes/urls';
import {ApplicationTypeOption} from 'models/generalApplication/applicationType';
import {YesNo} from 'form/models/yesNo';

export const checkYourAnswersGAGuard = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const claimId = req.params.id;
    const claim = await getClaimById(claimId, req, true);

    const applicationTypes = claim.generalApplication?.applicationTypes || [];
    const hasRequiredFields = isGARequiredFieldsPresent(claim);

    if (!applicationTypes.length) return res.redirect(constructResponseUrlWithIdParams(claimId, APPLICATION_TYPE_URL));

    if (applicationTypes.length === 1) {
      const applicationType = applicationTypes[0].option;

      if ((applicationType.includes(ApplicationTypeOption.SET_ASIDE_JUDGEMENT) && hasRequiredFields) ||
        (applicationType.includes(ApplicationTypeOption.VARY_PAYMENT_TERMS_OF_JUDGMENT) && claim.generalApplication.uploadN245Form && hasRequiredFields) ||
        (applicationType.includes(ApplicationTypeOption.SETTLE_BY_CONSENT) && hasRequiredFields) ||
        (!applicationType.includes(ApplicationTypeOption.SET_ASIDE_JUDGEMENT) &&
          !applicationType.includes(ApplicationTypeOption.VARY_PAYMENT_TERMS_OF_JUDGMENT) &&
          !applicationType.includes(ApplicationTypeOption.SETTLE_BY_CONSENT) && hasRequiredFields)) {
        return next();
      } else {
        return res.redirect(constructResponseUrlWithIdParams(claimId, APPLICATION_TYPE_URL));
      }
    } else {
      if (claim.generalApplication.orderJudges && hasRequiredFields) {
        return next();
      } else {
        return res.redirect(constructResponseUrlWithIdParams(claimId, APPLICATION_TYPE_URL));
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
        (generalApp.wantToUploadDocuments === YesNo.YES && generalApp.uploadEvidenceForApplication.length >= 1)) &&
      generalApp.unavailableDatesHearing?.items &&
      generalApp.hearingContactDetails &&
      generalApp.hearingArrangement?.option?.length >= 1 &&
      generalApp.hearingArrangement.reasonForPreferredHearingType;
  }

};
