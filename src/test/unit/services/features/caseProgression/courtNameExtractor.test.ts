import {CourtNameExtractor} from 'services/features/caseProgression/courtNameExtractor';

describe('CourtNameExtractor Service', () => {
  it('should extract the CourtName correctly', async () => {
    //Given
    const courtName = 'test - test';
    const courtNameExpected = 'test';
    //When
    const courtNameResult = CourtNameExtractor.extractCourtName(courtName);
    //Then
    expect(courtNameExpected).toEqual(courtNameResult);
  });
});
