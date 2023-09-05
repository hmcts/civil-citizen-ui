import {Claim} from 'common/models/claim';
import {YesNo, YesNoUpperCamelCase} from 'common/form/models/yesNo';
import {translateClaimantResponseToCCD} from 'services/translation/claimantResponse/claimantResponseCCDTranslation';
import {ClaimantResponse} from 'common/models/claimantResponse';
import {GenericYesNo} from 'common/form/models/genericYesNo';
import {Mediation} from 'common/models/mediation/mediation';
import {mockExpertDetailsList} from '../../features/directionsQuestionnaire/experts/expertDetailsService.test';
import {SpecificCourtLocation} from 'common/models/directionsQuestionnaire/hearing/specificCourtLocation';
import {Experts} from 'common/models/directionsQuestionnaire/experts/experts';
import {LanguageOptions} from 'common/models/directionsQuestionnaire/languageOptions';
import {DirectionQuestionnaire} from 'common/models/directionsQuestionnaire/directionQuestionnaire';
import {Hearing} from 'common/models/directionsQuestionnaire/hearing/hearing';
import {Witnesses} from 'common/models/directionsQuestionnaire/witnesses/witnesses';
import {VulnerabilityQuestions} from 'common/models/directionsQuestionnaire/vulnerabilityQuestions/vulnerabilityQuestions';
import {WelshLanguageRequirements} from 'common/models/directionsQuestionnaire/welshLanguageRequirements/welshLanguageRequirements';
import {CaseState} from 'common/form/models/claimDetails';

describe('Translate claimant response to ccd version', () => {
  let claim: Claim;
  beforeEach(() => {
    claim = new Claim();
    claim.ccdState = CaseState.AWAITING_APPLICANT_INTENTION;
    claim.claimantResponse = new ClaimantResponse();
  })
  it('should translate hasPartAdmittedBeenAccepted to ccd', () => {
    //Given
    claim.claimantResponse.hasPartAdmittedBeenAccepted = <GenericYesNo>{option: YesNo.NO};
    //When
    const ccdClaim = translateClaimantResponseToCCD(claim);
    //Then
    expect(ccdClaim.applicant1AcceptAdmitAmountPaidSpec).toBe(YesNoUpperCamelCase.NO);
  });
  it('should translate mediation to ccd', () => {
    //Given
    claim.claimantResponse.mediation = <Mediation>{
      noMediationReason: {
        iDoNotWantMediationReason: 'NO_DELAY_IN_HEARING',
      },
      mediationDisagreement: {
        option: YesNo.NO
      }
    };
    //When
    const ccdClaim = translateClaimantResponseToCCD(claim);
    //Then
    expect(ccdClaim.applicant1ClaimMediationSpecRequiredLip.noMediationReasonLiP).toBe('NO_DELAY_IN_HEARING');
    expect(ccdClaim.applicant1ClaimMediationSpecRequiredLip.hasAgreedFreeMediation).toBe(YesNoUpperCamelCase.NO);
    expect(ccdClaim.applicant1ClaimMediationSpecRequiredLip.mediationDisagreementLiP).toBe(YesNoUpperCamelCase.NO);
  });
  it('should translate small claim DQ to ccd', () => {
    //Given
    claim.totalClaimAmount = 1500;
    claim.claimantResponse.directionQuestionnaire = new DirectionQuestionnaire();
    claim.claimantResponse.directionQuestionnaire.hearing = new Hearing();
    claim.claimantResponse.directionQuestionnaire.witnesses = new Witnesses();
    claim.claimantResponse.directionQuestionnaire.experts = new Experts();
    claim.claimantResponse.directionQuestionnaire.welshLanguageRequirements = new WelshLanguageRequirements();
    claim.claimantResponse.directionQuestionnaire.vulnerabilityQuestions = new VulnerabilityQuestions();
    claim.claimantResponse.directionQuestionnaire.hearing.determinationWithoutHearing = {option: YesNo.YES};
    claim.claimantResponse.directionQuestionnaire.defendantYourselfEvidence = {option: YesNo.YES};
    claim.claimantResponse.directionQuestionnaire.witnesses.otherWitnesses = {option: YesNo.NO};
    claim.claimantResponse.directionQuestionnaire.hearing.cantAttendHearingInNext12Months = {option: YesNo.NO};
    claim.claimantResponse.directionQuestionnaire.hearing.phoneOrVideoHearing = {option: YesNo.NO};
    claim.claimantResponse.directionQuestionnaire.vulnerabilityQuestions.vulnerability = {option: YesNo.NO};
    claim.claimantResponse.directionQuestionnaire.hearing.supportRequiredList = {option: YesNo.NO};
    claim.claimantResponse.directionQuestionnaire.hearing.specificCourtLocation = <SpecificCourtLocation>{option: 'no'};
    claim.claimantResponse.directionQuestionnaire.welshLanguageRequirements.language = {speakLanguage: LanguageOptions.WELSH, documentsLanguage: LanguageOptions.ENGLISH};
    claim.claimantResponse.directionQuestionnaire.experts.expertRequired = true;
    claim.claimantResponse.directionQuestionnaire.experts.expertReportDetails = {option: YesNo.NO};
    claim.claimantResponse.directionQuestionnaire.experts.permissionForExpert = {option: YesNo.YES};
    claim.claimantResponse.directionQuestionnaire.experts.expertCanStillExamine = {option: YesNo.YES, details: 'test'};
    claim.claimantResponse.directionQuestionnaire.experts.expertDetailsList = mockExpertDetailsList;
    //When
    const ccdClaim = translateClaimantResponseToCCD(claim);
    //Then
    expect(ccdClaim.applicant1DQLanguage.court).toBe('WELSH');
    expect(ccdClaim.applicant1DQLanguage.documents).toBe('ENGLISH');
    expect(ccdClaim.applicant1DQVulnerabilityQuestions.vulnerabilityAdjustmentsRequired).toBe(YesNoUpperCamelCase.NO);
    expect(ccdClaim.applicant1DQRequestedCourt.requestHearingAtSpecificCourt).toBe(YesNoUpperCamelCase.NO);
    expect(ccdClaim.applicant1DQWitnesses.witnessesToAppear).toBe(YesNoUpperCamelCase.NO);
    expect(ccdClaim.applicant1ClaimExpertSpecRequired).toBe(YesNoUpperCamelCase.YES);
    expect(ccdClaim.applicant1DQExperts.expertRequired).toBe(YesNoUpperCamelCase.YES);
    expect(ccdClaim.applicant1DQExperts.details.length).toBe(1);
    expect(ccdClaim.applicant1DQSmallClaimHearing.unavailableDatesRequired).toBe(YesNoUpperCamelCase.NO);
    expect(ccdClaim.applicant1LiPResponse.applicant1DQExtraDetails.giveEvidenceYourSelf).toBe(YesNoUpperCamelCase.YES);
    expect(ccdClaim.applicant1LiPResponse.applicant1DQExtraDetails.applicant1DQLiPExpert.expertReportRequired).toBe(YesNoUpperCamelCase.NO);
    expect(ccdClaim.applicant1LiPResponse.applicant1DQExtraDetails.applicant1DQLiPExpert.expertCanStillExamineDetails).toBe('test');
    expect(ccdClaim.applicant1LiPResponse.applicant1DQExtraDetails.wantPhoneOrVideoHearing).toBe(YesNoUpperCamelCase.NO);
    expect(ccdClaim.applicant1LiPResponse.applicant1DQExtraDetails.determinationWithoutHearingRequired).toBe(YesNoUpperCamelCase.YES);
    expect(ccdClaim.applicant1LiPResponse.applicant1DQHearingSupportLip.supportRequirementLip).toBe(YesNoUpperCamelCase.NO);
  });
});
