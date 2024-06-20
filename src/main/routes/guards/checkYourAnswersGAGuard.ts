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
          claim.generalApplication.applicationCosts != null &&
          checkIfFieldsNotNull(claim)) {
          next();
        } else if (claim.generalApplication.applicationTypes[0].option.includes(ApplicationTypeOption.VARY_PAYMENT_TERMS_OF_JUDGMENT) &&
          claim.generalApplication.uploadN245Form != null && checkIfFieldsNotNull(claim)) {
          next();
        } else if (claim.generalApplication.applicationTypes[0].option.includes(ApplicationTypeOption.RELIEF_FROM_SANCTIONS) &&
          checkIfFieldsNotNullForMultiApplnType(claim) && checkIfFieldsNotNull(claim)) {
          next();
        } else if (claim.generalApplication.applicationTypes[0].option.includes(ApplicationTypeOption.SETTLE_BY_CONSENT) &&
          checkIfSettlingClaimFieldsSet(claim)) {
          next();
        } else if (!(claim.generalApplication.applicationTypes[0].option.includes(ApplicationTypeOption.SET_ASIDE_JUDGEMENT) ||
            claim.generalApplication.applicationTypes[0].option.includes(ApplicationTypeOption.VARY_PAYMENT_TERMS_OF_JUDGMENT) ||
            claim.generalApplication.applicationTypes[0].option.includes(ApplicationTypeOption.RELIEF_FROM_SANCTIONS) ||
            claim.generalApplication.applicationTypes[0].option.includes(ApplicationTypeOption.SETTLE_BY_CONSENT)) &&
          checkIfFieldsNotNullForMultiApplnType(claim) && checkIfFieldsNotNull(claim)) {
          next();
        } else {
          return res.redirect(constructResponseUrlWithIdParams(claimId, APPLICATION_TYPE_URL));
        }
      } else {
        if (claim.generalApplication.orderJudges.length >= 1 && checkIfFieldsNotNullForMultiApplnType(claim) && checkIfFieldsNotNull(claim)) {
          next();
        } else {
          return res.redirect(constructResponseUrlWithIdParams(claimId, APPLICATION_TYPE_URL));
        }
      }
    }

    /*if (claim.generalApplication.applicationTypes !== undefined) {
      if (((claim.generalApplication.applicationTypes.length === 1 && claim.generalApplication.applicationTypes[0].option === 'SET_ASIDE_JUDGEMENT' && claim.generalApplication.applicationCosts != null) ||
          (claim.generalApplication.applicationTypes.length === 1 && claim.generalApplication.applicationTypes[0].option === 'VARY_PAYMENT_TERMS_OF_JUDGMENT' && claim.generalApplication.uploadN245Form != null) ||
          (claim.generalApplication.applicationTypes.length === 1 && claim.generalApplication.applicationTypes[0].option === 'RELIEF_FROM_SANCTIONS' && checkIfFieldsNotNullForMultiApplnType(claim)) ||
          (claim.generalApplication.applicationTypes.length >= 1 && claim.generalApplication.orderJudges.length >= 1 && checkIfFieldsNotNullForMultiApplnType(claim))
          && checkIfFieldsNotNull(claim)) ||
        (claim.generalApplication.applicationTypes.length === 1 && claim.generalApplication.applicationTypes[0].option === 'SETTLE_BY_CONSENT' && checkIfSettlingClaimFieldsSet(claim))) {
        next();
      } else {
        return res.redirect(constructResponseUrlWithIdParams(claimId, APPLICATION_TYPE_URL));
      }
    }
    return res.redirect(constructResponseUrlWithIdParams(claimId, APPLICATION_TYPE_URL));*/
  } catch (error) {
    next(error);
  }

  function checkIfSettlingClaimFieldsSet(claim: Claim) {
    return (claim.generalApplication.wantToUploadDocuments ===  'no' || (claim.generalApplication.wantToUploadDocuments === 'yes' && claim.generalApplication.uploadEvidenceForApplication.length >= 1)) &&
      claim.generalApplication.unavailableDatesHearing.items != null &&
      claim.generalApplication.hearingContactDetails != null &&
      claim.generalApplication.applicationCosts != null &&
      claim.generalApplication.requestingReasons != null &&
      (claim.generalApplication.hearingArrangement != null && claim.generalApplication.hearingArrangement.option.length >= 1 &&
        claim.generalApplication.hearingArrangement.reasonForPreferredHearingType != null);
  }

  function checkIfFieldsNotNull(claim: Claim) {
    return claim.generalApplication.agreementFromOtherParty != null &&
      (claim.generalApplication.wantToUploadDocuments ===  'no' || (claim.generalApplication.wantToUploadDocuments === 'yes' && claim.generalApplication.uploadEvidenceForApplication.length >= 1)) &&
      claim.generalApplication.unavailableDatesHearing.items != null &&
      claim.generalApplication.hearingContactDetails != null &&
      (claim.generalApplication.hearingArrangement != null && claim.generalApplication.hearingArrangement.option.length >= 1 &&
        claim.generalApplication.hearingArrangement.reasonForPreferredHearingType != null);
  }

  /*
  * Ask the court to reconsider an order
  *  */
  function checkIfFieldsNotNullForMultiApplnType(claim: Claim) {
    return claim.generalApplication.applicationCosts != null &&
      claim.generalApplication.requestingReasons != null &&
      claim.generalApplication.informOtherParties.option != null;
  }

};
