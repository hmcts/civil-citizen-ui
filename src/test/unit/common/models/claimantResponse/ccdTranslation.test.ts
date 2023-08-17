import { Claim } from 'models/claim';
import { translateClaimantResponseDJToCCD } from 'services/translation/claimantResponse/ccdTranslation';
import { YesNoUpperCamelCase } from 'common/form/models/yesNo';
import { Party } from 'common/models/party';
import { PartyType } from 'common/models/partyType';

describe('translate draft claim to ccd version', () => {
  it('should translate applicant1 to ccd', () => {
    //Given
    const claim = new Claim();
    //When
    const ccdClaim = translateClaimantResponseDJToCCD(claim);
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
    const ccdClaim = translateClaimantResponseDJToCCD(claim);
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
    const ccdClaim = translateClaimantResponseDJToCCD(claim);
    //Then
    expect(ccdClaim.respondent1).not.toBeUndefined();
    expect(ccdClaim.respondent1?.companyName).toBe('test');
  });

});
