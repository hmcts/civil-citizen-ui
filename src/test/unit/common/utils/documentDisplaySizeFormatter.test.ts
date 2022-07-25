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
});
