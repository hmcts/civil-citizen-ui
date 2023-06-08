import {CaseState} from 'form/models/claimDetails';
import {getExpertContent} from 'services/features/caseProgression/expertService';
import {Claim} from 'models/claim';

describe('Expert service', () => {
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
            expert: [
              {documentType: 'EXPERT_REPORT', selected: true},
              {documentType: 'JOINT_STATEMENT', selected: true},
              {documentType: 'QUESTIONS_FOR_OTHER', selected: true},
              {documentType: 'ANSWERS_TO_QUESTIONS', selected: true},
            ],
          },
        },
      },
    };

    const claim =  Object.assign(new Claim(), testClaim.case_data);

    //when
    const actualExpertContent = getExpertContent(claim);

    //Then
    expect(actualExpertContent.length).toEqual(4);

    expect(actualExpertContent[0].contentSections.length).toEqual(5);
    expect(actualExpertContent[1].contentSections.length).toEqual(5);
    expect(actualExpertContent[2].contentSections.length).toEqual(5);
    expect(actualExpertContent[3].contentSections.length).toEqual(5);

    expect(actualExpertContent[0].contentSections[0].data.text).toEqual('PAGES.UPLOAD_DOCUMENTS.EXPERT.EXPERT_REPORT');
    expect(actualExpertContent[1].contentSections[0].data.text).toEqual('PAGES.UPLOAD_DOCUMENTS.EXPERT.JOINT_STATEMENT');
    expect(actualExpertContent[2].contentSections[0].data.text).toEqual('PAGES.UPLOAD_DOCUMENTS.EXPERT.QUESTIONS_FOR_OTHER');
    expect(actualExpertContent[3].contentSections[0].data.text).toEqual('PAGES.UPLOAD_DOCUMENTS.EXPERT.ANSWERS_TO_QUESTIONS');
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
            expert: [
              {documentType: 'EXPERT_REPORT', selected: true},
              {documentType: 'JOINT_STATEMENT', selected: false},
              {documentType: 'QUESTIONS_FOR_OTHER', selected: false},
              {documentType: 'ANSWERS_TO_QUESTIONS', selected: false},
            ],
          },
        },
      },
    };

    const claim =  Object.assign(new Claim(), testClaim.case_data);

    //when
    const actualExpertContent = getExpertContent(claim);

    //Then
    expect(actualExpertContent.length).toEqual(1);

    expect(actualExpertContent[0].contentSections.length).toEqual(5);

    expect(actualExpertContent[0].contentSections[0].data.text).toEqual('PAGES.UPLOAD_DOCUMENTS.EXPERT.EXPERT_REPORT');
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
            expert: [
              {documentType: 'EXPERT_REPORT', selected: false},
              {documentType: 'JOINT_STATEMENT', selected: true},
              {documentType: 'QUESTIONS_FOR_OTHER', selected: false},
              {documentType: 'ANSWERS_TO_QUESTIONS', selected: false},
            ],
          },
        },
      },
    };

    const claim =  Object.assign(new Claim(), testClaim.case_data);

    //when
    const actualExpertContent = getExpertContent(claim);

    //Then
    expect(actualExpertContent.length).toEqual(1);

    expect(actualExpertContent[0].contentSections.length).toEqual(5);

    expect(actualExpertContent[0].contentSections[0].data.text).toEqual('PAGES.UPLOAD_DOCUMENTS.EXPERT.JOINT_STATEMENT');
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
            expert: [
              {documentType: 'EXPERT_REPORT', selected: false},
              {documentType: 'JOINT_STATEMENT', selected: false},
              {documentType: 'QUESTIONS_FOR_OTHER', selected: true},
              {documentType: 'ANSWERS_TO_QUESTIONS', selected: false},
            ],
          },
        },
      },
    };

    const claim =  Object.assign(new Claim(), testClaim.case_data);

    //when
    const actualExpertContent = getExpertContent(claim);

    //Then
    expect(actualExpertContent.length).toEqual(1);

    expect(actualExpertContent[0].contentSections.length).toEqual(5);

    expect(actualExpertContent[0].contentSections[0].data.text).toEqual('PAGES.UPLOAD_DOCUMENTS.EXPERT.QUESTIONS_FOR_OTHER');
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
            expert: [
              {documentType: 'EXPERT_REPORT', selected: false},
              {documentType: 'JOINT_STATEMENT', selected: false},
              {documentType: 'QUESTIONS_FOR_OTHER', selected: false},
              {documentType: 'ANSWERS_TO_QUESTIONS', selected: true},
            ],
          },
        },
      },
    };

    const claim =  Object.assign(new Claim(), testClaim.case_data);

    //when
    const actualExpertContent = getExpertContent(claim);

    //Then
    expect(actualExpertContent.length).toEqual(1);

    expect(actualExpertContent[0].contentSections.length).toEqual(5);

    expect(actualExpertContent[0].contentSections[0].data.text).toEqual('PAGES.UPLOAD_DOCUMENTS.EXPERT.ANSWERS_TO_QUESTIONS');
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
            expert: [
              {documentType: 'EXPERT_REPORT', selected: false},
              {documentType: 'JOINT_STATEMENT', selected: false},
              {documentType: 'QUESTIONS_FOR_OTHER', selected: false},
              {documentType: 'ANSWERS_TO_QUESTIONS', selected: false},
            ],
          },
        },
      },
    };

    const claim =  Object.assign(new Claim(), testClaim.case_data);

    //when
    const actualExpertContent = getExpertContent(claim);

    //Then
    expect(actualExpertContent.length).toEqual(0);
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
            expert: [],
          },
        },
      },
    };

    const claim =  Object.assign(new Claim(), testClaim.case_data);

    //when
    const actualExpertContent = getExpertContent(claim);

    //Then
    expect(actualExpertContent.length).toEqual(0);
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

    const claim =  Object.assign(new Claim(), testClaim.case_data);

    //when
    const actualExpertContent = getExpertContent(claim);

    //Then
    expect(actualExpertContent.length).toEqual(0);
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

    const claim =  Object.assign(new Claim(), testClaim.case_data);

    //when
    const actualExpertContent = getExpertContent(claim);

    //Then
    expect(actualExpertContent.length).toEqual(0);
  });
});
