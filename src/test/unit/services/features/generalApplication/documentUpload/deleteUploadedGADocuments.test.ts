import {CivilServiceClient} from 'client/civilServiceClient';
import {AppRequest} from 'models/AppRequest';
import {
  deleteRemovedGADocuments,
  documentIdOf,
  getDeleteFileTarget,
  isDeleteFileTargetFor,
  withDocumentId,
} from 'services/features/generalApplication/documentUpload/deleteUploadedGADocuments';

const uploadedDocument = (id: string) => ({
  caseDocument: {documentLink: {document_url: `http://dm-store/documents/${id}`}},
});

describe('deleteUploadedGADocuments', () => {
  afterEach(() => jest.restoreAllMocks());

  describe('getDeleteFileTarget', () => {
    it('should return the index and document id of a delete file action', () => {
      expect(getDeleteFileTarget('deleteFile[0][abc-123]')).toEqual({index: 0, documentId: 'abc-123'});
      expect(getDeleteFileTarget('deleteFile[12][def]')).toEqual({index: 12, documentId: 'def'});
    });

    it('should return undefined for any other action', () => {
      expect(getDeleteFileTarget('uploadButton')).toBeUndefined();
      expect(getDeleteFileTarget('deleteFile[0]')).toBeUndefined();
      expect(getDeleteFileTarget('deleteFile[0][]')).toBeUndefined();
      expect(getDeleteFileTarget('deleteFile[-1][abc]')).toBeUndefined();
      expect(getDeleteFileTarget('deleteFile[a][abc]')).toBeUndefined();
      expect(getDeleteFileTarget(['deleteFile[0][abc]'])).toBeUndefined();
      expect(getDeleteFileTarget(undefined)).toBeUndefined();
    });
  });

  describe('documentIdOf', () => {
    it('should return the last part of the document url', () => {
      expect(documentIdOf(uploadedDocument('abc-123'))).toBe('abc-123');
    });

    it('should return undefined when there is no document url', () => {
      expect(documentIdOf(undefined)).toBeUndefined();
      expect(documentIdOf({caseDocument: {}})).toBeUndefined();
    });
  });

  describe('isDeleteFileTargetFor', () => {
    it('should match only the document with the target id', () => {
      expect(isDeleteFileTargetFor(uploadedDocument('a'), {index: 0, documentId: 'a'})).toBe(true);
      expect(isDeleteFileTargetFor(uploadedDocument('b'), {index: 0, documentId: 'a'})).toBe(false);
      expect(isDeleteFileTargetFor(undefined, {index: 0, documentId: 'a'})).toBe(false);
    });
  });

  describe('withDocumentId', () => {
    it('should add the document id to the summary row', () => {
      const row = {key: {text: 'file.pdf'}, value: {}};

      expect(withDocumentId(row, uploadedDocument('a'))).toEqual({...row, documentId: 'a'});
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
