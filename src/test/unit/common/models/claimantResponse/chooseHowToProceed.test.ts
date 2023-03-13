import {ChooseHowProceed} from 'models/chooseHowProceed';
import {ChooseHowToProceed} from '../../../../../../src/main/common/form/models/claimantResponse/chooseHowToProceed';

describe('ChooseHowToProceed constructor', () => {
  let option: ChooseHowProceed;
        
  describe('Given a valid option parameter', () => {
    //Given
    beforeEach(() => {
      option = ChooseHowProceed.SIGN_A_SETTLEMENT_AGREEMENT;
    });
    //When
    let result: ChooseHowToProceed;
        
    beforeEach(() => {
      result = new ChooseHowToProceed(option);
    });
    //Then
    it('should have the same option property value as the input', async () => {
      expect(result.option).toEqual(option);
    });
  });
});
        
describe('Given an undefined option parameter', () => {
  //Given
  let result: ChooseHowToProceed;
  //When
  beforeEach(() => {
    result = new ChooseHowToProceed();
  });
  //Then
  it('should have an undefined option property', async () => {
    expect(result.option).toBeUndefined();
  });
});