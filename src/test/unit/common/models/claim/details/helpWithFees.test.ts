import {YesNo} from '../../../../../../../src/main/common/form/models/yesNo';
import {HelpWithFees} from 'common/form/models/claim/details/helpWithFees';

describe('HelpWithFees', () => {
  it('should create an instance of HelpWithFees with the provided parameters', async () => {
    // Given
    const option = YesNo.YES;
    const referenceNumber = 'ABC123';
  
    // When
    const helpWithFees = new HelpWithFees(option, referenceNumber);
  
    // Then
    expect(helpWithFees.option).toEqual(option);
    expect(helpWithFees.referenceNumber).toEqual(referenceNumber);
  });
});
  