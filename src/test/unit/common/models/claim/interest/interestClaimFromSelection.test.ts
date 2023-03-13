import {InterestClaimFromSelection} from '../../../../../../main/common/form/models/claim/interest/interestClaimFromSelection';
import {InterestClaimFromType} from '../../../../../../main/common/form/models/claimDetails';
import {validate} from 'class-validator';

describe('InterestClaimFromSelection', () => {
  it('should validate the InterestClaimFromSelection class', async () => {
    //Given
    const option = InterestClaimFromType.FROM_CLAIM_SUBMIT_DATE;
    const interestClaimFromSelection = new InterestClaimFromSelection(option);

    //When
    const errors = await validate(interestClaimFromSelection);

    //Then
    expect(errors.length).toBe(0);
  });
});
