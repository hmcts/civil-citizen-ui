import {Request, Response, NextFunction} from 'express';
import {
  createMulterUpload,
  createMulterErrorMiddleware,
  createMulterErrorMiddlewareForSingleField,
  createMulterErrorMiddlewareForMultipleFiles,
  MAX_FILES_PER_UPLOAD,
  createFileUploadError,
  getMulterErrorConstraint,
  extractCategoryAndIndex,
  extractCategorySectionAndFileIndex,
  createUploadOneFileError,
  uploadAndValidateFile,
  uploadFieldNameFor,
  normaliseCaseDocuments,
  migrateLegacyCaseDocuments,
  migrateLegacyCaseDocumentsOnForm,
  removeUploadedFile,
  removeUploadedFileForAction,
  viewableCaseDocuments,
  parseCaseDocuments,
  reportRejectedFiles,
  MAX_FILE_INPUTS_PER_FORM,
  collectDocumentUrls,
  deleteRemovedDocuments,
  savedDocumentUrlsInForm,
  deleteDocumentsRemovedFromForm,
} from 'common/utils/fileUploadUtils';
import {FILE_SIZE_LIMIT} from 'form/validators/isFileSize';
import {CaseDocument} from 'models/document/caseDocument';

jest.mock('multer', () => {
  const mockMulter: any = jest.fn(() => ({
    any: jest.fn(() => jest.fn()),
    single: jest.fn(() => (req: any, res: any, callback: any) => callback(null)),
  }));
  mockMulter.memoryStorage = jest.fn(() => ({}));
  return mockMulter;
});

jest.mock('class-validator', () => {
  const actual = jest.requireActual('class-validator');
  return {
    ...actual,
    Validator: jest.fn().mockImplementation(() => ({
      validateSync: jest.fn().mockReturnValue([]),
    })),
  };
});

jest.mock('services/features/caseProgression/TypeOfDocumentSectionMapper', () => ({
  TypeOfDocumentSectionMapper: {
    mapMulterFileToSingleFile: jest.fn().mockReturnValue({
      fieldname: 'test',
      originalname: 'test.pdf',
      mimetype: 'application/pdf',
      size: 1024,
      buffer: Buffer.from('x'),
    }),
  },
}));

describe('fileUploadUtils', () => {
  describe('createMulterUpload', () => {
    it('should create multer instance with default file size limit', () => {
      const multer = require('multer');
      createMulterUpload();

      expect(multer).toHaveBeenCalledWith({
        storage: {},
        limits: {
          fileSize: FILE_SIZE_LIMIT,
        },
      });
      expect(multer.memoryStorage).toHaveBeenCalledWith({
        limits: {
          fileSize: FILE_SIZE_LIMIT,
        },
      });
    });

    it('should create multer instance with custom file size limit', () => {
      const multer = require('multer');
      const customLimit = 50 * 1024 * 1024; // 50MB
      createMulterUpload(customLimit);

      expect(multer).toHaveBeenCalledWith({
        storage: {},
        limits: {
          fileSize: customLimit,
        },
      });
      expect(multer.memoryStorage).toHaveBeenCalledWith({
        limits: {
          fileSize: customLimit,
        },
      });
    });

    it('should limit the number of files when a maximum is given', () => {
      const multer = require('multer');
      createMulterUpload(FILE_SIZE_LIMIT, 3);

      expect(multer).toHaveBeenCalledWith({
        storage: {},
        limits: {
          fileSize: FILE_SIZE_LIMIT,
          files: 3,
        },
      });
    });
  });

  describe('createMulterErrorMiddleware', () => {
    let mockReq: Partial<Request>;
    let mockRes: Partial<Response>;
    let mockNext: NextFunction;
    let mockLogger: any;

    beforeEach(() => {
      mockLogger = {
        info: jest.fn(),
        error: jest.fn(),
      };
      jest.doMock('@hmcts/nodejs-logging', () => ({
        Logger: {
          getLogger: jest.fn(() => mockLogger),
        },
      }));

      mockReq = {
        params: {id: '123'},
        headers: {'content-type': 'multipart/form-data'},
        files: [],
      };
      mockRes = {};
      mockNext = jest.fn();
    });

    it('should call next when no multer error occurs', () => {
      const multer = require('multer');
      const mockMulterInstance = {
        any: jest.fn(() => (req: any, res: any, callback: any) => {
          callback(null);
        }),
      };
      multer.mockReturnValue(mockMulterInstance);

      const middleware = createMulterErrorMiddleware('testLogger');
      middleware(mockReq as Request, mockRes as Response, mockNext);

      expect(mockNext).toHaveBeenCalled();
      expect((mockReq as any).multerError).toBeUndefined();
    });

    it('should drop only the files whose magic bytes do not match their Content-Type', () => {
      const multer = require('multer');
      const validPdf = {
        fieldname: 'documentsReferred[0][fileUpload]',
        originalname: 'real.pdf',
        mimetype: 'application/pdf',
        size: 64,
        buffer: Buffer.from('%PDF-1.4 real pdf'),
      } as Express.Multer.File;
      mockReq.files = [{
        fieldname: 'witnessStatement[0][fileUpload]',
        originalname: 'spoofed.pdf',
        mimetype: 'application/pdf',
        size: 64,
        buffer: Buffer.from('not a pdf'),
      } as Express.Multer.File, validPdf];
      const mockMulterInstance = {
        any: jest.fn(() => (req: any, res: any, callback: any) => {
          callback(null);
        }),
      };
      multer.mockReturnValue(mockMulterInstance);

      const middleware = createMulterErrorMiddleware('testLogger');
      middleware(mockReq as Request, mockRes as Response, mockNext);

      expect((mockReq as any).multerError).toBeUndefined();
      expect((mockReq as any).rejectedFileFields).toEqual(['witnessStatement[0][fileUpload]']);
      expect(mockReq.files).toEqual([validPdf]);
      expect(mockNext).toHaveBeenCalled();
    });

    it('should set multerError on request when multer error occurs', () => {
      const multer = require('multer');
      const multerError = {
        code: 'LIMIT_FILE_SIZE',
        message: 'File too large',
        field: 'fileUpload',
      };
      const mockMulterInstance = {
        any: jest.fn(() => (req: any, res: any, callback: any) => {
          callback(multerError);
        }),
      };
      multer.mockReturnValue(mockMulterInstance);

      const middleware = createMulterErrorMiddleware('testLogger');
      middleware(mockReq as Request, mockRes as Response, mockNext);

      expect((mockReq as any).multerError).toEqual(multerError);
      expect(mockNext).toHaveBeenCalled();
    });

    it('should bound how many file inputs a form can send', () => {
      const multer = require('multer');
      multer.mockReturnValue({any: jest.fn(() => (req: any, res: any, callback: any) => callback(null))});

      createMulterErrorMiddleware('testLogger')(mockReq as Request, mockRes as Response, mockNext);

      expect(multer).toHaveBeenLastCalledWith(expect.objectContaining({
        limits: expect.objectContaining({files: MAX_FILE_INPUTS_PER_FORM}),
      }));
    });

    it('should reject the upload when more files are chosen than allowed', () => {
      const multer = require('multer');
      mockReq.files = Array.from({length: MAX_FILES_PER_UPLOAD + 1}, (_, index) => ({
        fieldname: 'witnessStatement[0][fileUpload]',
        originalname: `file-${index}.pdf`,
        mimetype: 'application/pdf',
        size: 16,
        buffer: Buffer.from('%PDF-1.4 file'),
      } as Express.Multer.File));
      multer.mockReturnValue({any: jest.fn(() => (req: any, res: any, callback: any) => callback(null))});

      createMulterErrorMiddleware('testLogger')(mockReq as Request, mockRes as Response, mockNext);

      expect((mockReq as any).multerError).toEqual(expect.objectContaining({code: 'LIMIT_FILE_COUNT'}));
      expect(mockReq.files).toBeUndefined();
      expect(mockNext).toHaveBeenCalled();
    });

    it('should accept the maximum number of files', () => {
      const multer = require('multer');
      mockReq.files = Array.from({length: MAX_FILES_PER_UPLOAD}, (_, index) => ({
        fieldname: 'witnessStatement[0][fileUpload]',
        originalname: `file-${index}.pdf`,
        mimetype: 'application/pdf',
        size: 16,
        buffer: Buffer.from('%PDF-1.4 file'),
      } as Express.Multer.File));
      multer.mockReturnValue({any: jest.fn(() => (req: any, res: any, callback: any) => callback(null))});

      createMulterErrorMiddleware('testLogger')(mockReq as Request, mockRes as Response, mockNext);

      expect((mockReq as any).multerError).toBeUndefined();
      expect(mockReq.files).toHaveLength(MAX_FILES_PER_UPLOAD);
    });

    const pdfsFor = (fieldname: string, count: number) => Array.from({length: count}, (_, index) => ({
      fieldname,
      originalname: `${fieldname}-${index}.pdf`,
      mimetype: 'application/pdf',
      size: 16,
      buffer: Buffer.from('%PDF-1.4 file'),
    } as Express.Multer.File));

    it('should not count files chosen in other sections towards the upload limit', () => {
      const multer = require('multer');
      mockReq.body = {action: 'witnessStatement[0][uploadButton]'};
      mockReq.files = [
        ...pdfsFor('witnessStatement[0][fileUpload]', 3),
        ...pdfsFor('documentsReferred[0][fileUpload]', MAX_FILES_PER_UPLOAD),
      ];
      multer.mockReturnValue({any: jest.fn(() => (req: any, res: any, callback: any) => callback(null))});

      createMulterErrorMiddleware('testLogger')(mockReq as Request, mockRes as Response, mockNext);

      expect((mockReq as any).multerError).toBeUndefined();
      expect(mockReq.files).toHaveLength(3 + MAX_FILES_PER_UPLOAD);
      expect(mockNext).toHaveBeenCalled();
    });

    it('should reject the upload when the section on the button has more files than allowed', () => {
      const multer = require('multer');
      mockReq.body = {action: 'witnessStatement[0][uploadButton]'};
      mockReq.files = [
        ...pdfsFor('witnessStatement[0][fileUpload]', MAX_FILES_PER_UPLOAD + 1),
        ...pdfsFor('documentsReferred[0][fileUpload]', 1),
      ];
      multer.mockReturnValue({any: jest.fn(() => (req: any, res: any, callback: any) => callback(null))});

      createMulterErrorMiddleware('testLogger')(mockReq as Request, mockRes as Response, mockNext);

      expect((mockReq as any).multerError).toEqual(expect.objectContaining({code: 'LIMIT_FILE_COUNT'}));
      expect(mockReq.files).toBeUndefined();
    });

    it('should count every file when the action is not an upload', () => {
      const multer = require('multer');
      mockReq.body = {action: 'witnessStatement[0][removeButton]'};
      mockReq.files = [
        ...pdfsFor('witnessStatement[0][fileUpload]', 1),
        ...pdfsFor('documentsReferred[0][fileUpload]', MAX_FILES_PER_UPLOAD),
      ];
      multer.mockReturnValue({any: jest.fn(() => (req: any, res: any, callback: any) => callback(null))});

      createMulterErrorMiddleware('testLogger')(mockReq as Request, mockRes as Response, mockNext);

      expect((mockReq as any).multerError).toEqual(expect.objectContaining({code: 'LIMIT_FILE_COUNT'}));
    });

    it('should use default logger name when not provided', () => {
      const multer = require('multer');
      const mockMulterInstance = {
        any: jest.fn(() => (req: any, res: any, callback: any) => {
          callback(null);
        }),
      };
      multer.mockReturnValue(mockMulterInstance);

      const middleware = createMulterErrorMiddleware();
      middleware(mockReq as Request, mockRes as Response, mockNext);

      expect(mockNext).toHaveBeenCalled();
    });
  });

  describe('createMulterErrorMiddlewareForSingleField', () => {
    let mockReq: Partial<Request>;
    let mockRes: Partial<Response>;
    let mockNext: NextFunction;

    beforeEach(() => {
      mockReq = {
        params: {id: '123'},
        headers: {'content-type': 'multipart/form-data'},
      };
      mockRes = {};
      mockNext = jest.fn();
    });

    it('should call next when no multer error occurs', () => {
      const multer = require('multer');
      const mockSingleMiddleware = jest.fn((req: any, res: any, callback: any) => callback(null));
      const mockMulterInstance = {
        any: jest.fn(),
        single: jest.fn(() => mockSingleMiddleware),
      };
      multer.mockReturnValue(mockMulterInstance);

      const middleware = createMulterErrorMiddlewareForSingleField('selectedFile', 'testLogger');
      middleware(mockReq as Request, mockRes as Response, mockNext);

      expect(mockNext).toHaveBeenCalled();
      expect((mockReq as any).multerError).toBeUndefined();
    });

    it('should reject spoofed Content-Type for single-field uploads', () => {
      const multer = require('multer');
      mockReq.file = {
        fieldname: 'selectedFile',
        originalname: 'spoofed.pdf',
        mimetype: 'application/pdf',
        size: 64,
        buffer: Buffer.from('not a pdf'),
      } as Express.Multer.File;
      const mockSingleMiddleware = jest.fn((req: any, res: any, callback: any) => callback(null));
      const mockMulterInstance = {
        any: jest.fn(),
        single: jest.fn(() => mockSingleMiddleware),
      };
      multer.mockReturnValue(mockMulterInstance);

      const middleware = createMulterErrorMiddlewareForSingleField('selectedFile', 'testLogger');
      middleware(mockReq as Request, mockRes as Response, mockNext);

      expect((mockReq as any).multerError).toEqual({
        code: 'LIMIT_UNEXPECTED_FILE',
        message: 'File content type is not allowed',
      });
      expect(mockReq.file).toBeUndefined();
      expect(mockNext).toHaveBeenCalled();
    });

    it('should set multerError on request when multer error occurs', () => {
      const multer = require('multer');
      const multerError = { code: 'LIMIT_FILE_SIZE', message: 'File too large', field: 'selectedFile' };
      const mockSingleMiddleware = jest.fn((req: any, res: any, callback: any) => callback(multerError));
      const mockMulterInstance = {
        any: jest.fn(),
        single: jest.fn(() => mockSingleMiddleware),
      };
      multer.mockReturnValue(mockMulterInstance);

      const middleware = createMulterErrorMiddlewareForSingleField('selectedFile', 'testLogger');
      middleware(mockReq as Request, mockRes as Response, mockNext);

      expect((mockReq as any).multerError).toEqual(multerError);
      expect(mockNext).toHaveBeenCalled();
    });
  });

  describe('createMulterErrorMiddlewareForMultipleFiles', () => {
    const pdfFile = (name: string, content: string) => ({
      fieldname: 'selectedFile',
      originalname: name,
      mimetype: 'application/pdf',
      size: content.length,
      buffer: Buffer.from(content),
    } as Express.Multer.File);
    let mockReq: Partial<Request>;
    let mockNext: NextFunction;
    let arrayFieldName: string;

    const mockMulterArray = (error: unknown = null) => {
      const multer = require('multer');
      multer.mockReturnValue({
        any: jest.fn(),
        array: jest.fn((fieldName: string) => {
          arrayFieldName = fieldName;
          return (req: any, res: any, callback: any) => callback(error);
        }),
      });
    };

    beforeEach(() => {
      mockReq = {headers: {'content-type': 'multipart/form-data'}};
      mockNext = jest.fn();
    });

    it('should keep every chosen file for the field', () => {
      mockReq.files = [pdfFile('first.pdf', '%PDF-1.4 first'), pdfFile('second.pdf', '%PDF-1.4 second')];
      mockMulterArray();

      createMulterErrorMiddlewareForMultipleFiles('selectedFile', 'testLogger')(mockReq as Request, {} as Response, mockNext);

      expect(arrayFieldName).toBe('selectedFile');
      expect(mockReq.files).toHaveLength(2);
      expect((mockReq as any).multerError).toBeUndefined();
      expect(mockNext).toHaveBeenCalled();
    });

    it('should reject the upload when any file has spoofed content', () => {
      mockReq.files = [pdfFile('real.pdf', '%PDF-1.4 real'), pdfFile('spoofed.pdf', 'not a pdf')];
      mockMulterArray();

      createMulterErrorMiddlewareForMultipleFiles('selectedFile', 'testLogger')(mockReq as Request, {} as Response, mockNext);

      expect((mockReq as any).multerError).toEqual({
        code: 'LIMIT_UNEXPECTED_FILE',
        message: 'File content type is not allowed',
      });
      expect(mockReq.files).toBeUndefined();
      expect(mockNext).toHaveBeenCalled();
    });

    it('should limit how many files can be sent at once', () => {
      const multer = require('multer');
      mockMulterArray();

      createMulterErrorMiddlewareForMultipleFiles('selectedFile', 'testLogger')(mockReq as Request, {} as Response, mockNext);

      expect(multer).toHaveBeenLastCalledWith(expect.objectContaining({
        limits: expect.objectContaining({files: MAX_FILES_PER_UPLOAD}),
      }));
    });

    it('should set multerError on request when multer error occurs', () => {
      const multerError = {code: 'LIMIT_FILE_SIZE', message: 'File too large', field: 'selectedFile'};
      mockMulterArray(multerError);

      createMulterErrorMiddlewareForMultipleFiles('selectedFile', 'testLogger')(mockReq as Request, {} as Response, mockNext);

      expect((mockReq as any).multerError).toEqual(multerError);
      expect(mockNext).toHaveBeenCalled();
    });
  });

  describe('createFileUploadError', () => {
    it('should create correct error structure', () => {
      const error = createFileUploadError('documentsReferred', 0, 'isAllowedMimeType', 'ERRORS.VALID_MIME_TYPE_FILE');

      expect(error).toEqual({
        property: 'documentsReferred',
        children: [{
          property: 0,
          children: [{
            property: 'fileUpload',
            constraints: {
              isAllowedMimeType: 'ERRORS.VALID_MIME_TYPE_FILE',
            },
          }],
        }],
      });
    });

    it('should handle string index', () => {
      const error = createFileUploadError('witnessStatement', '1', 'isFileSize', 'ERRORS.VALID_SIZE_FILE');

      expect(error).toEqual({
        property: 'witnessStatement',
        children: [{
          property: '1',
          children: [{
            property: 'fileUpload',
            constraints: {
              isFileSize: 'ERRORS.VALID_SIZE_FILE',
            },
          }],
        }],
      });
    });
  });

  describe('getMulterErrorConstraint', () => {
    it('should return VALID_SIZE_FILE for LIMIT_FILE_SIZE error', () => {
      const error = {code: 'LIMIT_FILE_SIZE'};
      const result = getMulterErrorConstraint(error);

      expect(result).toBe('ERRORS.VALID_SIZE_FILE');
    });

    it('should return TOO_MANY_FILES for LIMIT_FILE_COUNT error', () => {
      const error = {code: 'LIMIT_FILE_COUNT'};
      const result = getMulterErrorConstraint(error);

      expect(result).toBe('ERRORS.TOO_MANY_FILES');
    });

    it('should return VALID_MIME_TYPE_FILE for LIMIT_UNEXPECTED_FILE error', () => {
      const error = {code: 'LIMIT_UNEXPECTED_FILE'};
      const result = getMulterErrorConstraint(error);

      expect(result).toBe('ERRORS.VALID_MIME_TYPE_FILE');
    });

    it('should return VALID_MIME_TYPE_FILE when error has field property', () => {
      const error = {code: 'OTHER_ERROR', field: 'fileUpload'};
      const result = getMulterErrorConstraint(error);

      expect(result).toBe('ERRORS.VALID_MIME_TYPE_FILE');
    });

    it('should return FILE_UPLOAD_FAILED for unknown errors', () => {
      const error = {code: 'UNKNOWN_ERROR'};
      const result = getMulterErrorConstraint(error);

      expect(result).toBe('ERRORS.FILE_UPLOAD_FAILED');
    });

    it('should return FILE_UPLOAD_FAILED when error code is not LIMIT_FILE_SIZE or LIMIT_UNEXPECTED_FILE and no field property', () => {
      const error = {code: 'OTHER_ERROR_CODE'};
      const result = getMulterErrorConstraint(error);

      expect(result).toBe('ERRORS.FILE_UPLOAD_FAILED');
    });
  });

  describe('uploadFieldNameFor', () => {
    it('should return the file field for the section on the upload button', () => {
      expect(uploadFieldNameFor('witnessStatement[2][uploadButton]')).toBe('witnessStatement[2][fileUpload]');
    });
  });

  describe('extractCategoryAndIndex', () => {
    it('should extract category and index from submit action', () => {
      const [category, index] = extractCategoryAndIndex('documentsReferred[0][uploadButton]');

      expect(category).toBe('documentsReferred');
      expect(index).toBe('0');
    });

    it('should handle different category names', () => {
      const [category, index] = extractCategoryAndIndex('witnessStatement[1][uploadButton]');

      expect(category).toBe('witnessStatement');
      expect(index).toBe('1');
    });

    it('should handle expertReport category', () => {
      const [category, index] = extractCategoryAndIndex('expertReport[2][uploadButton]');

      expect(category).toBe('expertReport');
      expect(index).toBe('2');
    });
  });

  describe('extractCategorySectionAndFileIndex', () => {
    it('should extract category, section index and file index from a delete action', () => {
      const [category, index, fileIndex] = extractCategorySectionAndFileIndex('witnessStatement[0][deleteFile][1]');

      expect(category).toBe('witnessStatement');
      expect(index).toBe('0');
      expect(fileIndex).toBe('1');
    });
  });

  describe('normaliseCaseDocuments', () => {
    it('returns an empty array for undefined or null', () => {
      expect(normaliseCaseDocuments(undefined)).toEqual([]);
      expect(normaliseCaseDocuments(null)).toEqual([]);
    });

    it('wraps a single legacy value in an array', () => {
      const doc = {documentName: 'test.pdf'};
      expect(normaliseCaseDocuments(doc)).toEqual([doc]);
    });

    it('returns an existing array unchanged', () => {
      const docs = [{documentName: 'a.pdf'}, {documentName: 'b.pdf'}];
      expect(normaliseCaseDocuments(docs)).toBe(docs);
    });
  });

  describe('migrateLegacyCaseDocuments', () => {
    it('migrates a legacy single caseDocument onto caseDocuments', () => {
      const legacyDoc = {documentName: 'legacy.pdf'};
      const sections: any[] = [{caseDocument: legacyDoc}];

      migrateLegacyCaseDocuments(sections);

      expect(sections[0].caseDocuments).toEqual([legacyDoc]);
    });

    it('does not overwrite an already-populated caseDocuments array', () => {
      const newDoc = {documentName: 'new.pdf'};
      const legacyDoc = {documentName: 'legacy.pdf'};
      const sections: any[] = [{caseDocument: legacyDoc, caseDocuments: [newDoc]}];

      migrateLegacyCaseDocuments(sections);

      expect(sections[0].caseDocuments).toEqual([newDoc]);
    });

    it('leaves a section with no documents at all untouched', () => {
      const sections: any[] = [{}];

      migrateLegacyCaseDocuments(sections);

      expect(sections[0].caseDocuments).toBeUndefined();
    });

    it('does nothing when sections is undefined', () => {
      expect(() => migrateLegacyCaseDocuments(undefined)).not.toThrow();
    });
  });

  describe('migrateLegacyCaseDocumentsOnForm', () => {
    it('migrates every array field on the form', () => {
      const legacyWitnessDoc = {documentName: 'witness.pdf'};
      const legacyExpertDoc = {documentName: 'expert.pdf'};
      const form: Record<string, unknown> = {
        witnessStatement: [{caseDocument: legacyWitnessDoc}],
        expertReport: [{caseDocument: legacyExpertDoc}],
        notAnArrayField: 'ignored',
      };

      migrateLegacyCaseDocumentsOnForm(form);

      expect((form.witnessStatement as any[])[0].caseDocuments).toEqual([legacyWitnessDoc]);
      expect((form.expertReport as any[])[0].caseDocuments).toEqual([legacyExpertDoc]);
    });

    it('does nothing when form is undefined', () => {
      expect(() => migrateLegacyCaseDocumentsOnForm(undefined)).not.toThrow();
    });
  });

  describe('removeUploadedFile', () => {
    it('removes the file at the given index', () => {
      const categoryModel = [{caseDocuments: [{documentName: 'a.pdf'}, {documentName: 'b.pdf'}]}];

      const result = removeUploadedFile(categoryModel, '0', '0');

      expect(result).toBe(true);
      expect(categoryModel[0].caseDocuments).toEqual([{documentName: 'b.pdf'}]);
    });

    it('returns false when the section does not exist', () => {
      const categoryModel: any[] = [];

      expect(removeUploadedFile(categoryModel, '0', '0')).toBe(false);
    });

    it('returns false when the file index is out of range', () => {
      const categoryModel = [{caseDocuments: [{documentName: 'a.pdf'}]}];

      expect(removeUploadedFile(categoryModel, '0', '5')).toBe(false);
      expect(categoryModel[0].caseDocuments).toEqual([{documentName: 'a.pdf'}]);
    });

    it.each([undefined, '', 'abc', '-1', '1.5', ' 1'])('keeps every file when the file index is %p', (fileIndex) => {
      const categoryModel = [{caseDocuments: [{documentName: 'a.pdf'}, {documentName: 'b.pdf'}]}];

      expect(removeUploadedFile(categoryModel, '0', fileIndex)).toBe(false);
      expect(categoryModel[0].caseDocuments).toEqual([{documentName: 'a.pdf'}, {documentName: 'b.pdf'}]);
    });

    it.each([undefined, 'abc', '0.5'])('keeps every file when the section index is %p', (index) => {
      const categoryModel = [{caseDocuments: [{documentName: 'a.pdf'}]}];

      expect(removeUploadedFile(categoryModel, index, '0')).toBe(false);
      expect(categoryModel[0].caseDocuments).toEqual([{documentName: 'a.pdf'}]);
    });
  });

  describe('removeUploadedFileForAction', () => {
    it('removes the file named by the delete action', () => {
      const model = {witnessStatement: [{caseDocuments: [{documentName: 'a.pdf'}, {documentName: 'b.pdf'}]}]};

      expect(removeUploadedFileForAction(model, 'witnessStatement[0][deleteFile][1]')).toBe(true);
      expect(model.witnessStatement[0].caseDocuments).toEqual([{documentName: 'a.pdf'}]);
    });

    it('returns false when the category does not exist', () => {
      expect(removeUploadedFileForAction({}, 'witnessStatement[0][deleteFile][0]')).toBe(false);
    });

    it('keeps every file when the delete action has no file index', () => {
      const model = {witnessStatement: [{caseDocuments: [{documentName: 'a.pdf'}, {documentName: 'b.pdf'}]}]};

      expect(removeUploadedFileForAction(model, 'witnessStatement[0][deleteFile]')).toBe(false);
      expect(model.witnessStatement[0].caseDocuments).toHaveLength(2);
    });
  });

  describe('reportRejectedFiles', () => {
    it('adds a wrong file type error to each section with a rejected file', () => {
      const req = {rejectedFileFields: ['witnessStatement[0][fileUpload]', 'witnessStatement[0][fileUpload]', 'expertReport[2][fileUpload]']} as unknown as Request;
      const form: {errors?: any[]} = {};

      expect(reportRejectedFiles(req, form)).toBe(true);
      expect(form.errors).toEqual([
        createFileUploadError('witnessStatement', '0', 'multerError', 'ERRORS.VALID_MIME_TYPE_FILE'),
        createFileUploadError('expertReport', '2', 'multerError', 'ERRORS.VALID_MIME_TYPE_FILE'),
      ]);
    });

    it('reports nothing when no file was rejected', () => {
      const form: {errors?: any[]} = {};

      expect(reportRejectedFiles({} as Request, form)).toBe(false);
      expect(form.errors).toBeUndefined();
    });
  });

  describe('parseCaseDocuments', () => {
    const first = {documentName: 'a.pdf', documentLink: {document_binary_url: 'http://dm-store/a/binary'}};
    const second = {documentName: 'b.pdf', documentLink: {document_binary_url: 'http://dm-store/b/binary'}};

    it('parses a JSON list of case documents', () => {
      expect(parseCaseDocuments({caseDocuments: JSON.stringify([first, second])})).toEqual([first, second]);
    });

    it('wraps a single legacy case document', () => {
      expect(parseCaseDocuments({caseDocument: JSON.stringify(first)})).toEqual([first]);
    });

    it('falls back to the legacy case document when the list is empty', () => {
      expect(parseCaseDocuments({caseDocuments: '', caseDocument: JSON.stringify(first)})).toEqual([first]);
    });

    it('accepts case documents that are already parsed', () => {
      expect(parseCaseDocuments({caseDocuments: [first]})).toEqual([first]);
    });

    it('returns no case documents for malformed JSON', () => {
      expect(parseCaseDocuments({caseDocuments: '{not json'})).toEqual([]);
    });

    it('drops entries that are not case documents', () => {
      expect(parseCaseDocuments({caseDocuments: JSON.stringify([null, 'x', 1, first])})).toEqual([first]);
    });

    it('drops case documents without a document link', () => {
      expect(parseCaseDocuments({caseDocuments: JSON.stringify([{}, {documentName: 'c.pdf'}, {documentLink: {}}, second])})).toEqual([second]);
    });

    it('returns no case documents when there are none', () => {
      expect(parseCaseDocuments({})).toEqual([]);
      expect(parseCaseDocuments(undefined)).toEqual([]);
    });
  });

  describe('viewableCaseDocuments', () => {
    const viewable = {documentName: 'a.pdf', documentLink: {document_binary_url: 'http://dm-store/a/binary'}} as unknown as CaseDocument;
    const missingLink = {documentName: 'b.pdf'} as unknown as CaseDocument;

    it('keeps only documents that have a binary url', () => {
      expect(viewableCaseDocuments([viewable, missingLink])).toEqual([viewable]);
    });

    it('accepts a single legacy document', () => {
      expect(viewableCaseDocuments(viewable)).toEqual([viewable]);
    });

    it('returns an empty list when there are no documents', () => {
      expect(viewableCaseDocuments(undefined)).toEqual([]);
    });
  });

  describe('createUploadOneFileError', () => {
    it('should return correct error structure', () => {
      const error = createUploadOneFileError();

      expect(error).toEqual([{
        target: {
          fileUpload: '',
          typeOfDocument: '',
        },
        value: '',
        property: '',
        constraints: {
          isNotEmpty: 'ERRORS.GENERAL_APPLICATION.UPLOAD_ONE_FILE',
        },
      }]);
    });
  });

  describe('uploadAndValidateFile', () => {
    const mockReq = {
      files: [{ fieldname: 'documentsReferred[0][fileUpload]', originalname: 'test.pdf', mimetype: 'application/pdf', size: 1024, buffer: Buffer.from('x') }],
    } as any;
    const form = {
      model: { documentsReferred: [{ fileUpload: undefined as any, caseDocument: undefined as any }] },
      errors: [] as any[],
    };
    const mockUploadDocument = jest.fn();

    beforeEach(() => {
      form.model = { documentsReferred: [{ fileUpload: undefined as any, caseDocument: undefined as any }] };
      form.errors = [];
      mockUploadDocument.mockReset();
      const {Validator} = require('class-validator');
      Validator.mockImplementation(() => ({ validateSync: jest.fn().mockReturnValue([]) }));
      const {TypeOfDocumentSectionMapper} = require('services/features/caseProgression/TypeOfDocumentSectionMapper');
      TypeOfDocumentSectionMapper.mapMulterFileToSingleFile.mockReturnValue({ fieldname: 'test', originalname: 'test.pdf', mimetype: 'application/pdf', size: 1024, buffer: Buffer.from('x') });
    });

    it('should return early when no matching file in req.files', async () => {
      const reqNoFile = { files: [{ fieldname: 'other[0][fileUpload]' }] } as any;
      await uploadAndValidateFile(reqNoFile, 'documentsReferred[0][uploadButton]', form, { uploadDocument: mockUploadDocument });
      expect(form.errors).toHaveLength(0);
      expect(mockUploadDocument).not.toHaveBeenCalled();
    });

    it('should push validation error when validateSync returns errors', async () => {
      const {Validator} = require('class-validator');
      Validator.mockImplementation(() => ({
        validateSync: jest.fn().mockReturnValue([{ constraints: { isFileSize: 'ERRORS.VALID_SIZE_FILE' } }]),
      }));
      await uploadAndValidateFile(mockReq, 'documentsReferred[0][uploadButton]', form, { uploadDocument: mockUploadDocument });
      expect(form.errors).toHaveLength(1);
      expect(form.errors[0].property).toBe('documentsReferred');
      expect(form.errors[0].children[0].children[0].constraints.isFileSize).toBe('ERRORS.VALID_SIZE_FILE');
      expect(mockUploadDocument).not.toHaveBeenCalled();
    });

    it('should push uploadError when uploadDocument returns response without documentLink', async () => {
      mockUploadDocument.mockResolvedValue({});
      await uploadAndValidateFile(mockReq, 'documentsReferred[0][uploadButton]', form, { uploadDocument: mockUploadDocument });
      expect(form.errors).toHaveLength(1);
      const inner = form.errors[0].children?.[0]?.children?.[0];
      expect(inner?.constraints?.uploadError).toBe('ERRORS.FILE_UPLOAD_FAILED');
    });

    it('should push uploadError when uploadDocument throws', async () => {
      mockUploadDocument.mockRejectedValue(new Error('API error'));
      await uploadAndValidateFile(mockReq, 'documentsReferred[0][uploadButton]', form, { uploadDocument: mockUploadDocument });
      expect(form.errors).toHaveLength(1);
      const inner = form.errors[0].children?.[0]?.children?.[0];
      expect(inner?.constraints?.uploadError).toBe('ERRORS.FILE_UPLOAD_FAILED');
    });

    it('should push unexpectedError when mapMulterFileToSingleFile throws', async () => {
      const {TypeOfDocumentSectionMapper} = require('services/features/caseProgression/TypeOfDocumentSectionMapper');
      TypeOfDocumentSectionMapper.mapMulterFileToSingleFile.mockImplementation(() => {
        throw new Error('Mapping error');
      });
      await uploadAndValidateFile(mockReq, 'documentsReferred[0][uploadButton]', form, { uploadDocument: mockUploadDocument });
      expect(form.errors).toHaveLength(1);
      expect(form.errors[0].children[0].children[0].constraints.unexpectedError).toBe('ERRORS.FILE_UPLOAD_FAILED');
    });

    describe('when several files are selected for one upload control', () => {
      const reqWithFiles = (count: number) => ({
        files: [
          ...Array.from({length: count}, (_, i) => ({ fieldname: 'documentsReferred[0][fileUpload]', originalname: `file-${i}.pdf` })),
          { fieldname: 'witnessStatement[0][fileUpload]', originalname: 'other-section.pdf' },
        ],
      }) as any;
      const uploadedDocument = (name: string) => ({ documentLink: { document_filename: name } });
      const filenames = () => (form.model.documentsReferred[0] as any).caseDocuments.map((doc: any) => doc.documentLink.document_filename);

      it('uploads every file for that section and appends them to any already uploaded', async () => {
        (form.model.documentsReferred[0] as any).caseDocuments = [uploadedDocument('existing.pdf')];
        mockUploadDocument
          .mockResolvedValueOnce(uploadedDocument('file-0.pdf'))
          .mockResolvedValueOnce(uploadedDocument('file-1.pdf'))
          .mockResolvedValueOnce(uploadedDocument('file-2.pdf'));

        await uploadAndValidateFile(reqWithFiles(3), 'documentsReferred[0][uploadButton]', form, { uploadDocument: mockUploadDocument });

        expect(mockUploadDocument).toHaveBeenCalledTimes(3);
        expect(filenames()).toEqual(['existing.pdf', 'file-0.pdf', 'file-1.pdf', 'file-2.pdf']);
        expect(form.errors).toHaveLength(0);
        expect(form.model.documentsReferred[0].fileUpload).toBeUndefined();
      });

      it('still uploads the valid files when one of them fails validation', async () => {
        const {Validator} = require('class-validator');
        Validator.mockImplementation(() => ({
          validateSync: jest.fn()
            .mockReturnValueOnce([])
            .mockReturnValueOnce([{ constraints: { isFileSize: 'ERRORS.VALID_SIZE_FILE' } }])
            .mockReturnValueOnce([]),
        }));
        mockUploadDocument
          .mockResolvedValueOnce(uploadedDocument('file-0.pdf'))
          .mockResolvedValueOnce(uploadedDocument('file-2.pdf'));

        await uploadAndValidateFile(reqWithFiles(3), 'documentsReferred[0][uploadButton]', form, { uploadDocument: mockUploadDocument });

        expect(mockUploadDocument).toHaveBeenCalledTimes(2);
        expect(filenames()).toEqual(['file-0.pdf', 'file-2.pdf']);
        expect(form.errors).toHaveLength(1);
        expect(form.errors[0].children[0].children[0].constraints.isFileSize).toBe('ERRORS.VALID_SIZE_FILE');
      });

      it('shows a file type error when a file for this section was rejected for its content', async () => {
        const req = {...reqWithFiles(1), rejectedFileFields: ['documentsReferred[0][fileUpload]']};
        mockUploadDocument.mockResolvedValueOnce(uploadedDocument('file-0.pdf'));

        await uploadAndValidateFile(req, 'documentsReferred[0][uploadButton]', form, { uploadDocument: mockUploadDocument });

        expect(filenames()).toEqual(['file-0.pdf']);
        expect(form.errors).toHaveLength(1);
        expect(form.errors[0].children[0].children[0].constraints.multerError).toBe('ERRORS.VALID_MIME_TYPE_FILE');
      });

      it('shows a file type error when every file for this section was rejected for its content', async () => {
        const req = {files: [], rejectedFileFields: ['documentsReferred[0][fileUpload]']} as any;

        await uploadAndValidateFile(req, 'documentsReferred[0][uploadButton]', form, { uploadDocument: mockUploadDocument });

        expect(mockUploadDocument).not.toHaveBeenCalled();
        expect(form.errors).toHaveLength(1);
        expect(form.errors[0].children[0].children[0].constraints.multerError).toBe('ERRORS.VALID_MIME_TYPE_FILE');
      });

      it('reports only one error for the section when several files fail', async () => {
        mockUploadDocument.mockRejectedValue(new Error('API error'));

        await uploadAndValidateFile(reqWithFiles(2), 'documentsReferred[0][uploadButton]', form, { uploadDocument: mockUploadDocument });

        expect(mockUploadDocument).toHaveBeenCalledTimes(2);
        expect(form.errors).toHaveLength(1);
        expect(form.errors[0].children[0].children[0].constraints.uploadError).toBe('ERRORS.FILE_UPLOAD_FAILED');
      });
    });
  });

  describe('collectDocumentUrls', () => {
    it('should collect document urls from nested sections', () => {
      const draft = {
        witnessStatement: [{caseDocuments: [
          {documentLink: {document_url: 'http://dm/documents/a'}},
          {documentLink: {document_url: 'http://dm/documents/b'}},
        ]}],
        trialDocumentary: [{caseDocuments: [{documentLink: {document_url: 'http://dm/documents/c'}}]}],
      };
      expect([...collectDocumentUrls(draft)]).toEqual(['http://dm/documents/a', 'http://dm/documents/b', 'http://dm/documents/c']);
    });

    it('should return no urls for empty values', () => {
      expect(collectDocumentUrls(undefined).size).toBe(0);
      expect(collectDocumentUrls(null).size).toBe(0);
    });
  });

  describe('savedDocumentUrlsInForm', () => {
    const doc = (id: string) => ({documentLink: {document_url: `http://dm/documents/${id}`}});

    it('should keep only documents that are both saved and posted', () => {
      const saved = {witnessStatement: [{caseDocuments: [doc('a'), doc('b'), doc('added-elsewhere')]}]};
      const posted = {witnessStatement: [{caseDocuments: [doc('a'), doc('b'), doc('not-saved')]}]};

      expect([...savedDocumentUrlsInForm(saved, posted)]).toEqual(['http://dm/documents/a', 'http://dm/documents/b']);
    });
  });

  describe('deleteDocumentsRemovedFromForm', () => {
    const req = {} as Request;
    const doc = (id: string) => ({documentLink: {document_url: `http://dm/documents/${id}`}});

    it('should delete only candidates missing from the updated form', async () => {
      const client = {deleteDocument: jest.fn().mockResolvedValue(undefined)};
      const candidates = new Set(['http://dm/documents/a', 'http://dm/documents/b']);
      const updated = {witnessStatement: [{caseDocuments: [doc('b')]}]};

      await deleteDocumentsRemovedFromForm(req, candidates, updated, client);

      expect(client.deleteDocument).toHaveBeenCalledTimes(1);
      expect(client.deleteDocument).toHaveBeenCalledWith(req, 'a');
    });

    it('should delete nothing when there are no candidates', async () => {
      const client = {deleteDocument: jest.fn().mockResolvedValue(undefined)};

      await deleteDocumentsRemovedFromForm(req, new Set<string>(), {}, client);

      expect(client.deleteDocument).not.toHaveBeenCalled();
    });
  });

  describe('deleteRemovedDocuments', () => {
    const req = {} as Request;
    const doc = (id: string) => ({documentLink: {document_url: `http://dm/documents/${id}`}});

    it('should delete only documents removed from the saved draft', async () => {
      const client = {deleteDocument: jest.fn().mockResolvedValue(undefined)};
      const saved = {witnessStatement: [{caseDocuments: [doc('a'), doc('b')]}]};
      const updated = {witnessStatement: [{caseDocuments: [doc('b')]}]};

      await deleteRemovedDocuments(req, saved, updated, client);

      expect(client.deleteDocument).toHaveBeenCalledTimes(1);
      expect(client.deleteDocument).toHaveBeenCalledWith(req, 'a');
    });

    it('should delete every document of a removed section', async () => {
      const client = {deleteDocument: jest.fn().mockResolvedValue(undefined)};
      const saved = {witnessStatement: [{caseDocuments: [doc('a')]}, {caseDocuments: [doc('b'), doc('c')]}]};
      const updated = {witnessStatement: [{caseDocuments: [doc('a')]}]};

      await deleteRemovedDocuments(req, saved, updated, client);

      expect(client.deleteDocument.mock.calls.map((call: any[]) => call[1])).toEqual(['b', 'c']);
    });

    it('should never delete documents that are only in the posted form', async () => {
      const client = {deleteDocument: jest.fn().mockResolvedValue(undefined)};
      const saved = {witnessStatement: [{caseDocuments: [doc('a')]}]};
      const updated = {witnessStatement: [{caseDocuments: [doc('a'), doc('someone-elses')]}]};

      await deleteRemovedDocuments(req, saved, updated, client);

      expect(client.deleteDocument).not.toHaveBeenCalled();
    });

    it('should not throw when document management refuses a delete', async () => {
      const client = {deleteDocument: jest.fn().mockRejectedValue(new Error('403'))};
      const saved = {witnessStatement: [{caseDocuments: [doc('a')]}]};

      await expect(deleteRemovedDocuments(req, saved, {witnessStatement: []}, client)).resolves.toBeUndefined();
      expect(client.deleteDocument).toHaveBeenCalledWith(req, 'a');
    });
  });
});
