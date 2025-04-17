import {AppRequest} from 'models/AppRequest';
import {CaseDocument} from 'models/document/caseDocument';
import {CivilServiceClient} from 'client/civilServiceClient';
import {TypeOfDocumentSectionMapper} from 'services/features/caseProgression/TypeOfDocumentSectionMapper';
import {UploadQMAdditionalFile} from 'models/queryManagement/createQuery';
import * as draftStoreService from 'modules/draft-store/draftStoreService';
import {Claim} from 'models/claim';
import {QueryManagement} from 'form/models/queryManagement/queryManagement';
import * as utilityService from 'modules/utilityService';
import {removeSelectedDocument, uploadSelectedFile} from 'services/features/queryManagement/sendFollowUpQueryService';
import {SendFollowUpQuery} from 'models/queryManagement/sendFollowUpQuery';

jest.mock('../../../../../main/modules/i18n');
jest.mock('i18next', () => ({
  t: (i: string | unknown) => i,
  use: jest.fn(),
}));
jest.mock('../../../../../main/modules/draft-store/draftStoreService');
jest.mock('../../../../../main/modules/utilityService');

const mockGetClaimById = utilityService.getClaimById as jest.Mock;

  describe('Uploading files', () => {
    const appRequest: AppRequest = {
      params: {id: '1', appId: '89'},
    } as unknown as AppRequest;

    const returnedFile: CaseDocument = {
      createdBy: 'test',
      documentLink: {'document_binary_url': '', 'document_filename': '', 'document_url': ''},
      documentName: 'name',
      documentType: null,
      documentSize: 12345,
      createdDatetime: '2025-03-27T17:02:09.858Z' as unknown as Date,
    };

    beforeEach(() => {
      jest.resetAllMocks();
      const fileToUpload = {
        fieldname: 'test',
        originalname: 'test',
        mimetype: 'text/plain',
        size: 123,
        buffer: Buffer.from('test'),
      };
      jest.spyOn(CivilServiceClient.prototype, 'uploadDocument').mockResolvedValueOnce(returnedFile);
      jest.spyOn(TypeOfDocumentSectionMapper, 'mapToSingleFile').mockReturnValue(fileToUpload);
    });
    afterAll(() => {
      jest.clearAllMocks();
    });
    it('should return the form with updated summary rows and call save doc to redis', async () => {
      const createQuery = new SendFollowUpQuery();
      const saveSpy = jest.spyOn(draftStoreService, 'saveDraftClaim');
      jest.spyOn(draftStoreService, 'generateRedisKey').mockReturnValueOnce('123');

      mockGetClaimById.mockImplementation(async () => {
        return new Claim();
      });
      await uploadSelectedFile(appRequest, createQuery);
      expect(saveSpy).toHaveBeenCalled();
    });

    it('should return the form and not save doc if file has errors', async () => {
      const createQuery = new SendFollowUpQuery();
      const appRequest: AppRequest = {
        params: {id: '2', appId: '89'},
        session: {
          fileUpload: undefined,
        },
      } as unknown as AppRequest;
      jest.spyOn(TypeOfDocumentSectionMapper, 'mapToSingleFile').mockReturnValue(undefined);
      mockGetClaimById.mockImplementation(async () => {
        return new Claim();
      });
      const saveSpy = jest.spyOn(draftStoreService, 'saveDraftClaim');
      jest.spyOn(draftStoreService, 'generateRedisKey').mockReturnValueOnce('123');
      await uploadSelectedFile(appRequest, createQuery);
      expect(saveSpy).toBeCalled();
      expect(appRequest.session.fileUpload).toBeDefined();
    });

    it('should remove selected file and save the new list to redis', async () => {
      const claim = new Claim();
      claim.queryManagement = new QueryManagement();
      claim.queryManagement.sendFollowUpQuery = new SendFollowUpQuery();
      claim.queryManagement.sendFollowUpQuery.uploadedFiles = [{
        'caseDocument': {
          'createdBy': 'test',
          'createdDatetime': '2025-03-27T17:02:09.858Z',
          'documentLink': {
            'document_binary_url': '',
            'document_filename': '',
            'document_url': '',
          },
          'documentName': 'name',
          'documentSize': 12345,
          'documentType': null,
        },
        'fileUpload': {
          'buffer': {
            'data': [
              116,
              101,
              115,
              116,
            ],
            'type': 'Buffer',
          },
          'fieldname': 'test',
          'mimetype': 'text/plain',
          'originalname': 'test',
          'size': 123,
        },
      } as unknown as UploadQMAdditionalFile];
      mockGetClaimById.mockImplementation(async () => {
        return claim;
      });
      jest.spyOn(draftStoreService, 'generateRedisKey').mockReturnValueOnce('1234');
      const saveSpy = jest.spyOn(draftStoreService, 'saveDraftClaim');
      const appRequest: AppRequest = {
        params: {id: '1234', appId: '896'},
        session: {
          fileUpload: undefined,
        },
      } as unknown as AppRequest;
      await removeSelectedDocument(appRequest, 0);
      expect(claim.queryManagement.sendFollowUpQuery.uploadedFiles.length).toBe(0);
      expect(saveSpy).toBeCalledWith('1234', claim);
    });
  });
