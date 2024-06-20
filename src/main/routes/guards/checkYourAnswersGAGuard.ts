import {Claim} from 'common/models/claim';
import {constructResponseUrlWithIdParams} from 'common/utils/urlFormatter';
import {NextFunction, Request, Response} from 'express';
import {getClaimById} from 'modules/utilityService';
import {APPLICATION_TYPE_URL} from 'routes/urls';
import {ApplicationTypeOption} from 'models/generalApplication/applicationType';

export const checkYourAnswersGAGuard = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const claimId = req.params.id;
    const claim: Claim = await getClaimById(claimId, req, true);

    console.log(claim.generalApplication);

    if (claim.generalApplication.applicationTypes != undefined) {
      if (claim.generalApplication.applicationTypes.length === 1) {
        if (claim.generalApplication.applicationTypes[0].option.includes(ApplicationTypeOption.SET_ASIDE_JUDGEMENT) &&
          checkIfFieldsNotNull(claim)) {
          next();
        } else if (claim.generalApplication.applicationTypes[0].option.includes(ApplicationTypeOption.VARY_PAYMENT_TERMS_OF_JUDGMENT) &&
          claim.generalApplication.uploadN245Form != null && checkIfFieldsNotNull(claim)) {
          next();
        } else if (claim.generalApplication.applicationTypes[0].option.includes(ApplicationTypeOption.SETTLE_BY_CONSENT) &&
          checkIfFieldsNotNull(claim)) {
          next();
        } else if (!(claim.generalApplication.applicationTypes[0].option.includes(ApplicationTypeOption.SET_ASIDE_JUDGEMENT) ||
            claim.generalApplication.applicationTypes[0].option.includes(ApplicationTypeOption.VARY_PAYMENT_TERMS_OF_JUDGMENT) ||
            claim.generalApplication.applicationTypes[0].option.includes(ApplicationTypeOption.SETTLE_BY_CONSENT)) &&
          checkIfFieldsNotNull(claim)) {
          next();
        } else {
          return res.redirect(constructResponseUrlWithIdParams(claimId, APPLICATION_TYPE_URL));
        }
      } else {
        if (claim.generalApplication.orderJudges != undefined && checkIfFieldsNotNull(claim)) {
          next();
        } else {
          return res.redirect(constructResponseUrlWithIdParams(claimId, APPLICATION_TYPE_URL));
        }
      }
    }
  } catch (error) {
    next(error);
  }

  function checkIfFieldsNotNull(claim: Claim) {
    return claim.generalApplication.agreementFromOtherParty != null &&
      claim.generalApplication.applicationFee != undefined &&
      (claim.generalApplication.wantToUploadDocuments ===  'no' || (claim.generalApplication.wantToUploadDocuments === 'yes' && claim.generalApplication.uploadEvidenceForApplication.length >= 1)) &&
      claim.generalApplication.unavailableDatesHearing.items != null &&
      claim.generalApplication.hearingContactDetails != null &&
      (claim.generalApplication.hearingArrangement != null && claim.generalApplication.hearingArrangement.option.length >= 1 &&
        claim.generalApplication.hearingArrangement.reasonForPreferredHearingType != null);
  }

};
