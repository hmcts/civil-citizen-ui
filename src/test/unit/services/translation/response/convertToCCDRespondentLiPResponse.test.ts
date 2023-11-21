import {CCDRespondentLiPResponse} from 'models/ccdResponse/ccdRespondentLiPResponse';
import {toCCDRespondentLiPResponse} from 'services/translation/response/convertToCCDRespondentLiPResponse';
import {Claim} from 'models/claim';
import {Party} from 'models/party';
import {PartyDetailsCARM} from 'form/models/partyDetails-CARM';
import {Address} from 'form/models/address';
import {CCDAddress} from 'models/ccdResponse/ccdAddress';
import {CCDDQExtraDetails} from 'models/ccdResponse/ccdDQExtraDetails';
import {CCDHearingSupport} from 'models/ccdResponse/ccdHearingSupport';
import {DefendantTimeline} from 'form/models/timeLineOfEvents/defendantTimeline';
import {TimelineRow} from 'form/models/timeLineOfEvents/timelineRow';
import {YesNo} from 'common/form/models/yesNo';
import {ClaimDetails} from 'common/form/models/claim/details/claimDetails';
import {HelpWithFees} from 'common/form/models/claim/details/helpWithFees';

const setUpUndefinedDQExtraDetails = () : CCDDQExtraDetails => {
  return {
    wantPhoneOrVideoHearing: undefined,
    whyPhoneOrVideoHearing: '',
    whyUnavailableForHearing: undefined,
    giveEvidenceYourSelf: undefined,
    triedToSettle: undefined,
    determinationWithoutHearingRequired: undefined,
    determinationWithoutHearingReason: '',
    requestExtra4weeks: undefined,
    considerClaimantDocuments: undefined,
    considerClaimantDocumentsDetails: '',
    respondent1DQLiPExpert: {
      caseNeedsAnExpert: undefined,
      expertCanStillExamineDetails: '',
      expertReportRequired: undefined,
      details: undefined,
    },
  };
};

const setUpUndefinedDQHearingSupport = () : CCDHearingSupport => {
  return {
    supportRequirementLip: undefined,
    requirementsLip: undefined,
  };
};

const setUPEmptyRespondent = () : Claim => {
  const input = new Claim();
  input.respondent1 = new Party();
  input.respondent1.partyDetails = new PartyDetailsCARM({});
  return input;
};

const setUpUndefinedOutput = () : CCDRespondentLiPResponse => {
  return {
    respondent1MediationLiPResponse: undefined,
    respondent1DQHearingSupportLip: setUpUndefinedDQHearingSupport(),
    respondent1DQExtraDetails: setUpUndefinedDQExtraDetails(),
    respondent1LiPContactPerson: undefined,
    respondent1LiPCorrespondenceAddress: undefined,
  };
};

const addressCCD: CCDAddress = {
  AddressLine1: 'line 1',
  AddressLine2: 'line 2',
  AddressLine3: 'line 3',
  PostCode: 'SW1A 2AA',
  PostTown: 'london',
};

describe('translate cui fields to CCD model', () => {
  it('should return undefined if it is undefined', () => {
    //Given
    const expected : CCDRespondentLiPResponse = setUpUndefinedOutput();
    //When
    const output = toCCDRespondentLiPResponse(new Claim());
    //Then
    expect(output).toEqual(expected);
  });

  it('should return value if postToThisAddress is yes and have data', () => {
    //Given
    const input = setUPEmptyRespondent();
    input.respondent1.partyDetails.contactPerson = 'Example contactPerson';
    input.respondent1.partyDetails.postToThisAddress = 'yes';
    input.respondent1.partyDetails.correspondenceAddress = new Address('line 1', 'line 2', 'line 3', 'london', 'SW1A 2AA' );

    const expected : CCDRespondentLiPResponse = {
      respondent1MediationLiPResponse: undefined,
      respondent1DQHearingSupportLip: setUpUndefinedDQHearingSupport(),
      respondent1DQExtraDetails: setUpUndefinedDQExtraDetails(),
      respondent1LiPContactPerson: 'Example contactPerson',
      respondent1LiPCorrespondenceAddress: addressCCD,
    };
    //When
    const output = toCCDRespondentLiPResponse(input);
    //Then
    expect(output).toEqual(expected);
  });

  it('should return only contact person if postToThisAddress is no ', () => {
    //Given
    const input = setUPEmptyRespondent();
    input.respondent1.partyDetails.contactPerson = 'Example contactPerson';
    input.respondent1.partyDetails.postToThisAddress = 'no';

    const expected : CCDRespondentLiPResponse = {
      respondent1DQHearingSupportLip: setUpUndefinedDQHearingSupport(),
      respondent1DQExtraDetails: setUpUndefinedDQExtraDetails(),
      respondent1MediationLiPResponse: undefined,
      respondent1LiPContactPerson: 'Example contactPerson',
    };
    //When
    const output = toCCDRespondentLiPResponse(input);
    //Then
    expect(output).toEqual(expected);
  });

  it('should return only correspondenceAddress if postToThisAddress is yes and contactPerson undefined ', () => {
    //Given
    const input = setUPEmptyRespondent();
    input.respondent1.partyDetails.postToThisAddress = 'yes';
    input.respondent1.partyDetails.correspondenceAddress = new Address('line 1', 'line 2', 'line 3', 'london', 'SW1A 2AA' );

    const expected : CCDRespondentLiPResponse = {
      respondent1DQHearingSupportLip: setUpUndefinedDQHearingSupport(),
      respondent1DQExtraDetails: setUpUndefinedDQExtraDetails(),
      respondent1MediationLiPResponse: undefined,
      respondent1LiPCorrespondenceAddress: addressCCD,
    };
    //When
    const output = toCCDRespondentLiPResponse(input);
    //Then
    expect(output).toEqual(expected);
  });

  it('return the Respondent LiP Response object', () => {
    // Given
    const claim = new Claim();
    const timeline: DefendantTimeline = new DefendantTimeline([new TimelineRow(6, 11, 2022, 'Event 1')]);

    claim.partialAdmission = {
      alreadyPaid: {
        option: 'yes',
      },
      timeline: timeline,
    };
    claim.evidence = {
      comment: 'Evidence commet',
      evidenceItem: [],
    };
    claim.claimDetails = <ClaimDetails>{
      helpWithFees: <HelpWithFees>{
        option: YesNo.YES,
        referenceNumber: '12345',
      },
    };

    // When
    const result = toCCDRespondentLiPResponse(claim);

    // Then
    expect(result.timelineComment).toEqual(claim.partialAdmission.timeline.comment);
    expect(result.evidenceComment).toEqual(claim.evidence.comment);
  });
});
