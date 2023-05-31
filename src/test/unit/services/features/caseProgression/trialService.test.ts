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

  it('should return section 1 if selected', () => {
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
    expect(actualDisclosureContent.length).toEqual(1);

    expect(actualDisclosureContent[0].contentSections.length).toEqual(2);

    expect(actualDisclosureContent[0].contentSections[0].data.text).toEqual('PAGES.UPLOAD_DOCUMENTS.TRIAL.CASE_SUMMARY');
  });

  it('should return section 2 if selected', () => {
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
              {documentType: 'SKELETON', selected: true},
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
    expect(actualDisclosureContent.length).toEqual(1);

    expect(actualDisclosureContent[0].contentSections.length).toEqual(2);

    expect(actualDisclosureContent[0].contentSections[0].data.text).toEqual('PAGES.UPLOAD_DOCUMENTS.TRIAL.SKELETON');
  });

  it('should return section 3 if selected', () => {
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
              {documentType: 'LEGAL', selected: true},
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
    expect(actualDisclosureContent.length).toEqual(1);

    expect(actualDisclosureContent[0].contentSections.length).toEqual(2);

    expect(actualDisclosureContent[0].contentSections[0].data.text).toEqual('PAGES.UPLOAD_DOCUMENTS.TRIAL.LEGAL');
  });

  it('should return section 4 if selected', () => {
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
              {documentType: 'COSTS', selected: true},
              {documentType: 'DOCUMENTARY', selected: false},
            ],
          },
        },
      },
    };

    //when
    const actualDisclosureContent = getTrialContent(testClaim.id, testClaim.case_data);

    //Then
    expect(actualDisclosureContent.length).toEqual(1);

    expect(actualDisclosureContent[0].contentSections.length).toEqual(2);

    expect(actualDisclosureContent[0].contentSections[0].data.text).toEqual('PAGES.UPLOAD_DOCUMENTS.TRIAL.COSTS');
  });

  it('should return section 5 if selected', () => {
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
              {documentType: 'DOCUMENTARY', selected: true},
            ],
          },
        },
      },
    };

    //when
    const actualDisclosureContent = getTrialContent(testClaim.id, testClaim.case_data);

    //Then
    expect(actualDisclosureContent.length).toEqual(1);

    expect(actualDisclosureContent[0].contentSections.length).toEqual(4);

    expect(actualDisclosureContent[0].contentSections[0].data.text).toEqual('PAGES.UPLOAD_DOCUMENTS.TRIAL.DOCUMENTARY');
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

  it('should return no section if documentType not present', () => {
    //Given
    const mockClaim = require('../../../../utils/mocks/civilClaimResponseMock.json');
    const testClaim = {
      ...mockClaim,
      state: CaseState.AWAITING_APPLICANT_INTENTION,
      case_data: {
        ...mockClaim.case_data,
        caseProgression: {
          defendantUploadDocuments : {
            trial: [],
          },
        },
      },
    };

    //when
    const actualDisclosureContent = getTrialContent(testClaim.id, testClaim.case_data);

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
    const actualDisclosureContent = getTrialContent(testClaim.id, testClaim.case_data);

    //Then
    expect(actualDisclosureContent.length).toEqual(0);
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
    const actualDisclosureContent = getTrialContent(testClaim.id, testClaim.case_data);

    //Then
    expect(actualDisclosureContent.length).toEqual(0);
  });
});
