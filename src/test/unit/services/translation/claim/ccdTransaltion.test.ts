import {Party} from 'common/models/party';
import {YesNo, YesNoUpperCamelCase} from 'common/form/models/yesNo';
import {PartyType} from 'models/partyType';
import {req} from '../../../../utils/UserDetails';
import {AppRequest} from 'models/AppRequest';
import {Claim} from 'models/claim';
import {translateDraftClaimToCCD, translateDraftClaimToCCDR2} from 'services/translation/claim/ccdTranslation';
import {ClaimDetails} from 'form/models/claim/details/claimDetails';
import {HelpWithFees} from 'form/models/claim/details/helpWithFees';
import {ClaimBilingualLanguagePreference} from "models/claimBilingualLanguagePreference";
import {CCDLanguage} from "models/ccdResponse/ccdWelshLanguageRequirements";

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

});
