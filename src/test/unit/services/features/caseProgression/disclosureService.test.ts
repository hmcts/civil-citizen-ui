import {getDisclosureContent} from 'services/features/caseProgression/disclosureService';
import {CaseState} from 'form/models/claimDetails';
import {
  FileSection,
  TypeOfDocumentSection,
  UploadDocumentsUserForm,
} from 'models/caseProgression/uploadDocumentsUserForm';
import {GenericForm} from 'form/models/genericForm';

describe('Disclosure service', () => {
  let mockClaim;
  let disclosureSections:any;

  beforeEach(() => {
    mockClaim = require('../../../../utils/mocks/civilClaimResponseMock.json');
    disclosureSections = {
      ...mockClaim,
      state: CaseState.AWAITING_APPLICANT_INTENTION,
      case_data: {
        ...mockClaim.case_data,
        caseProgression: {
          defendantUploadDocuments: {
            disclosure: [
              { documentType: 'DOCUMENTS_FOR_DISCLOSURE', selected: true },
              { documentType: 'DISCLOSURE_LIST', selected: true },
            ],
          },
        },
      },
    };
  });

  it('should return both disclosure document and disclosure list content', () => {
    //when
    const actualDisclosureContent = getDisclosureContent(disclosureSections.case_data, null);

    //Then
    expect(actualDisclosureContent.length).toEqual(2);
    expect(actualDisclosureContent[0][0].contentSections.length).toEqual(4);
    expect(actualDisclosureContent[0][0].contentSections[0].data.text).toEqual('PAGES.UPLOAD_DOCUMENTS.DISCLOSURE.DISCLOSURE_DOCUMENTS');
    expect(actualDisclosureContent[1][0].contentSections.length).toEqual(2);
    expect(actualDisclosureContent[1][0].contentSections[0].data.text).toEqual('PAGES.UPLOAD_DOCUMENTS.DISCLOSURE.DISCLOSURE_LIST');
  });

  it('should return only disclosure document', () => {
    //Given
    disclosureSections.case_data.caseProgression.defendantUploadDocuments.disclosure.find(
      (document: { documentType: string; }) => document.documentType === 'DISCLOSURE_LIST',
    ).selected = false;

    //when
    const actualDisclosureContent = getDisclosureContent(disclosureSections.case_data, null);

    //Then
    expect(actualDisclosureContent.length).toEqual(1);
    expect(actualDisclosureContent[0][0].contentSections.length).toEqual(4);
    expect(actualDisclosureContent[0][0].contentSections[0].data.text).toEqual('PAGES.UPLOAD_DOCUMENTS.DISCLOSURE.DISCLOSURE_DOCUMENTS');
  });

  it('should return multiple disclosure documents only', () => {
    const documentsForDisclosure: TypeOfDocumentSection[] = [];
    documentsForDisclosure.push(new TypeOfDocumentSection());
    documentsForDisclosure.push(new TypeOfDocumentSection());
    const form = new UploadDocumentsUserForm(documentsForDisclosure);
    const genericForm = new GenericForm<UploadDocumentsUserForm>(form);
    genericForm.validateSync();

    disclosureSections.case_data.caseProgression.defendantUploadDocuments.disclosure.find(
      (document: { documentType: string; }) => document.documentType === 'DISCLOSURE_LIST',
    ).selected = false;

    //when
    const actualDisclosureContent = getDisclosureContent(disclosureSections.case_data, genericForm);

    //Then
    expect(actualDisclosureContent[0].length).toEqual(2);
    expect(actualDisclosureContent[0][0].contentSections[1].data.classes).toEqual('govuk-form-group--error govuk-input--error');
  });

  it('should return only disclosure list content', () => {
    //Given
    disclosureSections.case_data.caseProgression.defendantUploadDocuments.disclosure.find(
      (document: { documentType: string; }) => document.documentType === 'DOCUMENTS_FOR_DISCLOSURE',
    ).selected = false;

    //when
    const actualDisclosureContent = getDisclosureContent(disclosureSections.case_data, null);

    //Then
    expect(actualDisclosureContent.length).toEqual(1);
    expect(actualDisclosureContent[0][0].contentSections.length).toEqual(2);
    expect(actualDisclosureContent[0][0].contentSections[0].data.text).toEqual('PAGES.UPLOAD_DOCUMENTS.DISCLOSURE.DISCLOSURE_LIST');
  });

  it('should return multiple disclosure list content only', () => {
    //Given
    const disclosureLists: FileSection[] = [];
    disclosureLists.push(new FileSection());
    disclosureLists.push(new FileSection());
    const form = new UploadDocumentsUserForm(null, disclosureLists);

    disclosureSections.case_data.caseProgression.defendantUploadDocuments.disclosure.find(
      (document: { documentType: string; }) => document.documentType === 'DOCUMENTS_FOR_DISCLOSURE',
    ).selected = false;

    //when
    const actualDisclosureContent = getDisclosureContent(disclosureSections.case_data,  new GenericForm<UploadDocumentsUserForm>(form));

    //Then
    expect(actualDisclosureContent.length).toEqual(1);
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
    const actualDisclosureContent = getDisclosureContent(testClaim.case_data, null);

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
    const actualDisclosureContent = getDisclosureContent(testClaim.case_data, null);

    //Then
    expect(actualDisclosureContent.length).toEqual(0);
  });
});
