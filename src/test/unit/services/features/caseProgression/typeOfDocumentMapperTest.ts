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
    const result = TypeOfDocumentSectionMapper.mapToSingleFile(mockRequest);

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
    const result = TypeOfDocumentSectionMapper.mapToSingleFile(mockRequest);

    // Then
    expect(result).toBeUndefined();
  });
});

describe('TypeOfDocumentMapper mapToFiles', () => {
  const mockFile = (originalname: string) => ({
    fieldname: 'selectedFile',
    originalname,
    mimetype: 'application/pdf',
    size: 1024,
    buffer: Buffer.from('test pdf'),
  });

  it('should map every file from multer.array', () => {
    const mockRequest = {files: [mockFile('first.pdf'), mockFile('second.pdf')]} as unknown as Request;

    const result = TypeOfDocumentSectionMapper.mapToFiles(mockRequest);

    expect(result.map((file) => file.originalname)).toEqual(['first.pdf', 'second.pdf']);
  });

  it('should map the file from multer.single', () => {
    const mockRequest = {file: mockFile('only.pdf')} as Request;

    const result = TypeOfDocumentSectionMapper.mapToFiles(mockRequest);

    expect(result.map((file) => file.originalname)).toEqual(['only.pdf']);
  });

  it('should return no files when none are chosen', () => {
    expect(TypeOfDocumentSectionMapper.mapToFiles({} as Request)).toEqual([]);
  });
});
