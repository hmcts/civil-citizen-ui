import {CourtNameExtractor} from 'services/features/caseProgression/courtNameExtractor';

describe('HearingDateTimeFormatter Service', () => {
  it('should extract the CourtName correctly', async () => {
    //Given
    const countName = 'test - test';
    const countNameExpected = 'test';
    //When
    const courtNameResult = CourtNameExtractor.extractCourtName(countName);
    //Then
    expect(countNameExpected).toEqual(courtNameResult);
  });

});
