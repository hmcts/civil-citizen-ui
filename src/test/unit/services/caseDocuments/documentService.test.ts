import {getCaseDataFromStore} from 'modules/draft-store/draftStoreService';
import {Claim} from 'models/claim';
import {ClaimDetails} from 'form/models/claim/details/claimDetails';
import {DocumentType} from 'models/document/documentType';
import {saveDocumentsToExistingClaim} from 'services/caseDocuments/documentService';
jest.mock('../../../../main/modules/draft-store');
jest.mock('../../../../main/modules/draft-store/draftStoreService');

const mockGetClaim = getCaseDataFromStore as jest.Mock;

describe('Document service saveDocumentsToExistingClaim', () => {
  it('should save system generated documents to existing claim', async () => {
    //Given
    const claim = new Claim();
    claim.claimDetails = new ClaimDetails();
    mockGetClaim.mockImplementation(() => {
      return claim;
    });
    const claimFromCCD = new Claim();
    claimFromCCD.claimDetails = new ClaimDetails();
    claimFromCCD.systemGeneratedCaseDocuments = [{
      id: '1234',
      value: {
        createdBy: 'some one',
        documentLink: {
          document_url: 'url',
          document_filename: 'filename',
          document_binary_url: 'binary_url',
        },
        documentName: 'some name',
        documentType: DocumentType.DEFENDANT_DEFENCE,
        documentSize: 123,
        createdDatetime: new Date(),
      },
    }];
    //When
    await saveDocumentsToExistingClaim('123', claimFromCCD);
    //Then
    expect(claim.systemGeneratedCaseDocuments).not.toBeUndefined();
  });
});

