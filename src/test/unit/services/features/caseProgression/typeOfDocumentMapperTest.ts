import { Request } from 'express';
import {TypeOfDocumentSectionMapper} from 'services/features/caseProgression/TypeOfDocumentSectionMapper';
describe('TypeOfDocumentMapper mapToSingleFile', () => {
  it('should map request to FileUpload object correctly', () => {
    // Given
    const mockFile = {
      fieldname: 'test',
      originalname: 'test.png',
      mimetype: 'image/png',
      size: 1024,
      buffer: Buffer.from('test png'),
    };
    const mockRequest = {
      file: mockFile,
    } as Request;

    // When
    const result = TypeOfDocumentSectionMapper.mapReqToSingleFile(mockRequest);

    // Then
    expect(result).toBeDefined();
    expect(result.fieldname).toEqual(mockFile.fieldname);
    expect(result.originalname).toEqual(mockFile.originalname);
    expect(result.mimetype).toEqual(mockFile.mimetype);
    expect(result.size).toEqual(mockFile.size);
    expect(result.buffer).toEqual(mockFile.buffer);
  });

  it('should return undefined if no request file', () => {
    // Given
    const mockRequest = {} as Request;

    // When
    const result = TypeOfDocumentSectionMapper.mapReqToSingleFile(mockRequest);

    // Then
    expect(result).toBeUndefined();
  });

  it('should map multer file to FileUpload object correctly', () => {
    // Given
    const mockFile = {
      fieldname: 'test',
      originalname: 'test.png',
      mimetype: 'image/png',
      size: 1024,
      buffer: Buffer.from('test png'),
    } as Express.Multer.File;

    // When
    const result = TypeOfDocumentSectionMapper.mapMulterFileToSingleFile(mockFile);

    // Then
    expect(result).toBeDefined();
    expect(result.fieldname).toEqual(mockFile.fieldname);
    expect(result.originalname).toEqual(mockFile.originalname);
    expect(result.mimetype).toEqual(mockFile.mimetype);
    expect(result.size).toEqual(mockFile.size);
    expect(result.buffer).toEqual(mockFile.buffer);
  });
});
