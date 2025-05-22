import {GaInformation, isGaOnline, isGaOnlineQM} from 'services/commons/generalApplicationHelper';
import {Claim} from 'models/claim';
import {CaseState} from 'form/models/claimDetails';
import {YesNoUpperCamelCase} from 'form/models/yesNo';
import {ClaimBilingualLanguagePreference} from 'models/claimBilingualLanguagePreference';

describe('General Application helper when LR is on', () => {
  it('should GA is online', async () => {
    //Given
    const claim = new Claim();
    claim.ccdState = CaseState.AWAITING_APPLICANT_INTENTION;
    claim.defendantUserDetails = 'test';

    const expected = new GaInformation();
    expected.isGaOnline = true;
    //When
    const result = isGaOnline(claim, true, false);

    //Then
    expect(expected).toEqual(result);
  });

  it('should GA is offline when isCaseIssuedPending', async () => {
    //Given
    const claim = new Claim();
    claim.ccdState = CaseState.PENDING_CASE_ISSUED;

    const expected = new GaInformation();
    expected.isGaOnline = false;
    //When
    const result = isGaOnline(claim, true, false);

    //Then
    expect(expected).toEqual(result);
  });

  it('should GA is offline when defendantUserDetails is undefined and is not setted', async () => {
    //Given
    const claim = new Claim();
    claim.ccdState = CaseState.AWAITING_APPLICANT_INTENTION;

    const expected = new GaInformation();
    expected.isGaOnline = false;
    //When
    const result = isGaOnline(claim, true, false);

    //Then
    expect(expected).toEqual(result);
  });

  it('should GA is offline when isLRDefendant is undefined and is not setted', async () => {
    //Given
    const claim = new Claim();
    claim.ccdState = CaseState.AWAITING_APPLICANT_INTENTION;
    claim.respondent1Represented = YesNoUpperCamelCase.YES;
    claim.defendantUserDetails = 'test';
    const expected = new GaInformation();
    expected.isGaOnline = false;
    //When
    const result = isGaOnline(claim, true, false);

    //Then
    expect(expected).toEqual(result);
  });

  it('should GA is offline when hasClaimTakenOffline', async () => {
    //Given
    const claim = new Claim();
    claim.defendantUserDetails = 'test';
    claim.ccdState = CaseState.PROCEEDS_IN_HERITAGE_SYSTEM;
    claim.takenOfflineDate = new Date();

    const expected = new GaInformation();
    expected.isGaOnline = false;
    //When
    const result = isGaOnline(claim, true, false);

    //Then
    expect(expected).toEqual(result);
  });

  it('should GA is offline when hasClaimTakenOffline', async () => {
    //Given
    const claim = new Claim();
    claim.defendantUserDetails = 'test';
    claim.ccdState = CaseState.CASE_DISMISSED;
    claim.takenOfflineDate = new Date();

    const expected = new GaInformation();
    expected.isGaOnline = false;
    //When
    const result = isGaOnline(claim, true, false);

    //Then
    expect(expected).toEqual(result);
  });

  it('should GA is offline when is not in EaCourt', async () => {
    //Given
    const claim = new Claim();
    claim.defendantUserDetails = 'test';
    claim.ccdState = CaseState.JUDICIAL_REFERRAL;

    const expected = new GaInformation();
    expected.isGaOnline = false;
    //When
    const result = isGaOnline(claim, false, false);

    //Then
    expect(expected).toEqual(result);
  });

  it('should GA is offline when is welsh ga enabled is false', async () => {
    //Given
    const claim = new Claim();
    claim.defendantUserDetails = 'test';
    claim.ccdState = CaseState.JUDICIAL_REFERRAL;
    claim.claimantBilingualLanguagePreference = ClaimBilingualLanguagePreference.WELSH_AND_ENGLISH;

    const expected = new GaInformation();
    expected.isGaOnline = false;
    expected.isGAWelsh = true;
    //When
    const result = isGaOnline(claim, true, false);

    //Then
    expect(expected).toEqual(result);
  });

  it('should GA is offline when is settled with previousCCDState undefined', async () => {
    //Given
    const claim = new Claim();
    claim.ccdState = CaseState.CASE_SETTLED;

    const expected = new GaInformation();
    expected.isGaOnline = false;
    expected.isGAWelsh = false;
    //When
    const result = isGaOnline(claim, true, false);

    //Then
    expect(expected).toEqual(result);
  });

  it('should GA is offline when is settled with previousCCDState', async () => {
    //Given
    const claim = new Claim();
    claim.ccdState = CaseState.CASE_SETTLED;
    claim.previousCCDState = CaseState.AWAITING_APPLICANT_INTENTION;
    const expected = new GaInformation();
    expected.isGaOnline = true;
    expected.isSettledOrDiscontinuedWithPreviousCCDState = true;
    //When
    const result = isGaOnline(claim, true, false);

    //Then
    expect(expected).toEqual(result);
  });

});

describe('General Application helper when Lip is on', () => {
  it('should GA is online', async () => {
    //Given
    const claim = new Claim();
    claim.ccdState = CaseState.AWAITING_APPLICANT_INTENTION;
    claim.defendantUserDetails = 'test';

    const expected = new GaInformation();
    expected.isGaOnline = true;
    //When
    const result = isGaOnlineQM(claim, true, false);

    //Then
    expect(expected).toEqual(result);
  });

  it('should GA is offline when isCaseIssuedPending', async () => {
    //Given
    const claim = new Claim();
    claim.ccdState = CaseState.PENDING_CASE_ISSUED;

    const expected = new GaInformation();
    expected.isGaOnline = false;
    //When
    const result = isGaOnlineQM(claim, true, false);

    //Then
    expect(expected).toEqual(result);
  });

  it('should GA is offline when defendantUserDetails is undefined and is not setted', async () => {
    //Given
    const claim = new Claim();
    claim.ccdState = CaseState.AWAITING_APPLICANT_INTENTION;

    const expected = new GaInformation();
    expected.isGaOnline = false;
    //When
    const result = isGaOnlineQM(claim, true, false);

    //Then
    expect(expected).toEqual(result);
  });

  it('should GA is offline when isLRDefendant is undefined and is not setted', async () => {
    //Given
    const claim = new Claim();
    claim.ccdState = CaseState.AWAITING_APPLICANT_INTENTION;
    claim.respondent1Represented = YesNoUpperCamelCase.YES;
    claim.defendantUserDetails = 'test';
    const expected = new GaInformation();
    expected.isGaOnline = false;
    //When
    const result = isGaOnlineQM(claim, true, false);

    //Then
    expect(expected).toEqual(result);
  });

  it('should GA is offline when hasClaimTakenOffline', async () => {
    //Given
    const claim = new Claim();
    claim.defendantUserDetails = 'test';
    claim.ccdState = CaseState.PROCEEDS_IN_HERITAGE_SYSTEM;
    claim.takenOfflineDate = new Date();

    const expected = new GaInformation();
    expected.isGaOnline = false;
    //When
    const result = isGaOnlineQM(claim, true, false);

    //Then
    expect(expected).toEqual(result);
  });

  it('should GA is offline when hasClaimTakenOffline', async () => {
    //Given
    const claim = new Claim();
    claim.defendantUserDetails = 'test';
    claim.ccdState = CaseState.CASE_DISMISSED;
    claim.takenOfflineDate = new Date();

    const expected = new GaInformation();
    expected.isGaOnline = false;
    //When
    const result = isGaOnlineQM(claim, true, false);

    //Then
    expect(expected).toEqual(result);
  });

  it('should GA is offline when is not in EaCourt', async () => {
    //Given
    const claim = new Claim();
    claim.defendantUserDetails = 'test';
    claim.ccdState = CaseState.JUDICIAL_REFERRAL;

    const expected = new GaInformation();
    expected.isGaOnline = false;
    //When
    const result = isGaOnlineQM(claim, false, false);

    //Then
    expect(expected).toEqual(result);
  });

  it('should GA is offline when is welsh ga enabled is false', async () => {
    //Given
    const claim = new Claim();
    claim.defendantUserDetails = 'test';
    claim.ccdState = CaseState.JUDICIAL_REFERRAL;
    claim.claimantBilingualLanguagePreference = ClaimBilingualLanguagePreference.WELSH_AND_ENGLISH;

    const expected = new GaInformation();
    expected.isGaOnline = false;
    expected.isGAWelsh = true;
    //When
    const result = isGaOnlineQM(claim, true, false);

    //Then
    expect(expected).toEqual(result);
  });

});

