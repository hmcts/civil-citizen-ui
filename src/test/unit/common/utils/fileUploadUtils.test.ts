import {Request, Response, NextFunction} from 'express';
import {
  createMulterUpload,
  createMulterErrorMiddleware,
  createFileUploadError,
  getMulterErrorConstraint,
  extractCategoryAndIndex,
  createUploadOneFileError,
  uploadAndValidateFile,
} from 'common/utils/fileUploadUtils';
import {FILE_SIZE_LIMIT} from 'form/validators/isFileSize';

jest.mock('multer', () => {
  const mockMulter: any = jest.fn(() => ({
    any: jest.fn(() => jest.fn()),
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
  });
});
