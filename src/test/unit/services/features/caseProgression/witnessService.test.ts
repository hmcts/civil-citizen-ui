import {CaseState} from 'form/models/claimDetails';
import {getWitnessContent} from 'services/features/caseProgression/witnessService';
import {UploadDocumentsUserForm} from 'models/caseProgression/uploadDocumentsUserForm';
import {GenericForm} from 'form/models/genericForm';
import {
  getMockDocumentsReferredSectionArray,
  getMockWitnessSectionArray,
} from '../../../../utils/caseProgression/mockEvidenceUploadSections';
import {EvidenceUploadWitness} from 'models/document/documentType';

describe('Witness service', () => {
  let mockClaim;
  let witnessSection:any;

  beforeEach(() => {
    mockClaim = require('../../../../utils/mocks/civilClaimResponseMock.json');
    witnessSection = {
      ...mockClaim,
      state: CaseState.AWAITING_APPLICANT_INTENTION,
      case_data: {
        ...mockClaim.case_data,
        isClaimant: jest.fn(),
        caseProgression: {
          defendantUploadDocuments: {
            witness: [
              { documentType: 'WITNESS_STATEMENT', selected: false },
              { documentType: 'WITNESS_SUMMARY', selected: false },
              { documentType: 'NOTICE_OF_INTENTION', selected: false },
              { documentType: 'DOCUMENTS_REFERRED', selected: false },
            ],
          },
        },
      },
    };
  });

  it('should return all witness content', () => {
    //Given
    const mockClaim = require('../../../../utils/mocks/civilClaimResponseMock.json');
    const testClaim = {
      ...mockClaim,
      state: CaseState.AWAITING_APPLICANT_INTENTION,
      case_data: {
        ...mockClaim.case_data,
        isClaimant: jest.fn(),
        caseProgression: {
          defendantUploadDocuments: {
            witness: [
              {documentType: 'WITNESS_STATEMENT', selected: true},
              {documentType: 'WITNESS_SUMMARY', selected: true},
              {documentType: 'NOTICE_OF_INTENTION', selected: true},
              {documentType: 'DOCUMENTS_REFERRED', selected: true},
            ],
          },
        },
      },
    };
    //when
    const actualContent = getWitnessContent(testClaim.case_data, null);

    //Then
    expect(actualContent.length).toEqual(4);
    expect(actualContent[0][0].contentSections[0].data.text).toEqual('PAGES.UPLOAD_DOCUMENTS.WITNESS.STATEMENT');
    expect(actualContent[1][0].contentSections[0].data.text).toEqual('PAGES.UPLOAD_DOCUMENTS.WITNESS.SUMMARY');
    expect(actualContent[2][0].contentSections[0].data.text).toEqual('PAGES.UPLOAD_DOCUMENTS.WITNESS.NOTICE');
    expect(actualContent[3][0].contentSections[0].data.text).toEqual('PAGES.UPLOAD_DOCUMENTS.WITNESS.DOCUMENT');
  });

  it('should return all witness content on claimant request', () => {
    //Given
    const mockClaim = require('../../../../utils/mocks/civilClaimResponseMock.json');
    const testClaim = {
      ...mockClaim,
      state: CaseState.AWAITING_APPLICANT_INTENTION,
      case_data: {
        ...mockClaim.case_data,
        isClaimant: jest.fn(() => true),
        caseProgression: {
          claimantUploadDocuments: {
            witness: [
              {documentType: 'WITNESS_STATEMENT', selected: true},
              {documentType: 'WITNESS_SUMMARY', selected: true},
              {documentType: 'NOTICE_OF_INTENTION', selected: true},
              {documentType: 'DOCUMENTS_REFERRED', selected: true},
            ],
          },
        },
      },
    };
    //when
    const actualContent = getWitnessContent(testClaim.case_data, null);

    //Then
    expect(actualContent.length).toEqual(4);
  });

  it('should return no witness content', () => {
    const actualContent = getWitnessContent(witnessSection.case_data, null);

    //Then
    expect(actualContent.length).toEqual(0);
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
    const actualWitnessContent = getWitnessContent(testClaim.case_data, null);

    //Then
    expect(actualWitnessContent.length).toEqual(0);
  });

  it('should return no section if claimantUploadDocuments not present on claimant request', () => {
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
    const actualWitnessContent = getWitnessContent(testClaim.case_data, null);

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
        isClaimant: jest.fn(),
      },
    };

    //when
    const actualContent = getWitnessContent(testClaim.case_data, null);

    //Then
    expect(actualContent.length).toEqual(0);
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
    const actualContent = getWitnessContent(testClaim.case_data, null);

    //Then
    expect(actualContent.length).toEqual(0);
  });

  it('should return multiple of section 1 if selected', () => {
    //Given
    witnessSection.case_data.caseProgression.defendantUploadDocuments.witness.find(
      (document: { documentType: string; }) => document.documentType === 'WITNESS_STATEMENT',
    ).selected = true;

    const form = new UploadDocumentsUserForm();
    form.witnessStatement = getMockWitnessSectionArray(EvidenceUploadWitness.DOCUMENTS_REFERRED);
    const genericForm = new GenericForm<UploadDocumentsUserForm>(form);
    genericForm.validateSync();

    //when
    const actualContent = getWitnessContent(witnessSection.case_data, genericForm);

    //Then
    expect(actualContent[0].length).toEqual(2);
  });

  it('should return multiple of section 2 if selected', () => {
    //Given
    witnessSection.case_data.caseProgression.defendantUploadDocuments.witness.find(
      (document: { documentType: string; }) => document.documentType === 'WITNESS_SUMMARY',
    ).selected = true;

    const form = new UploadDocumentsUserForm();
    form.witnessSummary = getMockWitnessSectionArray(EvidenceUploadWitness.DOCUMENTS_REFERRED);
    const genericForm = new GenericForm<UploadDocumentsUserForm>(form);
    genericForm.validateSync();

    //when
    const actualContent = getWitnessContent(witnessSection.case_data, genericForm);

    //Then
    expect(actualContent[0].length).toEqual(2);
  });

  it('should return multiple of section 3 if selected', () => {
    //Given
    witnessSection.case_data.caseProgression.defendantUploadDocuments.witness.find(
      (document: { documentType: string; }) => document.documentType === 'NOTICE_OF_INTENTION',
    ).selected = true;

    const form = new UploadDocumentsUserForm();
    form.noticeOfIntention = getMockWitnessSectionArray(EvidenceUploadWitness.DOCUMENTS_REFERRED);
    const genericForm = new GenericForm<UploadDocumentsUserForm>(form);
    genericForm.validateSync();

    //when
    const actualContent = getWitnessContent(witnessSection.case_data, genericForm);

    //Then
    expect(actualContent[0].length).toEqual(2);
  });

  it('should return multiple of section 4 if selected', () => {
    //Given
    witnessSection.case_data.caseProgression.defendantUploadDocuments.witness.find(
      (document: { documentType: string; }) => document.documentType === 'DOCUMENTS_REFERRED',
    ).selected = true;

    const form = new UploadDocumentsUserForm();
    form.documentsReferred = getMockDocumentsReferredSectionArray(EvidenceUploadWitness.DOCUMENTS_REFERRED);
    const genericForm = new GenericForm<UploadDocumentsUserForm>(form);
    genericForm.validateSync();

    //when
    const actualContent = getWitnessContent(witnessSection.case_data, genericForm);

    //Then
    expect(actualContent[0].length).toEqual(2);
  });

});
