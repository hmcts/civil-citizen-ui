import {UploadDocumentTypes, UploadEvidenceWitness} from 'models/caseProgression/uploadDocumentsType';
import {Document} from 'common/models/document/document';

jest.mock('@hmcts/nodejs-logging', () => {
  const logger = {warn: jest.fn(), error: jest.fn(), info: jest.fn(), debug: jest.fn()};
  return {Logger: {getLogger: () => logger}};
});
const mockLogger = require('@hmcts/nodejs-logging').Logger.getLogger();

describe('testing of UploadDocumentTypes class', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should return formatted created date when caseDocument is set', () => {
    const caseDocument = new UploadEvidenceWitness('name', new Date(2023, 3, 26), {} as Document, new Date(2023, 3, 26));
    expect(new UploadDocumentTypes(true, caseDocument).createdDateTimeFormatted).toBe('26 Apr 2023');
  });

  it('should return empty string and log warning when caseDocument is not set', () => {
    expect(new UploadDocumentTypes(true).createdDateTimeFormatted).toBe('');
    expect(mockLogger.warn).toHaveBeenCalledWith('[UploadDocumentTypes.createdDateTimeFormatted] caseDocument.createdDatetime missing, returning empty string');
  });
});
