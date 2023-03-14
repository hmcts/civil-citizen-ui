import {CCDRespondentLiPResponse} from 'models/ccdResponse/ccdRespondentLiPResponse';
import {toCCDRespondentLiPResponse} from 'services/translation/response/convertToCCDRespondentLiPResponse';
import {Claim} from 'models/claim';
import {Party} from 'models/party';
import {PartyDetails} from 'form/models/partyDetails';
import {Address} from 'form/models/address';
import {CCDAddress} from 'models/ccdResponse/ccdAddress';

describe('translate cui fields to CCD model', () => {
  it('should return undefined if it is undefined', () => {
    //Given
    const expected : CCDRespondentLiPResponse = setUpUndefinedOutput();
    //When
    const output = toCCDRespondentLiPResponse(new Claim());
    //Then
    expect(output).toEqual(expected);
  });

  it('should return value if provideCorrespondenceAddress is yes and have data', () => {
    //Given
    const input = new Claim();
    input.respondent1 = new Party();
    const partyDetails = new PartyDetails({});
    partyDetails.contactPerson = 'Example contactPerson';
    partyDetails.provideCorrespondenceAddress = 'yes';
    partyDetails.correspondenceAddress = new Address('line 1', 'line 2', 'line 3', 'london', 'SW1A 2AA' );

    input.respondent1.partyDetails = partyDetails;

    const expected : CCDRespondentLiPResponse = {
      respondent1LiPFinancialDetails: {
        partnerPensionLiP: undefined,
        partnerDisabilityLiP: undefined,
        partnerSevereDisabilityLiP: undefined,
        childrenEducationLiP: undefined,
      },
      respondent1MediationLiPResponse: undefined,
      respondent1LiPContactPerson: 'Example contactPerson',
      respondent1LiPCorrespondenceAddress: addressCCD,
    };
    //When
    const output = toCCDRespondentLiPResponse(input);
    //Then
    expect(output).toEqual(expected);
  });

  it('should return only contact person if provideCorrespondenceAddress is no ', () => {
    //Given
    const input = new Claim();
    input.respondent1 = new Party();
    const partyDetails = new PartyDetails({});
    partyDetails.contactPerson = 'Example contactPerson';
    partyDetails.provideCorrespondenceAddress = 'no';

    input.respondent1.partyDetails = partyDetails;

    const expected : CCDRespondentLiPResponse = {
      respondent1LiPFinancialDetails: {
        partnerPensionLiP: undefined,
        partnerDisabilityLiP: undefined,
        partnerSevereDisabilityLiP: undefined,
        childrenEducationLiP: undefined,
      },
      respondent1MediationLiPResponse: undefined,
      respondent1LiPContactPerson: 'Example contactPerson',
    };
    //When
    const output = toCCDRespondentLiPResponse(input);
    //Then
    expect(output).toEqual(expected);
  });

  it('should return only correspondenceAddress if provideCorrespondenceAddress is yes and contactPerson undefined ', () => {
    //Given
    const input = new Claim();
    input.respondent1 = new Party();
    const partyDetails = new PartyDetails({});
    partyDetails.provideCorrespondenceAddress = 'yes';
    partyDetails.correspondenceAddress = new Address('line 1', 'line 2', 'line 3', 'london', 'SW1A 2AA' );

    input.respondent1.partyDetails = partyDetails;

    const expected : CCDRespondentLiPResponse = {
      respondent1LiPFinancialDetails: {
        partnerPensionLiP: undefined,
        partnerDisabilityLiP: undefined,
        partnerSevereDisabilityLiP: undefined,
        childrenEducationLiP: undefined,
      },
      respondent1MediationLiPResponse: undefined,
      respondent1LiPCorrespondenceAddress: addressCCD,
    };
    //When
    const output = toCCDRespondentLiPResponse(input);
    //Then
    expect(output).toEqual(expected);
  });
});

const setUpUndefinedOutput = () : CCDRespondentLiPResponse => {
  return {
    respondent1LiPFinancialDetails : {
      partnerPensionLiP: undefined,
      partnerDisabilityLiP: undefined,
      partnerSevereDisabilityLiP: undefined,
      childrenEducationLiP: undefined,
    },
    respondent1MediationLiPResponse: undefined,
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
