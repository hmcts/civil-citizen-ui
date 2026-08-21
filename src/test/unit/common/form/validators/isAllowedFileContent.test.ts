import {validate} from 'class-validator';
import {IsAllowedFileContent} from 'form/validators/isAllowedFileContent';
import {MINIMAL_PDF_BUFFER, SPOOFED_PDF_BUFFER} from '../../../utils/fileContentFixtures';

describe('isAllowedFileContent validator', () => {
  it('should validate when buffer magic bytes match the declared mime type', async () => {
    const testObject = new TestFileContent();
    testObject.mimetype = 'application/pdf';
    testObject.buffer = MINIMAL_PDF_BUFFER;

    const validationErrors = await validate(testObject);

    expect(validationErrors.length).toBe(0);
  });

  it('should invalidate when Content-Type is spoofed as application/pdf but content is not a PDF', async () => {
    const testObject = new TestFileContent();
    testObject.mimetype = 'application/pdf';
    testObject.buffer = SPOOFED_PDF_BUFFER;

    const validationErrors = await validate(testObject);

    expect(validationErrors.length).toBe(1);
    expect(validationErrors[0].property).toBe('buffer');
    expect(validationErrors[0].constraints).toHaveProperty('isAllowedFileContent');
  });
});

class TestFileContent {
  mimetype: string;

  @IsAllowedFileContent({message: 'ERRORS.VALID_MIME_TYPE_FILE'})
    buffer: Buffer;
}
