import {SpecificCourtLocation} from 'models/directionsQuestionnaire/hearing/specificCourtLocation';
import {YesNo} from 'form/models/yesNo';

describe('SpecificCourtLocation', ()=>{
  it('should return true when specific court location is required', ()=>{
    //Given
    const specificCourtLocation = new SpecificCourtLocation(YesNo.YES, 'location', 'reason');
    //When
    const specificCourtLocationIsRequired = specificCourtLocation.isSpecificCourtRequired();
    //Then
    expect(specificCourtLocationIsRequired).toBeTruthy();
  });
  it('should return false when specific court location is not required', ()=>{
    //Given
    const specificCourtLocation = new SpecificCourtLocation(YesNo.NO, 'location', 'reason');
    //When
    const specificCourtLocationIsRequired = specificCourtLocation.isSpecificCourtRequired();
    //Then
    expect(specificCourtLocationIsRequired).toBeFalsy();
  });
  it('should remove court location and reason when court location is not required', ()=>{
    //When
    const specificCourtLocation = new SpecificCourtLocation(YesNo.NO, 'location', 'reason');
    //Then
    expect(specificCourtLocation.reason).toBeUndefined();
    expect(specificCourtLocation.courtLocation).toBeUndefined();
  });
  it('should not remove court location and reason when court location is required', ()=>{
    //When
    const specificCourtLocation = new SpecificCourtLocation(YesNo.YES, 'location', 'reason');
    //Then
    expect(specificCourtLocation.reason).not.toBeUndefined();
    expect(specificCourtLocation.courtLocation).not.toBeUndefined();
  });
});
