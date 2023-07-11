import { generatePcqId } from 'client/pcq/generatePcqId';
import * as uuid from 'uuid';

jest.mock('uuid');

describe('Generate PCQ ID', () => {
  it('should generate a new pcq id', async () =>{
    //Given
    const uuidSpy = jest.spyOn(uuid, 'v4');
    //When
    generatePcqId();
    //Then
    expect(uuidSpy).toHaveBeenCalledTimes(1);

  });
});
