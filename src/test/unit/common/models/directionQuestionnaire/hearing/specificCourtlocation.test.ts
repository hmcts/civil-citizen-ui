import {SpecificCourtLocation} from 'models/directionsQuestionnaire/hearing/specificCourtLocation';
import {YesNo} from 'form/models/yesNo';

function memoize<Input, Result>(fn: (input: Input) => Result) {
  const memoMap = new Map<Input, Result>()
  return function (input: Input): Result {
    if (memoMap.has(input)) return memoMap.get(input)!
    const result = fn(input)
    memoMap.set(input, result)
    return result
  }
}


describe('SpecificCourtLocation', ()=>{
  it('should return true when specific court location is required', ()=>{
    //Given
    const specificCourtLocation = new SpecificCourtLocation(YesNo.YES, 'location', 'reason');
    const specificCourtLocationMemoizedYes = memoize(specificCourtLocation);
    //When
    const specificCourtLocationIsRequired = specificCourtLocation.isSpecificCourtRequired();
    //Then
    expect(specificCourtLocationIsRequired).toBeTruthy();
  });
  it('should return false when specific court location is not required', ()=>{
    //Given
    const specificCourtLocation = new SpecificCourtLocation(YesNo.NO, 'location', 'reason');
    const specificCourtLocationMemoizedNO = memoize(specificCourtLocation);
    //When
    const specificCourtLocationIsRequired = specificCourtLocation.isSpecificCourtRequired();
    //Then
    expect(specificCourtLocationIsRequired).toBeFalsy();
  });
  it('should remove court location and reason when court location is not required', ()=>{
    expect(specificCourtLocationMemoizedNO.reason).toBeUndefined();
    expect(specificCourtLocationMemoizedNO.courtLocation).toBeUndefined();
  });
  it('should not remove court location and reason when court location is required', ()=>{
    expect(specificCourtLocationMemoizedYes.reason).not.toBeUndefined();
    expect(specificCourtLocationMemoizedYes.courtLocation).not.toBeUndefined();
  });
});
