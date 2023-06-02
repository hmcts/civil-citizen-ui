import {getDisclosureContent} from 'services/features/caseProgression/disclosureService';
import {CaseState} from 'form/models/claimDetails';

describe('Disclosure service', () => {
  it('should return both disclosure document and disclosure list content', () => {
    //Given
    const mockClaim = require('../../../../utils/mocks/civilClaimResponseMock.json');
    const testClaim = {
      ...mockClaim,
      state: CaseState.AWAITING_APPLICANT_INTENTION,
      case_data: {
        ...mockClaim.case_data,
        caseProgression: {
          defendantUploadDocuments : {
            disclosure: [
              {documentType: 'DOCUMENTS_FOR_DISCLOSURE', selected: true},
              {documentType: 'DISCLOSURE_LIST', selected: true},
            ],
          },
        },
      },
    };

    //when
    const actualDisclosureContent = getDisclosureContent(testClaim.case_data);

    //Then
    expect(actualDisclosureContent.length).toEqual(2);
    expect(actualDisclosureContent[0].contentSections.length).toEqual(4);
    expect(actualDisclosureContent[0].contentSections[0].data.text).toEqual('PAGES.UPLOAD_DOCUMENTS.DISCLOSURE.DISCLOSURE_DOCUMENTS');
    expect(actualDisclosureContent[1].contentSections.length).toEqual(2);
    expect(actualDisclosureContent[1].contentSections[0].data.text).toEqual('PAGES.UPLOAD_DOCUMENTS.DISCLOSURE.DISCLOSURE_LIST');
  });

  it('should return only disclosure document', () => {
    //Given
    const mockClaim = require('../../../../utils/mocks/civilClaimResponseMock.json');
    const testClaim = {
      ...mockClaim,
      state: CaseState.AWAITING_APPLICANT_INTENTION,
      case_data: {
        ...mockClaim.case_data,
        caseProgression: {
          defendantUploadDocuments : {
            disclosure: [
              {documentType: 'DOCUMENTS_FOR_DISCLOSURE', selected: true},
              {documentType: 'DISCLOSURE_LIST', selected: false},
            ],
          },
        },
      },
    };

    //when
    const actualDisclosureContent = getDisclosureContent(testClaim.case_data);

    //Then
    expect(actualDisclosureContent.length).toEqual(1);
    expect(actualDisclosureContent[0].contentSections.length).toEqual(4);
    expect(actualDisclosureContent[0].contentSections[0].data.text).toEqual('PAGES.UPLOAD_DOCUMENTS.DISCLOSURE.DISCLOSURE_DOCUMENTS');
  });

  it('should return only disclosure list content', () => {
    //Given
    const mockClaim = require('../../../../utils/mocks/civilClaimResponseMock.json');
    const testClaim = {
      ...mockClaim,
      state: CaseState.AWAITING_APPLICANT_INTENTION,
      case_data: {
        ...mockClaim.case_data,
        caseProgression: {
          defendantUploadDocuments : {
            disclosure: [
              {documentType: 'DOCUMENTS_FOR_DISCLOSURE', selected: false},
              {documentType: 'DISCLOSURE_LIST', selected: true},
            ],
          },
        },
      },
    };

    //when
    const actualDisclosureContent = getDisclosureContent(testClaim.case_data);

    //Then
    expect(actualDisclosureContent.length).toEqual(1);
    expect(actualDisclosureContent[0].contentSections.length).toEqual(2);
    expect(actualDisclosureContent[0].contentSections[0].data.text).toEqual('PAGES.UPLOAD_DOCUMENTS.DISCLOSURE.DISCLOSURE_LIST');
  });
});
