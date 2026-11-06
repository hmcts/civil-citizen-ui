import {PartyType} from 'models/partyType';
import {UploadDocuments, UploadDocumentTypes} from 'models/caseProgression/uploadDocumentsType';
import {CaseRole} from 'form/models/caseRoles';
import {CaseState} from 'form/models/claimDetails';
import {getExpertContent} from 'services/features/caseProgression/expertService';
import {Claim} from 'models/claim';
import {UploadDocumentsUserForm} from 'models/caseProgression/uploadDocumentsUserForm';
import {GenericForm} from 'form/models/genericForm';
import {getMockExpertSectionArray} from '../../../../utils/caseProgression/mockEvidenceUploadSections';
import {EvidenceUploadExpert} from 'models/document/documentType';

describe('Expert service', () => {
  let mockClaim;
  let expertSection:any;

  beforeEach(() => {
    mockClaim = require('../../../../utils/mocks/civilClaimResponseMock.json');
    expertSection = {
      ...mockClaim,
      state: CaseState.AWAITING_APPLICANT_INTENTION,
      case_data: {
        ...mockClaim.case_data,
        isClaimant: jest.fn(),
        caseProgression: {
          defendantUploadDocuments: {
            expert: [
              { documentType: 'EXPERT_REPORT', selected: false },
              { documentType: 'STATEMENT', selected: false },
              { documentType: 'QUESTIONS_FOR_EXPERTS', selected: false },
              { documentType: 'ANSWERS_FOR_EXPERTS', selected: false },
            ],
          },
        },
      },
    };
  });

  it('should return all sections if all selected', () => {
    //Given
    const mockClaim = require('../../../../utils/mocks/civilClaimResponseMock.json');
    const testClaim = {
      ...mockClaim,
      state: CaseState.AWAITING_APPLICANT_INTENTION,
      case_data: {
        ...mockClaim.case_data,
        isClaimant: jest.fn(),
        caseProgression: {
          defendantUploadDocuments : {
            expert: [
              { documentType: 'EXPERT_REPORT', selected: true },
              { documentType: 'STATEMENT', selected: true },
              { documentType: 'QUESTIONS_FOR_EXPERTS', selected: true },
              { documentType: 'ANSWERS_FOR_EXPERTS', selected: true },
            ],
          },
        },
      },
    };

    const claim =  Object.assign(new Claim(), testClaim.case_data);

    //when
    const actualExpertContent = getExpertContent(claim, null);

    //Then
    expect(actualExpertContent.length).toEqual(4);

    expect(actualExpertContent[0][0].contentSections.length).toEqual(6);
    expect(actualExpertContent[1][0].contentSections.length).toEqual(6);
    expect(actualExpertContent[2][0].contentSections.length).toEqual(6);
    expect(actualExpertContent[3][0].contentSections.length).toEqual(6);

    expect(actualExpertContent[0][0].contentSections[0].data.text).toEqual('PAGES.UPLOAD_DOCUMENTS.EXPERT.EXPERT_REPORT');
    expect(actualExpertContent[1][0].contentSections[0].data.text).toEqual('PAGES.UPLOAD_DOCUMENTS.EXPERT.JOINT_STATEMENT');
    expect(actualExpertContent[2][0].contentSections[0].data.text).toEqual('PAGES.UPLOAD_DOCUMENTS.EXPERT.QUESTIONS_FOR_OTHER');
    expect(actualExpertContent[3][0].contentSections[0].data.text).toEqual('PAGES.UPLOAD_DOCUMENTS.EXPERT.ANSWERS_TO_QUESTIONS');
  });

  it('should return all sections if all selected on claimant request', () => {
    //Given
    const mockClaim = require('../../../../utils/mocks/civilClaimResponseMock.json');
    const testClaim = {
      ...mockClaim,
      state: CaseState.AWAITING_APPLICANT_INTENTION,
      case_data: {
        ...mockClaim.case_data,
        isClaimant: jest.fn(() => true),
        caseProgression: {
          claimantUploadDocuments : {
            expert: [
              { documentType: 'EXPERT_REPORT', selected: true },
              { documentType: 'STATEMENT', selected: true },
              { documentType: 'QUESTIONS_FOR_EXPERTS', selected: true },
              { documentType: 'ANSWERS_FOR_EXPERTS', selected: true },
            ],
          },
        },
      },
    };

    const claim =  Object.assign(new Claim(), testClaim.case_data);

    //when
    const actualExpertContent = getExpertContent(claim, null);

    //Then
    expect(actualExpertContent.length).toEqual(4);

  });

  it('should return multiple section 1 if selected', () => {
    //Given
    expertSection.case_data.caseProgression.defendantUploadDocuments.expert.find(
      (document: { documentType: string; }) => document.documentType === 'EXPERT_REPORT',
    ).selected = true;

    const form = new UploadDocumentsUserForm();
    form.expertReport = getMockExpertSectionArray(EvidenceUploadExpert.ANSWERS_FOR_EXPERTS);
    const genericForm = new GenericForm<UploadDocumentsUserForm>(form);
    genericForm.validateSync();

    const claim =  Object.assign(new Claim(), expertSection.case_data);

    //when
    const actualContent = getExpertContent(claim, genericForm);

    //Then
    expect(actualContent[0].length).toEqual(2);
  });

  it('should return multiple section 2 if selected', () => {
    //Given
    expertSection.case_data.caseProgression.defendantUploadDocuments.expert.find(
      (document: { documentType: string; }) => document.documentType === 'STATEMENT',
    ).selected = true;

    const form = new UploadDocumentsUserForm();
    form.expertStatement = getMockExpertSectionArray(EvidenceUploadExpert.ANSWERS_FOR_EXPERTS);
    const genericForm = new GenericForm<UploadDocumentsUserForm>(form);
    genericForm.validateSync();

    const claim =  Object.assign(new Claim(), expertSection.case_data);

    //when
    const actualContent = getExpertContent(claim, genericForm);

    //Then
    expect(actualContent[0].length).toEqual(2);
  });

  it('should return multiple section 3 if selected', () => {
    //Given
    expertSection.case_data.caseProgression.defendantUploadDocuments.expert.find(
      (document: { documentType: string; }) => document.documentType === 'QUESTIONS_FOR_EXPERTS',
    ).selected = true;

    const form = new UploadDocumentsUserForm();
    form.questionsForExperts = getMockExpertSectionArray(EvidenceUploadExpert.ANSWERS_FOR_EXPERTS);
    const genericForm = new GenericForm<UploadDocumentsUserForm>(form);
    genericForm.validateSync();

    const claim =  Object.assign(new Claim(), expertSection.case_data);

    //when
    const actualContent = getExpertContent(claim, genericForm);

    //Then
    expect(actualContent[0].length).toEqual(2);
  });

  it('should return multiple section 4 if selected', () => {
    //Given
    expertSection.case_data.caseProgression.defendantUploadDocuments.expert.find(
      (document: { documentType: string; }) => document.documentType === 'ANSWERS_FOR_EXPERTS',
    ).selected = true;

    const form = new UploadDocumentsUserForm();
    form.answersForExperts = getMockExpertSectionArray(EvidenceUploadExpert.ANSWERS_FOR_EXPERTS);
    const genericForm = new GenericForm<UploadDocumentsUserForm>(form);
    genericForm.validateSync();

    const claim =  Object.assign(new Claim(), expertSection.case_data);

    //when
    const actualContent = getExpertContent(claim, genericForm);

    //Then
    expect(actualContent[0].length).toEqual(2);
  });

  it('should return no section if nothing selected', () => {
    const claim =  Object.assign(new Claim(), expertSection.case_data);
    const actualContent = getExpertContent(claim, null);

    //Then
    expect(actualContent.length).toEqual(0);
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
    const actualExpertContent = getExpertContent(claim, null);

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
    const actualExpertContent = getExpertContent(claim, null);

    //Then
    expect(actualExpertContent.length).toEqual(0);
  });

  it('should return no section if claimantUploadDocuments not present on claimant request', () => {
    //Given
    const mockClaim = require('../../../../utils/mocks/civilClaimResponseMock.json');
    const testClaim = {
      ...mockClaim,
      state: CaseState.AWAITING_APPLICANT_INTENTION,
      case_data: {
        ...mockClaim.case_data,
        caseProgression: {},
        isClaimant: jest.fn(() => true),
      },
    };

    const claim =  Object.assign(new Claim(), testClaim.case_data);

    //when
    const actualExpertContent = getExpertContent(claim, null);

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
    const actualExpertContent = getExpertContent(claim, null);

    //Then
    expect(actualExpertContent.length).toEqual(0);
  });

  it('should return no section if caseProgression not present on claimant request', () => {
    //Given
    const mockClaim = require('../../../../utils/mocks/civilClaimantIntentionMock.json');
    const testClaim = {
      ...mockClaim,
      state: CaseState.AWAITING_APPLICANT_INTENTION,
      case_data: {
        ...mockClaim.case_data,
        isClaimant: jest.fn(() => true),
      },
    };

    const claim =  Object.assign(new Claim(), testClaim.case_data);

    //when
    const actualExpertContent = getExpertContent(claim, null);

    //Then
    expect(actualExpertContent.length).toEqual(0);
  });
});

describe('selected expert categories without a saved row', () => {
  const categories = [
    {field: 'expertReport', index: 0},
    {field: 'expertStatement', index: 1},
    {field: 'questionsForExperts', index: 2},
    {field: 'answersForExperts', index: 3},
  ] as const;

  it.each(categories.flatMap(category => [CaseRole.CLAIMANT, CaseRole.DEFENDANT].flatMap(role =>
    [undefined, []].map(rows => ({...category, role, rows})),
  )))('renders the blank $field section for $role with $rows rows', ({field, index, role, rows}) => {
    const claim = new Claim();
    claim.caseRole = role;
    claim.applicant1 = {type: PartyType.INDIVIDUAL, partyDetails: {firstName: 'Alex', lastName: 'Claimant'}};
    claim.respondent1 = {type: PartyType.INDIVIDUAL, partyDetails: {firstName: 'Morgan', lastName: 'Defendant'}};
    const selection = new UploadDocuments(
      Array.from({length: 2}, () => new UploadDocumentTypes(false)),
      Array.from({length: 4}, () => new UploadDocumentTypes(false)),
      Array.from({length: 4}, () => new UploadDocumentTypes(false)),
      Array.from({length: 5}, () => new UploadDocumentTypes(false)),
    );
    selection.expert[index].selected = true;
    claim.caseProgression = {[role === CaseRole.CLAIMANT ? 'claimantUploadDocuments' : 'defendantUploadDocuments']: selection};
    const model = Object.assign(new UploadDocumentsUserForm(), {[field]: rows});
    const form = new GenericForm(model);
    const before = JSON.stringify(model);

    const content = getExpertContent(claim, form);

    expect(content).toHaveLength(1);
    expect(content[0]).toHaveLength(1);
    expect(content).toEqual(getExpertContent(claim, null));
    expect(content[0][0].contentSections.some(section => section.data.category === field)).toBe(true);
    expect(JSON.stringify(model)).toBe(before);
  });
});
