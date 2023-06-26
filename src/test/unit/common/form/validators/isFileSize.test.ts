import { validate } from 'class-validator';
import {IsFileSize} from 'form/validators/isFileSize';

describe('isFileSize validator', () => {
  it('should validate file if file size 100mb', async () => {
    //Given
    const fileSize = 100 * 1024 * 1024;
    const testObject = new TestFileSize();
    testObject.fileSize = fileSize;

    //When
    const validationErrors = await validate(testObject);

    //Then
    expect(validationErrors.length).toBe(0);
  });

  it('should invalidate if file size is above 100MB', async () => {
    //Given
    const fileSize = 101 * 1024 * 1024;
    const testObject = new TestFileSize();
    testObject.fileSize = fileSize;

    //When
    const validationErrors = await validate(testObject);

    //Then
    expect(validationErrors.length).toBe(1);
  });

  it('should validate if there is no file', async () => {
    //When
    const testObject = new TestFileSize();
    const validationErrors = await validate(testObject);

    //Then
    expect(validationErrors.length).toBe(0);
  });
});

class TestFileSize {
  @IsFileSize()
    fileSize: number;
}
