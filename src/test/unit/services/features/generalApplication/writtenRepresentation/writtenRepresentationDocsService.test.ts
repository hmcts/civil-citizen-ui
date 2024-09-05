import { Claim } from 'models/claim';
import { UploadGAFiles } from 'models/generalApplication/uploadGAFiles';
import { CaseDocument } from 'models/document/caseDocument';
import { GeneralApplication } from 'models/generalApplication/GeneralApplication';
import { summarySection } from 'models/summaryList/summarySections';
import { FileUpload } from 'models/caseProgression/fileUpload';
import * as draftService from 'modules/draft-store/draftStoreService';
import * as draftServiceGA from 'modules/draft-store/draftGADocumentService';
import { getSummaryList, buildSummarySection } from 'services/features/generalApplication/writtenRepresentation/writtenRepresentationDocsService';
import { GA_UPLOAD_WRITTEN_REPRESENTATION_DOCS_URL } from 'routes/urls';
import { constructResponseUrlWithIdAndAppIdParams } from 'common/utils/urlFormatter';
import * as generalApplicationResponseStoreService from 'services/features/generalApplication/response/generalApplicationResponseStoreService';
import {GaResponse} from 'models/generalApplication/response/gaResponse';

jest.mock('../../../../../../main/modules/draft-store');
jest.mock('../../../../../../main/modules/draft-store/draftStoreService');
jest.mock('../../../../../../main/app/auth/launchdarkly/launchDarklyClient');
jest.mock('../../../../../../main/modules/draft-store/draftGADocumentService');
jest.mock('../../../../../../main/services/features/generalApplication/response/generalApplicationResponseStoreService');

describe('Upload Evidence Document service', () => {
  const mockDataFromStore = jest.spyOn(draftService, 'getCaseDataFromStore');
  const mockGADocDataFromStore = jest.spyOn(draftServiceGA, 'getGADocumentsFromDraftStore');
  const mockGADocResponseStoreService = jest.spyOn(generalApplicationResponseStoreService, 'getDraftGARespondentResponse');
  let uploadDocuments: UploadGAFiles[];
  beforeEach(() => {
    const claim = new Claim();
    claim.id = 'id';
    claim.generalApplication = new GeneralApplication();
    mockDataFromStore.mockResolvedValue(claim);
    const response = new GaResponse();
    response.writtenRepText = 'written Rep Text';
    mockGADocResponseStoreService.mockResolvedValue(response);
    uploadDocuments = [
      {
        caseDocument: {
          documentName: 'Additional information1',
          createdBy: 'Applicant',
          documentLink: {
            document_url: 'http://dm-store:8080/documents/95de9948-e563-4692-a642-5cdd5b2a1046',
            document_binary_url: 'http://dm-store:8080/documents/95de9948-e563-4692-a642-5cdd5b2a1046',
            document_filename: 'filename1',
          },
          documentType: null,
          documentSize: 123,
        } as CaseDocument,
        fileUpload: {} as FileUpload,
      },
      {
        caseDocument: {
          documentName: 'Additional information2',
          createdBy: 'Applicant',
          documentLink: {
            document_url: 'http://dm-store:8080/documents/95de9948-e563-4692-a642-5cdd5b2a1047',
            document_binary_url: 'http://dm-store:8080/documents/95de9948-e563-4692-a642-5cdd5b2a1047',
            document_filename: 'filename2',
          },
          documentType: null,
          documentSize: 1223,
        } as CaseDocument,
        fileUpload: {} as FileUpload,
      },
    ];
    mockGADocDataFromStore.mockResolvedValue(uploadDocuments);
  });

  describe('Get SummaryList', () => {
    it('should get Summary List when has content', async () => {
      //Given
      const mockSaveDocument = draftServiceGA.saveGADocumentsInDraftStore as jest.Mock;
      mockSaveDocument.mockResolvedValue(() => { return uploadDocuments; });
      const formattedSummary = summarySection(
        {
          title: '',
          summaryRows: [],
        });
      //When
      await getSummaryList(formattedSummary, 'redis-key', constructResponseUrlWithIdAndAppIdParams('123', '1', GA_UPLOAD_WRITTEN_REPRESENTATION_DOCS_URL));
      //Then
      expect(formattedSummary.summaryList.rows[0].key.text).toEqual('Additional information1');
      expect(formattedSummary.summaryList.rows[0].actions.items[0].href).toEqual('/case/123/general-application/1/upload-written-representation-docs?id=1');
      expect(formattedSummary.summaryList.rows[0].actions.items[0].text).toEqual('Remove document');
      expect(formattedSummary.summaryList.rows[1].key.text).toEqual('Additional information2');
      expect(formattedSummary.summaryList.rows[1].actions.items[0].href).toEqual('/case/123/general-application/1/upload-written-representation-docs?id=2');
      expect(formattedSummary.summaryList.rows[1].actions.items[0].text).toEqual('Remove document');
    });

    describe('Build summary Section ', () => {
      it('Should build the summary section: ', () => {

        const result = buildSummarySection('written Rep Text', uploadDocuments, '1', '123', 'en');
        expect(result).toHaveLength(2);
        expect(result[0].value.html).toContain('written Rep Text');
        expect(result[1].value.html).toContain('<ul class="no-list-style"><li>Additional information1</li><li>Additional information2</li></ul>');
        expect(result[1].actions.items[0].href).toContain('/case/1/general-application/123/upload-written-representation-docs');
      });
    });
  });
});
