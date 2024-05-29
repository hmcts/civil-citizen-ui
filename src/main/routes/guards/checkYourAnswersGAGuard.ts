import { YesNo } from 'common/form/models/yesNo';
import {Claim} from 'common/models/claim';
import { ApplicationTypeOption } from 'common/models/generalApplication/applicationType';
import { constructResponseUrlWithIdParams } from 'common/utils/urlFormatter';
import {NextFunction, Response} from 'express';
import {AppRequest} from 'models/AppRequest';
import {getClaimById} from 'modules/utilityService';
import {APPLICATION_TYPE_URL} from 'routes/urls';

export const checkYourAnswersGAGuard = async (req: AppRequest, res: Response, next: NextFunction) => {
  try {
    const claimId = req.params.id;
    const claim: Claim = await getClaimById(claimId, req, true);

    console.log(claim.generalApplication);

    // claim.generalApplication.applicationType.lentgh;
      // claim.generalApplication.agreementFromOtherParty === YesNo.YES; // IS THERE ANY REASON WHY THE OTHER PARTY SHOULD NOT BE INFORMED is bypassed
      // claim.generalApplication.agreementFromOtherParty === YesNo.NO;

      // claim.generalApplication.applicationType.option === ApplicationTypeOption.VARY_PAYMENT_TERMS_OF_JUDGMENT ||
      // claim.generalApplication.applicationType.option === ApplicationTypeOption.SETTLE_BY_CONSENT ||
      // claim.generalApplication.applicationType.option === ApplicationTypeOption.CONSENT ORDER
      // if 3 opctiones de lo anterior te saltas informOtherParties
      
      // claim.generalApplication.forEach(application => {
        
      // });
      if (
        claim.generalApplication?.applicationType &&
        claim.generalApplication?.agreementFromOtherParty &&
        (claim.generalApplication?.agreementFromOtherParty === YesNo.YES && claim.generalApplication?.informOtherParties) &&
        (claim.generalApplication?.applicationType.option === ApplicationTypeOption.VARY_PAYMENT_TERMS_OF_JUDGMENT 
          && claim.generalApplication?.uploadN245Form?.fileUpload) &&
          claim.generalApplication?.applicationCosts &&
        (claim.generalApplication?.applicationType?.option === ApplicationTypeOption.VARY_PAYMENT_TERMS_OF_JUDGMENT 
          && claim.generalApplication?.orderJudge?.text) &&
        claim.generalApplication?.requestingReason?.text &&
        claim.generalApplication?.wantToUploadDocuments &&
        (claim.generalApplication?.wantToUploadDocuments === YesNo.YES 
          && claim.generalApplication?.uploadEvidenceForApplication[0]?.fileUpload) && 
        (claim.generalApplication?.hearingArrangement?.option && claim.generalApplication?.hearingArrangement?.reasonForPreferredHearingType) &&
        (claim.generalApplication?.hearingContactDetails?.telephoneNumber && claim.generalApplication.hearingContactDetails?.emailAddress)
      ) {
        next();
      } else {
        return res.redirect(constructResponseUrlWithIdParams(claimId, APPLICATION_TYPE_URL));
      }

  } catch (error) {
    next(error);
  }
};
