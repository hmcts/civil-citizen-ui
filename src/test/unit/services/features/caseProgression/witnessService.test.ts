import {getWitnessContent} from 'services/features/caseProgression/witnessService';
import {CaseState} from 'form/models/claimDetails';

describe('Witness Content service', () => {
  const mockClaim = require('../../../../utils/mocks/civilClaimResponseMock.json');

  it('should return Witness Statement section content if selected', () => {
    //when
    const testClaim = {
      ...mockClaim,
      state: CaseState.AWAITING_APPLICANT_INTENTION,
      case_data: {
        ...mockClaim.case_data,
        caseProgression: {
          defendantUploadDocuments : {
            witness: [
              {documentType: 'YOUR_STATEMENT', selected: false},
              {documentType: 'WITNESS_STATEMENT', selected: true},
              {documentType: 'WITNESS_SUMMARY', selected: false},
              {documentType: 'NOTICE_OF_INTENTION', selected: false},
              {documentType: 'DOCUMENTS_REFERRED', selected: false},
            ],
          },
        },
      },
    };
    const actualWitnessContent = getWitnessContent(testClaim.id, testClaim.case_data);
    //Then
    expect(actualWitnessContent.length).toEqual(1);
    expect(actualWitnessContent[0].contentSections.length).toEqual(5);
    expect(actualWitnessContent[0].contentSections[0].data.text).toEqual('PAGES.UPLOAD_DOCUMENTS.WITNESS');
  });

  it('should not return any content if not selected', () => {
    //when
    const testClaim = {
      ...mockClaim,
      state: CaseState.AWAITING_APPLICANT_INTENTION,
      case_data: {
        ...mockClaim.case_data,
        caseProgression: {
          defendantUploadDocuments : {
            witness: [
              {documentType: 'YOUR_STATEMENT', selected: false},
              {documentType: 'WITNESS_STATEMENT', selected: false},
              {documentType: 'WITNESS_SUMMARY', selected: false},
              {documentType: 'NOTICE_OF_INTENTION', selected: false},
              {documentType: 'DOCUMENTS_REFERRED', selected: false},
            ],
          },
        },
      },
    };
    const actualEmptyWitnessContent = getWitnessContent(testClaim.id, testClaim.case_data);
    //Then
    expect(actualEmptyWitnessContent.length).toEqual(0);
  });
});
