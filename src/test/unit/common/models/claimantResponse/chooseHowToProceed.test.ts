import {ChooseHowProceed} from 'models/chooseHowProceed';
import {ChooseHowToProceed} from 'common/form/models/claimantResponse/chooseHowToProceed';

describe('constructor', () => {
  it('should create an instance of ChooseHowToProceed with a defined option', () => {
    // Given
    const option: ChooseHowProceed = ChooseHowProceed.SIGN_A_SETTLEMENT_AGREEMENT;

    // When
    const chooseHowToProceed = new ChooseHowToProceed(option);

    // Then
    expect(chooseHowToProceed.option).toEqual(option);
  });

  it('should create an instance of ChooseHowToProceed with an undefined option', () => {
    // Given
    const option: ChooseHowProceed = undefined;

    // When
    const chooseHowToProceed = new ChooseHowToProceed(option);

    // Then
    expect(chooseHowToProceed.option).toBeUndefined();
  });
});

describe('option', () => {
  it('should be defined', () => {
    // Given
    const chooseHowToProceed = new ChooseHowToProceed();

    // When
    chooseHowToProceed.option = ChooseHowProceed.SIGN_A_SETTLEMENT_AGREEMENT;

    // Then
    expect(chooseHowToProceed.option).toBeDefined();
  });

  it('should be undefined', () => {
    // Given
    const chooseHowToProceed = new ChooseHowToProceed(ChooseHowProceed.SIGN_A_SETTLEMENT_AGREEMENT);

    // When
    chooseHowToProceed.option = undefined;

    // Then
    expect(chooseHowToProceed.option).toBeUndefined();
  });
});
