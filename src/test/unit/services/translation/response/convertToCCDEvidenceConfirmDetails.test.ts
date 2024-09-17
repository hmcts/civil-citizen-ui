import {Claim} from 'models/claim';
import {DirectionQuestionnaire} from 'models/directionsQuestionnaire/directionQuestionnaire';
import {convertToCCDEvidenceConfirmDetails} from 'services/translation/response/convertToCCDEvidenceConfirmDetails';
import {CCDEvidenceConfirmDetails} from 'models/ccdResponse/ccdEvidenceConfirmDetails';

describe('translate DQ confirm details for evidence CCD model', () => {
  const claim = new Claim();
  claim.directionQuestionnaire = new DirectionQuestionnaire();

  it('should return undefined if data doesnt exist', () => {
    //When
    const dqExtraDetails = convertToCCDEvidenceConfirmDetails(claim.directionQuestionnaire.confirmYourDetailsEvidence);
    //then
    expect(dqExtraDetails).toEqual(undefined);
  });

  it('should return values if data exist',() => {
    //given
    claim.directionQuestionnaire.confirmYourDetailsEvidence = {
      firstName: 'Ted',
      lastName: 'Ned',
      phoneNumber: 7788445566,
      emailAddress: 'ted@ned.ed',
      jobTitle: 'Person',
    };

    const expected: CCDEvidenceConfirmDetails = {
      firstName: 'Ted',
      lastName: 'Ned',
      phone: '7788445566',
      email: 'ted@ned.ed',
      jobTitle: 'Person',
    };

    //When
    const actual = convertToCCDEvidenceConfirmDetails(claim.directionQuestionnaire.confirmYourDetailsEvidence);
    //then
    expect(actual).toEqual(expected);
  });
});
