import {CivilServiceClient} from 'client/civilServiceClient';
import {AppRequest} from 'models/AppRequest';
import {
  deleteRemovedGADocuments,
  getDeleteFileIndex,
} from 'services/features/generalApplication/documentUpload/deleteUploadedGADocuments';

const uploadedDocument = (id: string) => ({
  caseDocument: {documentLink: {document_url: `http://dm-store/documents/${id}`}},
});

describe('deleteUploadedGADocuments', () => {
  afterEach(() => jest.restoreAllMocks());

  describe('getDeleteFileIndex', () => {
    it('should return the index of a delete file action', () => {
      expect(getDeleteFileIndex('deleteFile[0]')).toBe(0);
      expect(getDeleteFileIndex('deleteFile[12]')).toBe(12);
    });

    it('should return undefined for any other action', () => {
      expect(getDeleteFileIndex('uploadButton')).toBeUndefined();
      expect(getDeleteFileIndex('deleteFile[-1]')).toBeUndefined();
      expect(getDeleteFileIndex('deleteFile[a]')).toBeUndefined();
      expect(getDeleteFileIndex(['deleteFile[0]'])).toBeUndefined();
      expect(getDeleteFileIndex(undefined)).toBeUndefined();
    });
  });

  describe('deleteRemovedGADocuments', () => {
    it('should delete the removed document from document management', async () => {
      const deleteDocument = jest.spyOn(CivilServiceClient.prototype, 'deleteDocument').mockResolvedValue(undefined);
      const req = {} as AppRequest;

      await deleteRemovedGADocuments(req, [uploadedDocument('a')], [uploadedDocument('b')], 'testLogger');

      expect(deleteDocument).toHaveBeenCalledTimes(1);
      expect(deleteDocument).toHaveBeenCalledWith(req, 'a');
    });

    it('should not delete a document that is still in the remaining list', async () => {
      const deleteDocument = jest.spyOn(CivilServiceClient.prototype, 'deleteDocument').mockResolvedValue(undefined);

      await deleteRemovedGADocuments({} as AppRequest, [uploadedDocument('a')], [uploadedDocument('a')], 'testLogger');

      expect(deleteDocument).not.toHaveBeenCalled();
    });

    it('should not throw when document management refuses the delete', async () => {
      jest.spyOn(CivilServiceClient.prototype, 'deleteDocument').mockRejectedValue(new Error('403'));

      await expect(deleteRemovedGADocuments({} as AppRequest, [uploadedDocument('a')], [], 'testLogger')).resolves.toBeUndefined();
    });
  });
});
