import {Party} from 'common/models/party';
import {YesNo, YesNoUpperCamelCase} from 'common/form/models/yesNo';
import {PartyType} from 'models/partyType';
import {req} from '../../../../utils/UserDetails';
import {AppRequest} from 'models/AppRequest';
import {Claim} from 'models/claim';
import {
  translateDraftClaimToCCD,
  translateDraftClaimToCCDInterest,
  translateDraftClaimToCCDR2,
} from 'services/translation/claim/ccdTranslation';
import {ClaimDetails} from 'form/models/claim/details/claimDetails';
import {HelpWithFees} from 'form/models/claim/details/helpWithFees';
import {ClaimBilingualLanguagePreference} from 'models/claimBilingualLanguagePreference';
import {CCDLanguage} from 'models/ccdResponse/ccdWelshLanguageRequirements';
import { FeeType } from 'common/form/models/helpWithFees/feeType';
import {Interest} from 'form/models/interest/interest';
import {InterestClaimFromType, InterestEndDateType} from 'form/models/claimDetails';
import {InterestClaimOptionsType} from 'form/models/claim/interest/interestClaimOptionsType';
import {TotalInterest} from 'form/models/interest/totalInterest';
import {CCDInterestType} from 'models/ccdResponse/ccdInterestType';

describe('translate draft claim to ccd version', () => {
  it('should translate applicant1 to ccd', () => {
    //Given
    const claim = new Claim();
    //When
    const ccdClaim = translateDraftClaimToCCD(claim, req as AppRequest);
    //Then
    expect(ccdClaim.applicant1Represented).toBe(YesNoUpperCamelCase.NO);
  });
  it('should translate applicant 1 to ccd', () => {
    //Given
    const claim = new Claim();
    claim.applicant1 = new Party();
    claim.applicant1.type = PartyType.COMPANY;
    claim.applicant1.partyDetails = {
      partyName: 'test',
    };
    //When
    const ccdClaim = translateDraftClaimToCCD(claim, req as AppRequest);
    //Then
    expect(ccdClaim.applicant1).not.toBeUndefined();
    expect(ccdClaim.applicant1?.companyName).toBe('test');
  });
  it('should translate respondent 1 to ccd', () => {
    //Given
    const claim = new Claim();
    claim.respondent1 = new Party();
    claim.respondent1.type = PartyType.COMPANY;
    claim.respondent1.partyDetails = {
      partyName: 'test',
    };
    //When
    const ccdClaim = translateDraftClaimToCCD(claim, req as AppRequest);
    //Then
    expect(ccdClaim.respondent1).not.toBeUndefined();
    expect(ccdClaim.respondent1?.companyName).toBe('test');
  });
  it('should translate HWF to ccd', () => {
    //Given
    const claim = new Claim();
    claim.claimDetails = new ClaimDetails();
    claim.claimDetails.helpWithFees = new HelpWithFees(YesNo.YES, '1111');
    //When
    const ccdClaim = translateDraftClaimToCCD(claim, req as AppRequest);
    //Then
    expect(ccdClaim.helpWithFees?.helpWithFee).toBe('Yes');
    expect(ccdClaim.helpWithFees?.helpWithFeesReferenceNumber).toBe('1111');
  });

  it('should translateDraftClaimToCCDR2', () => {
    //Given
    const claim = new Claim();
    claim.claimDetails = new ClaimDetails();
    claim.claimantBilingualLanguagePreference=ClaimBilingualLanguagePreference.ENGLISH;
    //When
    const ccdClaim = translateDraftClaimToCCDR2(claim, req as AppRequest);
    //Then
    expect(ccdClaim.claimantBilingualLanguagePreference).toBe(CCDLanguage.ENGLISH);
  });

  it('should contain fee type details in ccd translations', () => {
    //Given
    const claim = new Claim();
    claim.claimDetails = new ClaimDetails();
    claim.claimDetails.helpWithFees = {
      referenceNumber: '123',
    };
    //When
    const ccdClaim = translateDraftClaimToCCDR2(claim, req as AppRequest);
    //Then
    expect(ccdClaim.hwfFeeType).toEqual(FeeType.CLAIMISSUED);
  });
});

describe('translate draft claim to ccd version for interest calculation', () => {
  it('should translate claim to ccd date for interest calculation', () => {
    //Given
    const claim = new Claim();
    claim.claimInterest = YesNo.YES;
    claim.totalClaimAmount = 100;
    claim.interest = new Interest();
    claim.interest.interestClaimFrom = InterestClaimFromType.FROM_CLAIM_SUBMIT_DATE;
    claim.interest.interestClaimOptions = InterestClaimOptionsType.BREAK_DOWN_INTEREST;
    claim.interest.interestEndDate = InterestEndDateType.UNTIL_CLAIM_SUBMIT_DATE;
    const reason = 'reason';
    claim.interest.totalInterest = new TotalInterest('200', reason);
    //When
    const ccdClaim = translateDraftClaimToCCDInterest(claim);
    //Then
    expect(ccdClaim.claimInterest).not.toBeUndefined();
    expect(ccdClaim.claimInterest).toBe(YesNoUpperCamelCase.YES);
    expect(ccdClaim.interestClaimOptions).toBe(CCDInterestType.BREAK_DOWN_INTEREST);
    expect(ccdClaim.totalClaimAmount).toBe(100);
    expect(ccdClaim.breakDownInterestTotal).toBe(200);
    expect(ccdClaim.breakDownInterestDescription).toBe(reason);
    expect(ccdClaim.interestClaimFrom).toBe(InterestClaimFromType.FROM_CLAIM_SUBMIT_DATE);
    expect(ccdClaim.interestFromSpecificDate).toBe(undefined);
    expect(ccdClaim.interestFromSpecificDateDescription).toBe(undefined);
    expect(ccdClaim.interestClaimUntil).toBe(InterestEndDateType.UNTIL_CLAIM_SUBMIT_DATE);
  });
});
