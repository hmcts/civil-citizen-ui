import {BusinessProcess} from 'models/businessProcess';

describe('hasBusinessProcessFinished', () => {
  const businessProcess = new BusinessProcess();
  it('should return true when business process status is FINISHED', async() => {
    //Given
    businessProcess.status = 'FINISHED';
    //When
    const result = businessProcess.hasBusinessProcessFinished();
    //Then
    expect(result).toBe(true);
  });
  it('should return false when business process status is STARTED', async() => {
    //Given
    businessProcess.status = 'STARTED';
    //When
    const result = businessProcess.hasBusinessProcessFinished();
    //Then
    expect(result).toBe(false);
  });
});
