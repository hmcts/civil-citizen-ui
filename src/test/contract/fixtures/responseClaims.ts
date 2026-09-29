import {draftClaim, draftVariants} from './draftClaim';
import {Claim} from 'models/claim';
import {PaymentDate} from 'form/models/admission/fullAdmission/paymentOption/paymentDate';
import {ResponseType} from 'form/models/responseType';
import {PaymentOptionType} from 'form/models/admission/paymentOption/paymentOptionType';
import {YesNo} from 'form/models/yesNo';
import {RejectAllOfClaimType} from 'form/models/rejectAllOfClaimType';
import {ClaimantResponse} from 'models/claimantResponse';
import {DirectionQuestionnaire} from 'models/directionsQuestionnaire/directionQuestionnaire';
import {ClaimBilingualLanguagePreference} from 'models/claimBilingualLanguagePreference';
import {translateDraftResponseToCCD} from 'services/translation/response/ccdTranslation';
import {translateClaimantResponseToCCD} from 'services/translation/claimantResponse/claimantResponseCCDTranslation';

export const responseVariants = ['defence', 'full-admission', 'part-admission',
  'claimant-acceptance', 'claimant-rejection', 'claimant-instalments', 'claimant-set-date'] as const;
export type ResponseVariant = typeof responseVariants[number];

const dq = () => ({welshLanguageRequirements: {language: {speakLanguage: 'cy', documentsLanguage: 'cy-en'}},
  hearing: {phoneOrVideoHearing: {option: YesNo.YES, details: 'A video hearing is requested.'},
    cantAttendHearingInNext12Months: {option: YesNo.NO}, triedToSettle: {option: YesNo.YES}},
} as DirectionQuestionnaire);
const mediation = () => ({isMediationContactNameCorrect: {option: YesNo.YES},
  isMediationEmailCorrect: {option: YesNo.YES}, isMediationPhoneCorrect: {option: YesNo.YES},
  hasUnavailabilityNextThreeMonths: {option: YesNo.NO}});

export function responseClaim(variant: ResponseVariant): Claim {
  const claim = draftClaim(draftVariants[3]);
  claim.claimBilingualLanguagePreference = ClaimBilingualLanguagePreference.WELSH_AND_ENGLISH;
  claim.respondent1.responseType = variant === 'defence' ? ResponseType.FULL_DEFENCE
    : variant === 'full-admission' || variant === 'claimant-instalments' || variant === 'claimant-set-date'
      ? ResponseType.FULL_ADMISSION : ResponseType.PART_ADMISSION;
  claim.fullAdmission = {paymentIntention: {paymentOption: PaymentOptionType.INSTALMENTS,
    repaymentPlan: {paymentAmount: 100, repaymentFrequency: 'MONTH', firstRepaymentDate: new Date('2025-06-01T00:00:00Z')}}};
  claim.partialAdmission = {alreadyPaid: {option: YesNo.NO}, howMuchDoYouOwe: {amount: 600},
    whyDoYouDisagree: {text: 'Only part of the invoice is due.'},
    paymentIntention: {paymentOption: PaymentOptionType.BY_SET_DATE, paymentDate: new Date('2025-06-01T00:00:00Z')}};
  claim.rejectAllOfClaim = {option: RejectAllOfClaimType.DISPUTE, defence: {text: 'The invoice was issued in error.'}};
  if (claim.respondent1.responseType !== ResponseType.FULL_ADMISSION) claim.fullAdmission = undefined;
  if (claim.respondent1.responseType !== ResponseType.PART_ADMISSION) claim.partialAdmission = undefined;
  if (claim.respondent1.responseType !== ResponseType.FULL_DEFENCE) claim.rejectAllOfClaim = undefined;
  if (claim.respondent1.responseType !== ResponseType.FULL_ADMISSION) {
    claim.directionQuestionnaire = dq();
    claim.mediationCarm = mediation();
  }
  if (variant.startsWith('claimant-')) {
    const response = new ClaimantResponse();
    if (variant === 'claimant-acceptance' || variant === 'claimant-rejection') {
      response.hasPartAdmittedBeenAccepted = {option: variant === 'claimant-acceptance' ? YesNo.YES : YesNo.NO};
      response.intentionToProceed = {option: variant === 'claimant-rejection' ? YesNo.YES : YesNo.NO};
      if (variant === 'claimant-acceptance') response.fullAdmitSetDateAcceptPayment = {option: YesNo.YES};
      if (variant === 'claimant-rejection') {
        response.directionQuestionnaire = dq();
        response.mediationCarm = mediation();
      }
    } else {
      response.fullAdmitSetDateAcceptPayment = {option: YesNo.NO};
      response.rejectionReason = {text: 'A different repayment schedule is proposed.'};
      response.suggestedPaymentIntention = variant === 'claimant-instalments'
        ? {paymentOption: PaymentOptionType.INSTALMENTS,
          repaymentPlan: {paymentAmount: 200, repaymentFrequency: 'MONTH', firstRepaymentDate: new Date('2025-07-01T00:00:00Z')}}
        : {paymentOption: PaymentOptionType.BY_SET_DATE, paymentDate: new PaymentDate('2025', '7', '1') as unknown as Date};
    }
    claim.claimantResponse = response;
  }
  return claim;
}

export const responsePayload = (variant: ResponseVariant) => variant.startsWith('claimant-')
  ? translateClaimantResponseToCCD(responseClaim(variant)) : translateDraftResponseToCCD(responseClaim(variant), false);
