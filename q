[1mdiff --git a/src/test/unit/services/translation/claimantResponse/ccdTransaltion.test.ts b/src/test/unit/services/translation/claimantResponse/ccdTransaltion.test.ts[m
[1mindex 6625be866..22e97f6e4 100644[m
[1m--- a/src/test/unit/services/translation/claimantResponse/ccdTransaltion.test.ts[m
[1m+++ b/src/test/unit/services/translation/claimantResponse/ccdTransaltion.test.ts[m
[36m@@ -9,6 +9,9 @@[m [mimport {SpecificCourtLocation} from 'common/models/directionsQuestionnaire/heari[m
 import {LanguageOptions} from 'common/models/directionsQuestionnaire/languageOptions';[m
 import {DirectionQuestionnaire} from 'common/models/directionsQuestionnaire/directionQuestionnaire';[m
 import {CaseState} from 'common/form/models/claimDetails';[m
[32m+[m[32mimport {PaymentOptionType} from 'form/models/admission/paymentOption/paymentOptionType';[m
[32m+[m[32mimport {Party} from 'models/party';[m
[32m+[m[32mimport {ResponseType} from 'form/models/responseType';[m
 [m
 describe('Translate claimant response to ccd version', () => {[m
   let claim: Claim;[m
[36m@@ -66,6 +69,35 @@[m [mdescribe('Translate claimant response to ccd version', () => {[m
     expect(ccdClaim.applicant1LiPResponse.applicant1DQExtraDetails.determinationWithoutHearingReason).toBe('reasonForHearing');[m
     expect(ccdClaim.applicant1LiPResponse.applicant1DQHearingSupportLip.supportRequirementLip).toBe(YesNoUpperCamelCase.NO);[m
   });[m
[32m+[m[32m  it('should translate repaymentPlan rejected details and new proposed payment plan', () => {[m
[32m+[m[32m    //Given[m
[32m+[m[32m    claim = new Claim();[m
[32m+[m[32m    claim.ccdState = CaseState.AWAITING_APPLICANT_INTENTION;[m
[32m+[m[32m    claim.respondent1 = new Party();[m
[32m+[m[32m    claim.respondent1.responseType = ResponseType.PART_ADMISSION;[m
[32m+[m[32m    claim.claimantResponse = new ClaimantResponse();[m
[32m+[m[32m    claim.claimantResponse.fullAdmitSetDateAcceptPayment = new GenericYesNo(YesNo.NO);[m
[32m+[m[32m    claim.claimantResponse.suggestedPaymentIntention = {paymentOption: PaymentOptionType.BY_SET_DATE, paymentDate : new Date() } ;[m
[32m+[m[32m    //When[m
[32m+[m[32m    const ccdClaim = translateClaimantResponseToCCD(claim);[m
[32m+[m[32m    //Then[m
[32m+[m[32m    expect(ccdClaim.applicant1AcceptPartAdmitPaymentPlanSpec).toBe(YesNoUpperCamelCase.NO);[m
[32m+[m[32m    expect(ccdClaim.applicant1RepaymentOptionForDefendantSpec).toBe(PaymentOptionType.BY_SET_DATE);[m
[32m+[m[32m  });[m
[32m+[m
[32m+[m[32m  it('should translate repaymentPlan accepted details', () => {[m
[32m+[m[32m    //Given[m
[32m+[m[32m    claim = new Claim();[m
[32m+[m[32m    claim.ccdState = CaseState.AWAITING_APPLICANT_INTENTION;[m
[32m+[m[32m    claim.respondent1 = new Party();[m
[32m+[m[32m    claim.respondent1.responseType = ResponseType.FULL_ADMISSION;[m
[32m+[m[32m    claim.claimantResponse = new ClaimantResponse();[m
[32m+[m[32m    claim.claimantResponse.fullAdmitSetDateAcceptPayment = new GenericYesNo(YesNo.NO);[m
[32m+[m[32m    //When[m
[32m+[m[32m    const ccdClaim = translateClaimantResponseToCCD(claim);[m
[32m+[m[32m    //Then[m
[32m+[m[32m    expect(ccdClaim.applicant1AcceptFullAdmitPaymentPlanSpec).toBe(YesNoUpperCamelCase.NO);[m
[32m+[m[32m  });[m
 });[m
 [m
 function getClaimantResponseDQ(claim: Claim): Claim {[m
