import {YesNo} from '../../../../../../src/main/common//form/models/yesNo';
import {DefendantDOB} from '../../../../../../src/main/common/models/claimantResponse/ccj/defendantDOB';
import {DateOfBirth} from '../../../../../../src/main/common/models/claimantResponse/ccj/dateOfBirth';

describe('DefendantDOB', () => {
  describe('constructor', () => {
    it('should set option and dob when option is Yes', async () => {

      //Given
      const dateOfBirth = new DateOfBirth();

      //When
      const defendantDOB = new DefendantDOB(YesNo.YES, dateOfBirth);

      //Then
      expect(defendantDOB.option).toEqual(YesNo.YES);
      expect(defendantDOB.dob).toEqual(dateOfBirth);
    });

    it('should set option and dob to undefined when option is No', async () => {

      //When
      const defendantDOB = new DefendantDOB(YesNo.NO);

      //Then
      expect(defendantDOB.option).toEqual(YesNo.NO);
      expect(defendantDOB.dob).toBeUndefined();
    });
  });
});
