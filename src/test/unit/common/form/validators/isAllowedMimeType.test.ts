import { validate } from 'class-validator';
import {IsAllowedMimeType} from 'form/validators/isAllowedMimeType';
import {FileUpload} from 'models/caseProgression/uploadDocumentsUserForm';

describe('isAllowedMimeType validator', () => {
  it('should validate the allowed mime types', async () => {
    //Given
    const allowedMimeTypes: string[] = [
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document', // Word
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', // Excel
      'application/vnd.openxmlformats-officedocument.presentationml.presentation', // PowerPoint
      'application/pdf',
      'application/rtf',
      'text/plain',
      'text/csv',
      'image/jpeg',
      'image/png',
      'image/bmp',
      'image/tiff',
    ];

    for (const mimeType of allowedMimeTypes) {
      const testObject = new TestMimeType();
      testObject.mimeType = mimeType;

      //When
      const validationErrors = await validate(testObject);

      //Then
      expect(validationErrors.length).toBe(0);
    }
  });

  it('should invalidate any other mimetype', async () => {
    //Given
    const testObject = new TestMimeType();
    testObject.mimeType = 'invalid/mimeType';

    //When
    const validationErrors = await validate(testObject);

    //Then
    expect(validationErrors.length).toBe(1);
  });

  it('should invalidate any other mimetype for FileUpload', async () => {
    //Given
    const testObject = new TestFileUpload();
    testObject.fileUpload = new FileUpload();
    testObject.fileUpload.mimetype = 'any';

    //When
    const validationErrors = await validate(testObject);

    //Then
    expect(validationErrors.length).toBe(1);
  });

  it('should invalidate when mimetype is not provided', async () => {
    //Given
    const testObject = new TestMimeType();

    //When
    const validationErrors = await validate(testObject);

    //Then
    expect(validationErrors.length).toBe(1);
  });
});

class TestMimeType {
  @IsAllowedMimeType()
    mimeType: string;
}

class TestFileUpload {
  @IsAllowedMimeType()
    fileUpload: FileUpload;
}
