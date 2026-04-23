import { generatePcqId } from 'client/pcq/generatePcqId';
import * as crypto from 'crypto';

describe('Generate PCQ ID', () => {
  it('should generate a new pcq id', async () =>{
    //Given
    const uuidSpy = jest.spyOn(crypto, 'randomUUID');
    //When
    generatePcqId();
    //Then
    expect(uuidSpy).toHaveBeenCalledTimes(1);

  });
});
