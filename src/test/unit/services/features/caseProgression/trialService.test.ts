import {getTrialContent} from 'services/features/caseProgression/trialService';
import {CaseState} from 'form/models/claimDetails';
import {UploadDocumentsUserForm} from 'models/caseProgression/uploadDocumentsUserForm';
import {GenericForm} from 'form/models/genericForm';
import {getMockSectionArray} from '../../../../utils/caseProgression/mockEvidenceUploadSections';
import {EvidenceUploadDisclosure} from 'models/document/documentType';

describe('Trial service', () => {
  let mockClaim;
  let trialSections:any;

  beforeEach(() => {
    mockClaim = require('../../../../utils/mocks/civilClaimResponseMock.json');
    trialSections = {
      ...mockClaim,
      state: CaseState.AWAITING_APPLICANT_INTENTION,
      case_data: {
        ...mockClaim.case_data,
        isClaimant: jest.fn(),
        caseProgression: {
          defendantUploadDocuments: {
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
    const actualTrialContent = getTrialContent(testClaim.case_data, null,false);

    //Then
    expect(actualTrialContent.length).toEqual(5);

    expect(actualTrialContent[0][0].contentSections.length).toEqual(2);
    expect(actualTrialContent[1][0].contentSections.length).toEqual(2);
    expect(actualTrialContent[2][0].contentSections.length).toEqual(2);
    expect(actualTrialContent[3][0].contentSections.length).toEqual(2);
    expect(actualTrialContent[4][0].contentSections.length).toEqual(4);

    expect(actualTrialContent[0][0].contentSections[0].data.text).toEqual('PAGES.UPLOAD_DOCUMENTS.TRIAL.CASE_SUMMARY');
    expect(actualTrialContent[1][0].contentSections[0].data.text).toEqual('PAGES.UPLOAD_DOCUMENTS.TRIAL.SKELETON');
    expect(actualTrialContent[2][0].contentSections[0].data.text).toEqual('PAGES.UPLOAD_DOCUMENTS.TRIAL.LEGAL');
    expect(actualTrialContent[3][0].contentSections[0].data.text).toEqual('PAGES.UPLOAD_DOCUMENTS.TRIAL.COSTS');
    expect(actualTrialContent[4][0].contentSections[0].data.text).toEqual('PAGES.UPLOAD_DOCUMENTS.TRIAL.DOCUMENTARY');
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
    const actualTrialContent = getTrialContent(testClaim.case_data, null,false);

    //Then
    expect(actualTrialContent.length).toEqual(5);
  });

  it('should return section 1 if selected', () => {
    //Given
    trialSections.case_data.caseProgression.defendantUploadDocuments.trial.find(
      (document: { documentType: string; }) => document.documentType === 'CASE_SUMMARY',
    ).selected = true;

    //when
    const actualTrialContent = getTrialContent(trialSections.case_data, null,false);

    //Then
    expect(actualTrialContent.length).toEqual(1);

    expect(actualTrialContent[0][0].contentSections.length).toEqual(2);

    expect(actualTrialContent[0][0].contentSections[0].data.text).toEqual('PAGES.UPLOAD_DOCUMENTS.TRIAL.CASE_SUMMARY');
  });

  it('should return multiple of section 1 if selected', () => {
    //Given
    trialSections.case_data.caseProgression.defendantUploadDocuments.trial.find(
      (document: { documentType: string; }) => document.documentType === 'CASE_SUMMARY',
    ).selected = true;

    const form = new UploadDocumentsUserForm();
    form.trialCaseSummary = getMockSectionArray(EvidenceUploadDisclosure.DISCLOSURE_LIST);
    const genericForm = new GenericForm<UploadDocumentsUserForm>(form);
    genericForm.validateSync();

    //when
    const actualTrialContent = getTrialContent(trialSections.case_data, genericForm,false);

    //Then
    expect(actualTrialContent[0].length).toEqual(2);
  });

  it('should return section 2 if selected', () => {
    //Given
    trialSections.case_data.caseProgression.defendantUploadDocuments.trial.find(
      (document: { documentType: string; }) => document.documentType === 'SKELETON',
    ).selected = true;

    //when
    const actualTrialContent = getTrialContent(trialSections.case_data, null,false);

    //Then
    expect(actualTrialContent.length).toEqual(1);

    expect(actualTrialContent[0][0].contentSections.length).toEqual(2);

    expect(actualTrialContent[0][0].contentSections[0].data.text).toEqual('PAGES.UPLOAD_DOCUMENTS.TRIAL.SKELETON');
  });

  it('should return multiple of section 2 if selected', () => {
    //Given
    trialSections.case_data.caseProgression.defendantUploadDocuments.trial.find(
      (document: { documentType: string; }) => document.documentType === 'SKELETON',
    ).selected = true;

    const form = new UploadDocumentsUserForm();
    form.trialSkeletonArgument = getMockSectionArray(EvidenceUploadDisclosure.DISCLOSURE_LIST);
    const genericForm = new GenericForm<UploadDocumentsUserForm>(form);
    genericForm.validateSync();

    //when
    const actualTrialContent = getTrialContent(trialSections.case_data, genericForm,false);

    //Then
    expect(actualTrialContent[0].length).toEqual(2);
  });

  it('should return section 3 if selected', () => {
    //Given
    trialSections.case_data.caseProgression.defendantUploadDocuments.trial.find(
      (document: { documentType: string; }) => document.documentType === 'LEGAL',
    ).selected = true;

    //when
    const actualTrialContent = getTrialContent(trialSections.case_data, null,false);

    //Then
    expect(actualTrialContent.length).toEqual(1);

    expect(actualTrialContent[0][0].contentSections.length).toEqual(2);

    expect(actualTrialContent[0][0].contentSections[0].data.text).toEqual('PAGES.UPLOAD_DOCUMENTS.TRIAL.LEGAL');
  });

  it('should return multiple of section 3 if selected', () => {
    //Given
    trialSections.case_data.caseProgression.defendantUploadDocuments.trial.find(
      (document: { documentType: string; }) => document.documentType === 'LEGAL',
    ).selected = true;

    const form = new UploadDocumentsUserForm();
    form.trialAuthorities = getMockSectionArray(EvidenceUploadDisclosure.DISCLOSURE_LIST);
    const genericForm = new GenericForm<UploadDocumentsUserForm>(form);
    genericForm.validateSync();

    //when
    const actualTrialContent = getTrialContent(trialSections.case_data, genericForm,false);

    //Then
    expect(actualTrialContent[0].length).toEqual(2);
  });

  it('should return section 4 if selected', () => {
    //Given
    trialSections.case_data.caseProgression.defendantUploadDocuments.trial.find(
      (document: { documentType: string; }) => document.documentType === 'COSTS',
    ).selected = true;

    //when
    const actualTrialContent = getTrialContent(trialSections.case_data, null,false);

    //Then
    expect(actualTrialContent.length).toEqual(1);

    expect(actualTrialContent[0][0].contentSections.length).toEqual(2);

    expect(actualTrialContent[0][0].contentSections[0].data.text).toEqual('PAGES.UPLOAD_DOCUMENTS.TRIAL.COSTS');
  });

  it('should return multiple of section 4 if selected', () => {
    //Given
    trialSections.case_data.caseProgression.defendantUploadDocuments.trial.find(
      (document: { documentType: string; }) => document.documentType === 'COSTS',
    ).selected = true;

    const form = new UploadDocumentsUserForm();
    form.trialCosts = getMockSectionArray(EvidenceUploadDisclosure.DISCLOSURE_LIST);
    const genericForm = new GenericForm<UploadDocumentsUserForm>(form);
    genericForm.validateSync();

    //when
    const actualTrialContent = getTrialContent(trialSections.case_data, genericForm,false);

    //Then
    expect(actualTrialContent[0].length).toEqual(2);
  });

  it('should return section 5 if selected', () => {
    //Given
    trialSections.case_data.caseProgression.defendantUploadDocuments.trial.find(
      (document: { documentType: string; }) => document.documentType === 'DOCUMENTARY',
    ).selected = true;

    //when
    const actualTrialContent = getTrialContent(trialSections.case_data, null,false);

    //Then
    expect(actualTrialContent.length).toEqual(1);

    expect(actualTrialContent[0][0].contentSections.length).toEqual(4);

    expect(actualTrialContent[0][0].contentSections[0].data.text).toEqual('PAGES.UPLOAD_DOCUMENTS.TRIAL.DOCUMENTARY');
  });

  it('should return multiple of section 5 if selected', () => {
    //Given
    trialSections.case_data.caseProgression.defendantUploadDocuments.trial.find(
      (document: { documentType: string; }) => document.documentType === 'DOCUMENTARY',
    ).selected = true;

    const form = new UploadDocumentsUserForm();
    form.trialDocumentary = getMockSectionArray(EvidenceUploadDisclosure.DISCLOSURE_LIST);
    const genericForm = new GenericForm<UploadDocumentsUserForm>(form);
    genericForm.validateSync();

    //when
    const actualTrialContent = getTrialContent(trialSections.case_data, genericForm,false);

    //Then
    expect(actualTrialContent[0].length).toEqual(2);
  });

  it('should return no section if nothing selected', () => {
    //when
    const actualTrialContent = getTrialContent(trialSections.case_data, null,false);

    //Then
    expect(actualTrialContent.length).toEqual(0);
  });

  it('should return no section if documentType not present', () => {
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
            trial: [],
          },
        },
      },
    };

    //when
    const actualTrialContent = getTrialContent(testClaim.case_data, null,false);

    //Then
    expect(actualTrialContent.length).toEqual(0);
  });

  it('should return no section if defendantUploadDocuments not present', () => {
    //Given
    const mockClaim = require('../../../../utils/mocks/civilClaimResponseMock.json');
    const testClaim = {
      ...mockClaim,
      state: CaseState.AWAITING_APPLICANT_INTENTION,
      case_data: {
        ...mockClaim.case_data,
        isClaimant: jest.fn(),
        caseProgression: {},
      },
    };

    //when
    const actualTrialContent = getTrialContent(testClaim.case_data, null,false);

    //Then
    expect(actualTrialContent.length).toEqual(0);
  });

  it('should return no section if defendantUploadDocuments not present on claimant request', () => {
    //Given
    const mockClaim = require('../../../../utils/mocks/civilClaimResponseMock.json');
    const testClaim = {
      ...mockClaim,
      state: CaseState.AWAITING_APPLICANT_INTENTION,
      case_data: {
        ...mockClaim.case_data,
        isClaimant: jest.fn(() => true),
        caseProgression: {},
      },
    };

    //when
    const actualTrialContent = getTrialContent(testClaim.case_data, null,false);

    //Then
    expect(actualTrialContent.length).toEqual(0);
  });

  it('should return no section if caseProgression not present', () => {
    //Given
    const mockClaim = require('../../../../utils/mocks/civilClaimantIntentionMock.json');
    const testClaim = {
      ...mockClaim,
      state: CaseState.AWAITING_APPLICANT_INTENTION,
      case_data: {
        ...mockClaim.case_data,
        isClaimant: jest.fn(),
      },
    };

    //when
    const actualTrialContent = getTrialContent(testClaim.case_data, null,false);

    //Then
    expect(actualTrialContent.length).toEqual(0);
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

    //when
    const actualTrialContent = getTrialContent(testClaim.case_data, null,false);

    //Then
    expect(actualTrialContent.length).toEqual(0);
  });

  it('should return sections for Small Claims in the correct order, if both selected', () => {
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
            trial: [
              {documentType: 'CASE_SUMMARY', selected: false},
              {documentType: 'SKELETON', selected: false},
              {documentType: 'LEGAL', selected: true},
              {documentType: 'COSTS', selected: false},
              {documentType: 'DOCUMENTARY', selected: true},
            ],
          },
        },
      },
    };

    //when
    const actualTrialContent = getTrialContent(testClaim.case_data, null,true);

    //Then
    expect(actualTrialContent.length).toEqual(2);

    expect(actualTrialContent[0][0].contentSections.length).toEqual(4);
    expect(actualTrialContent[1][0].contentSections.length).toEqual(2);

    expect(actualTrialContent[0][0].contentSections[0].data.text).toEqual('PAGES.UPLOAD_DOCUMENTS.HEARING.DOCUMENTARY');
    expect(actualTrialContent[1][0].contentSections[0].data.text).toEqual('PAGES.UPLOAD_DOCUMENTS.TRIAL.LEGAL');
  });
});
