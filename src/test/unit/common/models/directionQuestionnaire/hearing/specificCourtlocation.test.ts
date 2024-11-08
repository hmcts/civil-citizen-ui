import {SpecificCourtLocation} from 'models/directionsQuestionnaire/hearing/specificCourtLocation';

describe('SpecificCourtLocation', ()=>{

  it('should remove court location and reason when court location is not required', ()=>{
    //When
    const specificCourtLocation = new SpecificCourtLocation('location', 'reason');
    //Then
    expect(specificCourtLocation.reason).toBeUndefined();
    expect(specificCourtLocation.courtLocation).toBeUndefined();
  });
  it('should not remove court location and reason when court location is required', ()=>{
    //When
    const specificCourtLocation = new SpecificCourtLocation('location', 'reason');
    //Then
    expect(specificCourtLocation.reason).not.toBeUndefined();
    expect(specificCourtLocation.courtLocation).not.toBeUndefined();
  });
});
