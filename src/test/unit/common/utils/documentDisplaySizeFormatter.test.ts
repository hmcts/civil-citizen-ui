import {displayDocumentSizeInKB} from '../../../../main/common/utils/documentSizeDisplayFormatter';

describe('display document in KB', ()=>{
  it('should display document size in KB successfully when size is greater than 0 and maximum decimal is specified ', ()=>{
    //Given
    const documentSizeInBytes = 1234;
    const decimal = 3;
    //When
    const sizeInKB = displayDocumentSizeInKB(documentSizeInBytes, decimal);
    //Then
    const expectedResult = '1.205 KB';
    expect(sizeInKB).toEqual(expectedResult);
  });
  it('should display document in KB successfully when size is greater than 0 and no decimal is specified', ()=>{
    //Given
    const documentSizeInBytes = 1024;
    //When
    const sizeInKB = displayDocumentSizeInKB(documentSizeInBytes);
    //Then
    const expectedResult = '1 KB';
    expect(sizeInKB).toEqual(expectedResult);
  });
  it('should display 0 KB when size is 0', ()=>{
    //Given
    const documentSizeInBytes = 0;
    //When
    const sizeInKB = displayDocumentSizeInKB(documentSizeInBytes);
    //Then
    const expectedResult = '0 KB';
    expect(sizeInKB).toEqual(expectedResult);
  });
});
