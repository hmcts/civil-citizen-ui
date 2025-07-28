import {
  GaInformation,
  getGaRedirectionUrl,
  isGaOnline,
  isGaOnlineForWelshGAApplication,
  isGaOnlineQM,
} from 'services/commons/generalApplicationHelper';
import {Claim} from 'models/claim';
import {CaseState} from 'form/models/claimDetails';
import {YesNoUpperCamelCase} from 'form/models/yesNo';
import {ClaimBilingualLanguagePreference} from 'models/claimBilingualLanguagePreference';
import {
  isGaForLipsEnabledAndLocationWhiteListed, isGaForWelshEnabled,
} from '../../../../main/app/auth/launchdarkly/launchDarklyClient';

jest.mock('../../../../main/app/auth/launchdarkly/launchDarklyClient');

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

describe('redirection url', () => {
  it('should GA is online', async () => {
    //Given
    (isGaForWelshEnabled as jest.Mock).mockReturnValueOnce(true);
    (isGaForLipsEnabledAndLocationWhiteListed as jest.Mock).mockReturnValueOnce(true);

    const claim = new Claim();
    claim.ccdState = CaseState.AWAITING_APPLICANT_INTENTION;
    claim.defendantUserDetails = 'test';

    //When
    const result = await getGaRedirectionUrl(claim, true, true);

    //Then
    expect('/case/:id/general-application/application-type?linkFrom=start&isAskMoreTime=true&isAdjournHearing=true').toEqual(result);
  });
  it('should GA is online without variables', async () => {
    //Given
    (isGaForWelshEnabled as jest.Mock).mockReturnValueOnce(true);
    (isGaForLipsEnabledAndLocationWhiteListed as jest.Mock).mockReturnValueOnce(true);

    const claim = new Claim();
    claim.ccdState = CaseState.AWAITING_APPLICANT_INTENTION;
    claim.defendantUserDetails = 'test';

    //When
    const result = await getGaRedirectionUrl(claim);

    //Then
    expect('/case/:id/general-application/application-type?linkFrom=start').toEqual(result);
  });
  it('should GA is Offline', async () => {
    //Given
    (isGaForWelshEnabled as jest.Mock).mockReturnValueOnce(false);
    (isGaForLipsEnabledAndLocationWhiteListed as jest.Mock).mockReturnValueOnce(false);

    const claim = new Claim();
    claim.ccdState = CaseState.AWAITING_APPLICANT_INTENTION;
    claim.defendantUserDetails = 'test';

    //When
    const result = await getGaRedirectionUrl(claim, true, true);

    //Then
    expect('/case/:id/qm/information/CHANGE_CASE/GA_OFFLINE').toEqual(result);
  });
  it('should GA is welsh', async () => {
    //Given
    (isGaForWelshEnabled as jest.Mock).mockReturnValueOnce(false);
    (isGaForLipsEnabledAndLocationWhiteListed as jest.Mock).mockReturnValueOnce(true);

    const claim = new Claim();
    claim.ccdState = CaseState.AWAITING_APPLICANT_INTENTION;
    claim.defendantUserDetails = 'test';
    claim.claimantBilingualLanguagePreference = ClaimBilingualLanguagePreference.WELSH_AND_ENGLISH;

    //When
    const result = await getGaRedirectionUrl(claim, true, true);

    //Then
    expect('/case/:id/submit-application-offline').toEqual(result);
  });

});
describe('isGaOnlineForWelshGAApplication', () => {
  let claim: Claim;

  beforeEach(() => {
    claim = new Claim();
  });

  it('should return GA offline and Welsh if any party is bilingual and not EA court', () => {
    claim.isAnyPartyBilingual = jest.fn().mockReturnValue(true);
    claim.ccdState = CaseState.CASE_ISSUED;

    const result = isGaOnlineForWelshGAApplication(claim, false);
    expect(result.isGaOnline).toBe(false);
    expect(result.isGAWelsh).toBe(false);
  });

  it('should return GA offline if case is pending, taken offline, dismissed or not EA court', () => {
    claim.isAnyPartyBilingual = jest.fn().mockReturnValue(false);
    claim.isCaseIssuedPending = jest.fn().mockReturnValue(true);
    claim.hasClaimTakenOffline = jest.fn().mockReturnValue(false);
    claim.hasClaimBeenDismissed = jest.fn().mockReturnValue(false);

    const result = isGaOnlineForWelshGAApplication(claim, true);
    expect(result.isGaOnline).toBe(false);
    expect(result.isGAWelsh).toBe(false);
  });

  it('should return GA offline if not EA court', () => {
    claim.isAnyPartyBilingual = jest.fn().mockReturnValue(false);
    claim.isCaseIssuedPending = jest.fn().mockReturnValue(false);
    claim.hasClaimTakenOffline = jest.fn().mockReturnValue(false);
    claim.hasClaimBeenDismissed = jest.fn().mockReturnValue(false);

    const result = isGaOnlineForWelshGAApplication(claim, false);
    expect(result.isGaOnline).toBe(false);
  });

  it('should return GA online if claim is settled and defendant details are missing', () => {
    claim.ccdState = CaseState.CASE_SETTLED;
    claim.defendantUserDetails = undefined;
    claim.isLRDefendant = jest.fn().mockReturnValue(false);

    const result = isGaOnlineForWelshGAApplication(claim, true);
    expect(result.isGaOnline).toBe(true);
  });

  it('should return default GA information if all conditions are false', () => {
    claim.ccdState = CaseState.CASE_ISSUED;
    claim.isAnyPartyBilingual = jest.fn().mockReturnValue(false);
    claim.isCaseIssuedPending = jest.fn().mockReturnValue(false);
    claim.hasClaimTakenOffline = jest.fn().mockReturnValue(false);
    claim.hasClaimBeenDismissed = jest.fn().mockReturnValue(false);
    claim.defendantUserDetails = {};
    claim.isLRDefendant = jest.fn().mockReturnValue(false);

    const result = isGaOnlineForWelshGAApplication(claim, true);
    expect(result.isGaOnline).toBe(true);
    expect(result.isGAWelsh).toBe(false);
  });
});

