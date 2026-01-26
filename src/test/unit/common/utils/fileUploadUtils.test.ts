import {Request, Response, NextFunction} from 'express';
import {
  createMulterUpload,
  createMulterErrorMiddleware,
  createFileUploadError,
  getMulterErrorConstraint,
  extractCategoryAndIndex,
  createUploadOneFileError,
  handleMulterError,
  handleMulterErrorForForm,
} from 'common/utils/fileUploadUtils';
import {FILE_SIZE_LIMIT} from 'form/validators/isFileSize';

jest.mock('multer', () => {
  const mockMulter: any = jest.fn(() => ({
    any: jest.fn(() => jest.fn()),
  }));
  mockMulter.memoryStorage = jest.fn(() => ({}));
  return mockMulter;
});

jest.mock('i18next', () => ({
  t: (key: string) => key,
  use: jest.fn(),
}));

jest.mock('services/features/generalApplication/uploadEvidenceDocumentService', () => ({
  translateErrors: (errors: any[]) => errors.map((error) => ({
    ...error,
    text: error.text || error.constraints?.[Object.keys(error.constraints || {})[0]] || 'Translated error',
  })),
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

  describe('handleMulterError', () => {
    let mockReq: Partial<Request>;

    beforeEach(() => {
      jest.clearAllMocks();
      mockReq = {
        session: {} as any,
      };
    });

    it('should return null when no multer error exists', () => {
      const result = handleMulterError(mockReq as Request);
      expect(result).toBeNull();
      expect((mockReq.session as any)?.fileUpload).toBeUndefined();
    });

    it('should handle multer error and store in session', () => {
      const multerError = {
        code: 'LIMIT_FILE_SIZE',
        message: 'File too large',
      };
      (mockReq as any).multerError = multerError;

      const result = handleMulterError(mockReq as Request);

      expect(result).not.toBeNull();
      expect(Array.isArray(result)).toBe(true);
      expect((mockReq.session as any)?.fileUpload).toBeDefined();
      const sessionData = JSON.parse((mockReq.session as any)?.fileUpload as string);
      expect(sessionData).toBeInstanceOf(Array);
      expect(sessionData.length).toBeGreaterThan(0);
      expect(sessionData[0]).toHaveProperty('property', 'fileUpload');
    });

    it('should handle multer error with LIMIT_UNEXPECTED_FILE code', () => {
      const multerError = {
        code: 'LIMIT_UNEXPECTED_FILE',
        message: 'Unexpected file',
      };
      (mockReq as any).multerError = multerError;

      const result = handleMulterError(mockReq as Request);

      expect(result).not.toBeNull();
      expect((mockReq.session as any)?.fileUpload).toBeDefined();
    });

    it('should handle multer error with unknown code', () => {
      const multerError = {
        code: 'UNKNOWN_ERROR',
        message: 'Unknown error',
      };
      (mockReq as any).multerError = multerError;

      const result = handleMulterError(mockReq as Request);

      expect(result).not.toBeNull();
      expect((mockReq.session as any)?.fileUpload).toBeDefined();
    });

    it('should handle multer error without session', () => {
      const multerError = {
        code: 'LIMIT_FILE_SIZE',
        message: 'File too large',
      };
      const reqWithoutSession = {multerError} as any;
      delete reqWithoutSession.session;

      const result = handleMulterError(reqWithoutSession as Request);

      expect(result).not.toBeNull();
      expect(Array.isArray(result)).toBe(true);
    });
  });

  describe('handleMulterErrorForForm', () => {
    let mockReq: Partial<Request>;
    let mockForm: {errors?: any[]};

    beforeEach(() => {
      mockReq = {};
      mockForm = {};
    });

    it('should return false when no multer error exists', () => {
      const result = handleMulterErrorForForm(mockReq as Request, 'documentsReferred[0][uploadButton]', mockForm);
      expect(result).toBe(false);
      expect(mockForm.errors).toBeUndefined();
    });

    it('should return false when action does not include uploadButton', () => {
      (mockReq as any).multerError = {code: 'LIMIT_FILE_SIZE'};
      const result = handleMulterErrorForForm(mockReq as Request, 'someOtherAction', mockForm);
      expect(result).toBe(false);
    });

    it('should handle multer error and add to form errors', () => {
      const multerError = {
        code: 'LIMIT_FILE_SIZE',
        message: 'File too large',
      };
      (mockReq as any).multerError = multerError;

      const result = handleMulterErrorForForm(mockReq as Request, 'documentsReferred[0][uploadButton]', mockForm);

      expect(result).toBe(true);
      expect(mockForm.errors).toBeDefined();
      expect(mockForm.errors?.length).toBe(1);
      expect(mockForm.errors?.[0].property).toBe('documentsReferred');
      expect(mockForm.errors?.[0].children).toBeDefined();
    });

    it('should initialize errors array if it does not exist', () => {
      const multerError = {
        code: 'LIMIT_FILE_SIZE',
        message: 'File too large',
      };
      (mockReq as any).multerError = multerError;
      mockForm.errors = undefined;

      handleMulterErrorForForm(mockReq as Request, 'witnessStatement[1][uploadButton]', mockForm);

      expect(mockForm.errors).toBeDefined();
      expect(mockForm.errors?.length).toBe(1);
    });

    it('should handle different categories and indices', () => {
      const multerError = {
        code: 'LIMIT_FILE_SIZE',
        message: 'File too large',
      };
      (mockReq as any).multerError = multerError;

      handleMulterErrorForForm(mockReq as Request, 'expertReport[2][uploadButton]', mockForm);

      expect(mockForm.errors?.[0].property).toBe('expertReport');
      expect(mockForm.errors?.[0].children?.[0].property).toBe('2');
    });
  });
});
