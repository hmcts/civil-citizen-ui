import {convertToCUIEvidenceConfirmDetails} from 'services/translation/convertToCUI/convertToCUIEvidenceConfirmDetails';
import {CCDClaim} from 'models/civilClaimResponse';
import {ConfirmYourDetailsEvidence} from 'form/models/confirmYourDetailsEvidence';

describe('translate CCD data to CUI DQ Evidence confirm details', () => {
  it('should return undefined when no lip response', () => {
    // Given
    const ccdClaim: CCDClaim = {};

    const expected: ConfirmYourDetailsEvidence = {
      firstName: undefined,
      lastName: undefined,
      phoneNumber: undefined,
      emailAddress: undefined,
      jobTitle: undefined,
    };

    // When
    const result = convertToCUIEvidenceConfirmDetails(ccdClaim);
    // Then
    expect(result).toEqual(expected);
  });

  it('should return undefined', () => {
    // Given
    const ccdClaim: CCDClaim = {
      respondent1LiPResponse: {
        respondent1LiPContactPerson: 'a',
      },
    };

    const expected: ConfirmYourDetailsEvidence = {
      firstName: undefined,
      lastName: undefined,
      phoneNumber: undefined,
      emailAddress: undefined,
      jobTitle: undefined,
    };

    // When
    const result = convertToCUIEvidenceConfirmDetails(ccdClaim);
    // Then
    expect(result).toEqual(expected);
  });

  it('should translate CCD data when values exist', () => {
    // Given
    const ccdClaim: CCDClaim = {
      respondent1LiPResponse: {
        respondent1DQEvidenceConfirmDetails: {
          firstName: 'Ant',
          lastName: 'Pant',
          phone: '778899456',
          email: 'ant@pant.com',
          jobTitle: 'Chant',
        },
      },
    };

    const expected: ConfirmYourDetailsEvidence = {
      firstName: 'Ant',
      lastName: 'Pant',
      phoneNumber: 778899456,
      emailAddress: 'ant@pant.com',
      jobTitle: 'Chant',
    };

    // When
    const result = convertToCUIEvidenceConfirmDetails(ccdClaim);
    // Then
    expect(result).toMatchObject(expected);
  });
});
