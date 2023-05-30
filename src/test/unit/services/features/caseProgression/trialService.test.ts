import {getTrialContent} from 'services/features/caseProgression/trialService';
import {CaseState} from 'form/models/claimDetails';

describe('Trial service', () => {
  it('should return all sections if all selected', () => {
    //Given
    const mockClaim = require('../../../../utils/mocks/civilClaimResponseMock.json');
    const testClaim = {
      ...mockClaim,
      state: CaseState.AWAITING_APPLICANT_INTENTION,
      case_data: {
        ...mockClaim.case_data,
        caseProgression: {
          defendantUploadDocuments : {
            trial: [
              {documentType: 'CASE_SUMMARY', selected: true},
              {documentType: 'SKELETON', selected: true},
              {documentType: 'LEGAL', selected: true},
              {documentType: 'COSTS', selected: true},
              {documentType: 'DOCUMENTARY', selected: true},
            ],
          },
        },
      },
    };

    //when
    const actualDisclosureContent = getTrialContent(testClaim.id, testClaim.case_data);

    //Then
    expect(actualDisclosureContent.length).toEqual(5);

    expect(actualDisclosureContent[0].contentSections.length).toEqual(2);
    expect(actualDisclosureContent[1].contentSections.length).toEqual(2);
    expect(actualDisclosureContent[2].contentSections.length).toEqual(2);
    expect(actualDisclosureContent[3].contentSections.length).toEqual(2);
    expect(actualDisclosureContent[4].contentSections.length).toEqual(4);

    expect(actualDisclosureContent[0].contentSections[0].data.text).toEqual('PAGES.UPLOAD_DOCUMENTS.TRIAL.CASE_SUMMARY');
    expect(actualDisclosureContent[1].contentSections[0].data.text).toEqual('PAGES.UPLOAD_DOCUMENTS.TRIAL.SKELETON');
    expect(actualDisclosureContent[2].contentSections[0].data.text).toEqual('PAGES.UPLOAD_DOCUMENTS.TRIAL.LEGAL');
    expect(actualDisclosureContent[3].contentSections[0].data.text).toEqual('PAGES.UPLOAD_DOCUMENTS.TRIAL.COSTS');
    expect(actualDisclosureContent[4].contentSections[0].data.text).toEqual('PAGES.UPLOAD_DOCUMENTS.TRIAL.DOCUMENTARY');
  });

  it('should return no section if nothing selected', () => {
    //Given
    const mockClaim = require('../../../../utils/mocks/civilClaimResponseMock.json');
    const testClaim = {
      ...mockClaim,
      state: CaseState.AWAITING_APPLICANT_INTENTION,
      case_data: {
        ...mockClaim.case_data,
        caseProgression: {
          defendantUploadDocuments : {
            trial: [
              {documentType: 'CASE_SUMMARY', selected: false},
              {documentType: 'SKELETON', selected: false},
              {documentType: 'LEGAL', selected: false},
              {documentType: 'COSTS', selected: false},
              {documentType: 'DOCUMENTARY', selected: false},
            ],
          },
        },
      },
    };

    //when
    const actualDisclosureContent = getTrialContent(testClaim.id, testClaim.case_data);

    //Then
    expect(actualDisclosureContent.length).toEqual(0);
  });
});
