import {CaseState} from 'form/models/claimDetails';
import {getWitnessContent} from 'services/features/caseProgression/witnessService';

describe('Witness service', () => {
  it('should return all witness content', () => {
    //Given
    const mockClaim = require('../../../../utils/mocks/civilClaimResponseMock.json');
    const testClaim = {
      ...mockClaim,
      state: CaseState.AWAITING_APPLICANT_INTENTION,
      case_data: {
        ...mockClaim.case_data,
        caseProgression: {
          defendantUploadDocuments: {
            witness: [
              {documentType: 'WITNESS_STATEMENT', selected: true},
              {documentType: 'WITNESS_SUMMARY', selected: true},
              {documentType: 'NOTICE_OF_INTENTION', selected: true},
              {documentType: 'DOCUMENTS_REFERRED', selected: true},
              {documentType: 'DISCLOSURE_LIST', selected: true},
            ],
          },
        },
      },
    };
    //when
    const actualDisclosureContent = getWitnessContent(testClaim.case_data);

    //Then
    expect(actualDisclosureContent.length).toEqual(4);
    expect(actualDisclosureContent[0].contentSections[0].data.text).toEqual('PAGES.UPLOAD_DOCUMENTS.WITNESS.STATEMENT');
    expect(actualDisclosureContent[1].contentSections[0].data.text).toEqual('PAGES.UPLOAD_DOCUMENTS.WITNESS.SUMMARY');
    expect(actualDisclosureContent[2].contentSections[0].data.text).toEqual('PAGES.UPLOAD_DOCUMENTS.WITNESS.NOTICE');
    expect(actualDisclosureContent[3].contentSections[0].data.text).toEqual('PAGES.UPLOAD_DOCUMENTS.WITNESS.DOCUMENT');
  });

  it('should return no witness content', () => {
    //Given
    const mockClaim = require('../../../../utils/mocks/civilClaimResponseMock.json');
    const testClaim = {
      ...mockClaim,
      state: CaseState.AWAITING_APPLICANT_INTENTION,
      case_data: {
        ...mockClaim.case_data,
        caseProgression: {
          defendantUploadDocuments: {
            witness: [
              {documentType: 'WITNESS_STATEMENT', selected: false},
              {documentType: 'WITNESS_SUMMARY', selected: false},
              {documentType: 'NOTICE_OF_INTENTION', selected: false},
              {documentType: 'DOCUMENTS_REFERRED', selected: false},
              {documentType: 'DISCLOSURE_LIST', selected: false},
            ],
          },
        },
      },
    };
    //when
    const actualDisclosureContent = getWitnessContent(testClaim.case_data);

    //Then
    expect(actualDisclosureContent.length).toEqual(0);
  });

  it('should return no section if defendantUploadDocuments not present', () => {
    //Given
    const mockClaim = require('../../../../utils/mocks/civilClaimResponseMock.json');
    const testClaim = {
      ...mockClaim,
      state: CaseState.AWAITING_APPLICANT_INTENTION,
      case_data: {
        ...mockClaim.case_data,
        caseProgression: {},
      },
    };

    //when
    const actualWitnessContent = getWitnessContent(testClaim.case_data);

    //Then
    expect(actualWitnessContent.length).toEqual(0);
  });

  it('should return no section if caseProgression not present', () => {
    //Given
    const mockClaim = require('../../../../utils/mocks/civilClaimantIntentionMock.json');
    const testClaim = {
      ...mockClaim,
      state: CaseState.AWAITING_APPLICANT_INTENTION,
      case_data: {
        ...mockClaim.case_data,
      },
    };

    //when
    const actualWitnessContent = getWitnessContent(testClaim.case_data);

    //Then
    expect(actualWitnessContent.length).toEqual(0);
  });
});
