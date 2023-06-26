import {getTrialContent} from 'services/features/caseProgression/trialService';
import {CaseState} from 'form/models/claimDetails';
import {TypeOfDocumentSection, UploadDocumentsUserForm} from 'models/caseProgression/uploadDocumentsUserForm';
import {GenericForm} from 'form/models/genericForm';

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
    const actualDisclosureContent = getTrialContent(testClaim.case_data, null);

    //Then
    expect(actualDisclosureContent.length).toEqual(5);

    expect(actualDisclosureContent[0][0].contentSections.length).toEqual(2);
    expect(actualDisclosureContent[1][0].contentSections.length).toEqual(2);
    expect(actualDisclosureContent[2][0].contentSections.length).toEqual(2);
    expect(actualDisclosureContent[3][0].contentSections.length).toEqual(2);
    expect(actualDisclosureContent[4][0].contentSections.length).toEqual(4);

    expect(actualDisclosureContent[0][0].contentSections[0].data.text).toEqual('PAGES.UPLOAD_DOCUMENTS.TRIAL.CASE_SUMMARY');
    expect(actualDisclosureContent[1][0].contentSections[0].data.text).toEqual('PAGES.UPLOAD_DOCUMENTS.TRIAL.SKELETON');
    expect(actualDisclosureContent[2][0].contentSections[0].data.text).toEqual('PAGES.UPLOAD_DOCUMENTS.TRIAL.LEGAL');
    expect(actualDisclosureContent[3][0].contentSections[0].data.text).toEqual('PAGES.UPLOAD_DOCUMENTS.TRIAL.COSTS');
    expect(actualDisclosureContent[4][0].contentSections[0].data.text).toEqual('PAGES.UPLOAD_DOCUMENTS.TRIAL.DOCUMENTARY');
  });

  it('should return section 1 if selected', () => {
    //Given
    trialSections.case_data.caseProgression.defendantUploadDocuments.trial.find(
      (document: { documentType: string; }) => document.documentType === 'CASE_SUMMARY',
    ).selected = true;

    //when
    const actualDisclosureContent = getTrialContent(trialSections.case_data, null);

    //Then
    expect(actualDisclosureContent.length).toEqual(1);

    expect(actualDisclosureContent[0][0].contentSections.length).toEqual(2);

    expect(actualDisclosureContent[0][0].contentSections[0].data.text).toEqual('PAGES.UPLOAD_DOCUMENTS.TRIAL.CASE_SUMMARY');
  });

  it('should return multiple of section 1 if selected', () => {
    //Given
    trialSections.case_data.caseProgression.defendantUploadDocuments.trial.find(
      (document: { documentType: string; }) => document.documentType === 'CASE_SUMMARY',
    ).selected = true;

    const form = new UploadDocumentsUserForm();
    form.trialCaseSummary = getMockSectionArray();
    const genericForm = new GenericForm<UploadDocumentsUserForm>(form);
    genericForm.validateSync();

    //when
    const actualDisclosureContent = getTrialContent(trialSections.case_data, genericForm);

    //Then
    expect(actualDisclosureContent[0].length).toEqual(2);
  });

  it('should return section 2 if selected', () => {
    //Given
    trialSections.case_data.caseProgression.defendantUploadDocuments.trial.find(
      (document: { documentType: string; }) => document.documentType === 'SKELETON',
    ).selected = true;

    //when
    const actualDisclosureContent = getTrialContent(trialSections.case_data, null);

    //Then
    expect(actualDisclosureContent.length).toEqual(1);

    expect(actualDisclosureContent[0][0].contentSections.length).toEqual(2);

    expect(actualDisclosureContent[0][0].contentSections[0].data.text).toEqual('PAGES.UPLOAD_DOCUMENTS.TRIAL.SKELETON');
  });

  it('should return multiple of section 2 if selected', () => {
    //Given
    trialSections.case_data.caseProgression.defendantUploadDocuments.trial.find(
      (document: { documentType: string; }) => document.documentType === 'SKELETON',
    ).selected = true;

    const form = new UploadDocumentsUserForm();
    form.trialSkeletonArgument = getMockSectionArray();
    const genericForm = new GenericForm<UploadDocumentsUserForm>(form);
    genericForm.validateSync();

    //when
    const actualDisclosureContent = getTrialContent(trialSections.case_data, genericForm);

    //Then
    expect(actualDisclosureContent[0].length).toEqual(2);
  });

  it('should return section 3 if selected', () => {
    //Given
    trialSections.case_data.caseProgression.defendantUploadDocuments.trial.find(
      (document: { documentType: string; }) => document.documentType === 'LEGAL',
    ).selected = true;

    //when
    const actualDisclosureContent = getTrialContent(trialSections.case_data, null);

    //Then
    expect(actualDisclosureContent.length).toEqual(1);

    expect(actualDisclosureContent[0][0].contentSections.length).toEqual(2);

    expect(actualDisclosureContent[0][0].contentSections[0].data.text).toEqual('PAGES.UPLOAD_DOCUMENTS.TRIAL.LEGAL');
  });

  it('should return multiple of section 3 if selected', () => {
    //Given
    trialSections.case_data.caseProgression.defendantUploadDocuments.trial.find(
      (document: { documentType: string; }) => document.documentType === 'LEGAL',
    ).selected = true;

    const form = new UploadDocumentsUserForm();
    form.trialAuthorities = getMockSectionArray();
    const genericForm = new GenericForm<UploadDocumentsUserForm>(form);
    genericForm.validateSync();

    //when
    const actualDisclosureContent = getTrialContent(trialSections.case_data, genericForm);

    //Then
    expect(actualDisclosureContent[0].length).toEqual(2);
  });

  it('should return section 4 if selected', () => {
    //Given
    trialSections.case_data.caseProgression.defendantUploadDocuments.trial.find(
      (document: { documentType: string; }) => document.documentType === 'COSTS',
    ).selected = true;

    //when
    const actualDisclosureContent = getTrialContent(trialSections.case_data, null);

    //Then
    expect(actualDisclosureContent.length).toEqual(1);

    expect(actualDisclosureContent[0][0].contentSections.length).toEqual(2);

    expect(actualDisclosureContent[0][0].contentSections[0].data.text).toEqual('PAGES.UPLOAD_DOCUMENTS.TRIAL.COSTS');
  });

  it('should return multiple of section 4 if selected', () => {
    //Given
    trialSections.case_data.caseProgression.defendantUploadDocuments.trial.find(
      (document: { documentType: string; }) => document.documentType === 'COSTS',
    ).selected = true;

    const form = new UploadDocumentsUserForm();
    form.trialCosts = getMockSectionArray();
    const genericForm = new GenericForm<UploadDocumentsUserForm>(form);
    genericForm.validateSync();

    //when
    const actualDisclosureContent = getTrialContent(trialSections.case_data, genericForm);

    //Then
    expect(actualDisclosureContent[0].length).toEqual(2);
  });

  it('should return section 5 if selected', () => {
    //Given
    trialSections.case_data.caseProgression.defendantUploadDocuments.trial.find(
      (document: { documentType: string; }) => document.documentType === 'DOCUMENTARY',
    ).selected = true;

    //when
    const actualDisclosureContent = getTrialContent(trialSections.case_data, null);

    //Then
    expect(actualDisclosureContent.length).toEqual(1);

    expect(actualDisclosureContent[0][0].contentSections.length).toEqual(4);

    expect(actualDisclosureContent[0][0].contentSections[0].data.text).toEqual('PAGES.UPLOAD_DOCUMENTS.TRIAL.DOCUMENTARY');
  });

  it('should return multiple of section 5 if selected', () => {
    //Given
    trialSections.case_data.caseProgression.defendantUploadDocuments.trial.find(
      (document: { documentType: string; }) => document.documentType === 'DOCUMENTARY',
    ).selected = true;

    const form = new UploadDocumentsUserForm();
    form.trialDocumentary = getMockSectionArray();
    const genericForm = new GenericForm<UploadDocumentsUserForm>(form);
    genericForm.validateSync();

    //when
    const actualDisclosureContent = getTrialContent(trialSections.case_data, genericForm);

    //Then
    expect(actualDisclosureContent[0].length).toEqual(2);
  });

  it('should return no section if nothing selected', () => {
    //when
    const actualDisclosureContent = getTrialContent(trialSections.case_data, null);

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
    const actualDisclosureContent = getTrialContent(testClaim.case_data, null);

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
    const actualDisclosureContent = getTrialContent(testClaim.case_data, null);

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
    const actualDisclosureContent = getTrialContent(testClaim.case_data, null);

    //Then
    expect(actualDisclosureContent.length).toEqual(0);
  });
});

const getMockSectionArray = () => {
  const sectionArray: TypeOfDocumentSection[] = [];
  sectionArray.push(new TypeOfDocumentSection('12', '12', '2022'));
  sectionArray.push(new TypeOfDocumentSection('12', '12', '2022'));
  return sectionArray;
};
